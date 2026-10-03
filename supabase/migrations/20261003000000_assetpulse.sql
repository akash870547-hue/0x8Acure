create table if not exists public.monitored_domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  root_domain varchar(253) not null,
  status text not null default 'active' check (status in ('active', 'paused')),
  check_frequency integer not null default 24 check (check_frequency in (2, 24)),
  last_scanned_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, root_domain)
);

create table if not exists public.discovered_assets (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.monitored_domains(id) on delete cascade,
  subdomain varchar(253) not null,
  ip_address varchar(45),
  http_status integer,
  page_title text,
  ssl_issuer varchar(512),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  is_new boolean not null default true,
  unique (domain_id, subdomain)
);

create table if not exists public.alert_destinations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_type text not null check (channel_type in ('telegram', 'discord')),
  destination_id text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, channel_type, destination_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  razorpay_subscription_id varchar(128) unique,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'agency')),
  max_domains integer not null default 2 check (max_domains >= 0),
  status varchar(32) not null default 'active',
  updated_at timestamptz not null default now()
);

create table if not exists public.telegram_link_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists monitored_domains_due_idx
  on public.monitored_domains (status, last_scanned_at);
create index if not exists discovered_assets_domain_seen_idx
  on public.discovered_assets (domain_id, first_seen desc);
create index if not exists telegram_link_tokens_expiry_idx
  on public.telegram_link_tokens (expires_at) where consumed_at is null;

create or replace function public.assetpulse_enforce_domain_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  domain_limit integer;
  scan_hours integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  select case
    when s.status = 'active' and s.plan_tier in ('pro', 'agency') then s.max_domains
    else 2
  end
  into domain_limit
  from public.subscriptions s
  where s.user_id = new.user_id;
  domain_limit := coalesce(domain_limit, 2);

  if tg_op = 'INSERT' and
    (select count(*) from public.monitored_domains d where d.user_id = new.user_id) >= domain_limit then
    raise exception 'Domain limit reached for your current plan';
  end if;
  if tg_op = 'UPDATE' and new.status = 'active' and old.status <> 'active' and
    (select count(*) from public.monitored_domains d where d.user_id = new.user_id and d.status = 'active' and d.id <> new.id) >= domain_limit then
    raise exception 'Active domain limit reached for your current plan';
  end if;

  scan_hours := case
    when exists (
      select 1 from public.subscriptions s
      where s.user_id = new.user_id
        and s.status = 'active'
        and s.plan_tier in ('pro', 'agency')
    ) then 2
    else 24
  end;
  new.check_frequency := scan_hours;
  return new;
end;
$$;

drop trigger if exists monitored_domains_plan_guard on public.monitored_domains;
create trigger monitored_domains_plan_guard
before insert or update of user_id, check_frequency, status on public.monitored_domains
for each row execute function public.assetpulse_enforce_domain_limit();

create or replace function public.assetpulse_sync_domain_frequency()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  with ranked_domains as (
    select id, row_number() over (order by created_at, id) as position
    from public.monitored_domains
    where user_id = new.user_id
  )
  update public.monitored_domains d
  set check_frequency = case
        when new.status = 'active' and new.plan_tier in ('pro', 'agency') then 2
        else 24
      end,
      status = case
        when new.status = 'active' and new.plan_tier in ('pro', 'agency') then d.status
        when ranked_domains.position <= 2 then d.status
        else 'paused'
      end
  from ranked_domains
  where d.id = ranked_domains.id;
  return new;
end;
$$;

drop trigger if exists subscriptions_sync_assetpulse_frequency on public.subscriptions;
create trigger subscriptions_sync_assetpulse_frequency
after insert or update of plan_tier, status on public.subscriptions
for each row execute function public.assetpulse_sync_domain_frequency();

alter table public.monitored_domains enable row level security;
alter table public.discovered_assets enable row level security;
alter table public.alert_destinations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.telegram_link_tokens enable row level security;

drop policy if exists "Users manage their monitored domains" on public.monitored_domains;
create policy "Users manage their monitored domains" on public.monitored_domains
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users view assets for their domains" on public.discovered_assets;
create policy "Users view assets for their domains" on public.discovered_assets
for select to authenticated using (
  exists (select 1 from public.monitored_domains d where d.id = domain_id and d.user_id = auth.uid())
);

drop policy if exists "Users manage their alert destinations" on public.alert_destinations;
create policy "Users manage their alert destinations" on public.alert_destinations
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users view their subscription" on public.subscriptions;
create policy "Users view their subscription" on public.subscriptions
for select to authenticated using (auth.uid() = user_id);

revoke all on public.monitored_domains, public.discovered_assets, public.alert_destinations,
  public.subscriptions, public.telegram_link_tokens from anon, authenticated;
grant select, insert, update, delete on public.monitored_domains to authenticated;
grant select on public.discovered_assets to authenticated;
grant select, insert, update, delete on public.alert_destinations to authenticated;
grant select on public.subscriptions to authenticated;
grant all on public.monitored_domains, public.discovered_assets, public.alert_destinations,
  public.subscriptions, public.telegram_link_tokens to service_role;

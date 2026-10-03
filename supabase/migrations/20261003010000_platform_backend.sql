create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dpdp_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_rooms jsonb not null default '[]'::jsonb check (jsonb_typeof(completed_rooms) = 'array'),
  quiz_scores jsonb not null default '{}'::jsonb check (jsonb_typeof(quiz_scores) = 'object'),
  bookmarks jsonb not null default '[]'::jsonb check (jsonb_typeof(bookmarks) = 'array'),
  last_active timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.breach_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_tier text not null,
  affected_count bigint not null check (affected_count > 0),
  data_types text[] not null default '{}',
  calculated_penalty_min numeric(18, 2) not null check (calculated_penalty_min >= 0),
  calculated_penalty_max numeric(18, 2) not null check (calculated_penalty_max >= calculated_penalty_min),
  risk_score integer not null check (risk_score between 0 and 100),
  scenario_data jsonb not null default '{}'::jsonb,
  executive_memo text,
  created_at timestamptz not null default now()
);

create table if not exists public.forensic_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_name text not null check (char_length(trim(case_name)) between 1 and 200),
  evidence_hash text,
  timeline_data jsonb not null default '{}'::jsonb,
  ioc_findings jsonb not null default '[]'::jsonb,
  report_markdown text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null unique,
  payment_id text unique,
  amount integer not null check (amount > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'created' check (status in ('created', 'paid', 'failed', 'refunded', 'cancelled')),
  service_type text not null check (service_type in ('instant_audit_report', 'pro_dpdp_pack')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists breach_assessments_user_created_idx
  on public.breach_assessments (user_id, created_at desc);
create index if not exists forensic_cases_user_updated_idx
  on public.forensic_cases (user_id, updated_at desc);
create index if not exists transactions_user_created_idx
  on public.transactions (user_id, created_at desc);

create or replace function public.sync_user_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = case when excluded.full_name <> '' then excluded.full_name else public.user_profiles.full_name end,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists auth_user_sync_platform_profile on auth.users;
create trigger auth_user_sync_platform_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_user_profile_from_auth();

insert into public.user_profiles (id, email, full_name, role)
select u.id,
       coalesce(u.email, ''),
       coalesce(nullif(p.name, ''), nullif(u.raw_user_meta_data ->> 'full_name', ''), nullif(u.raw_user_meta_data ->> 'name', ''), split_part(coalesce(u.email, ''), '@', 1)),
       case when lower(coalesce(p.role, '')) = 'admin' then 'admin' else 'user' end
from auth.users u
left join public.profiles p on p.id = u.id
on conflict (id) do update
set email = excluded.email,
    full_name = case when excluded.full_name <> '' then excluded.full_name else public.user_profiles.full_name end,
    role = excluded.role,
    updated_at = now();

alter table public.user_profiles enable row level security;
alter table public.dpdp_progress enable row level security;
alter table public.breach_assessments enable row level security;
alter table public.forensic_cases enable row level security;
alter table public.transactions enable row level security;

revoke all on public.user_profiles, public.dpdp_progress, public.breach_assessments,
  public.forensic_cases, public.transactions from anon, authenticated;
grant select on public.user_profiles to authenticated;
grant select, insert, update on public.dpdp_progress to authenticated;
grant select, insert on public.breach_assessments to authenticated;
grant select, insert, update, delete on public.forensic_cases to authenticated;
grant select on public.transactions to authenticated;
grant all on public.user_profiles, public.dpdp_progress, public.breach_assessments,
  public.forensic_cases, public.transactions to service_role;

drop policy if exists "Users view own platform profile" on public.user_profiles;
create policy "Users view own platform profile" on public.user_profiles
for select to authenticated using (auth.uid() = id);

drop policy if exists "Users manage own learning progress" on public.dpdp_progress;
create policy "Users manage own learning progress" on public.dpdp_progress
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users view own breach assessments" on public.breach_assessments;
create policy "Users view own breach assessments" on public.breach_assessments
for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users create own breach assessments" on public.breach_assessments;
create policy "Users create own breach assessments" on public.breach_assessments
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users manage own forensic cases" on public.forensic_cases;
create policy "Users manage own forensic cases" on public.forensic_cases
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users view own transactions" on public.transactions;
create policy "Users view own transactions" on public.transactions
for select to authenticated using (auth.uid() = user_id);

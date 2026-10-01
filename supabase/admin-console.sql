-- 0x8Acure Admin Command Center migration
-- Run after supabase/schema.sql and seed files.
-- No service-role key or admin password belongs in this file.

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists account_status text not null default 'active';
alter table public.quiz_questions add column if not exists options jsonb not null default '[]'::jsonb;
alter table public.quiz_questions add column if not exists explanation text not null default '';
alter table public.quiz_questions add column if not exists category text not null default 'General';
alter table public.quiz_questions add column if not exists xp_value integer not null default 10;
create unique index if not exists profiles_username_lower_idx on public.profiles(lower(username)) where username is not null;

update public.profiles set username=lower(split_part(email,'@',1)) where username is null;

create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  status text not null default 'success' check(status in('success','failed')),
  ip_address inet,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_activity_created_idx on public.admin_activity(created_at desc);
create index if not exists admin_activity_user_idx on public.admin_activity(user_id);

create table if not exists public.badge_catalog (
  badge_id text primary key,
  name text not null,
  description text not null default '',
  icon_svg text not null default '',
  xp_reward integer not null default 0 check(xp_reward >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_badge_awards (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null references public.badge_catalog(badge_id) on delete cascade,
  awarded_by uuid references auth.users(id) on delete set null,
  awarded_at timestamptz not null default now(),
  primary key(user_id,badge_id)
);

create table if not exists public.drive_links (
  slug text primary key,
  label text not null,
  url text not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.admin_activity enable row level security;
alter table public.badge_catalog enable row level security;
alter table public.admin_badge_awards enable row level security;
alter table public.drive_links enable row level security;

revoke all on public.admin_activity,public.badge_catalog,public.admin_badge_awards,public.drive_links from anon,authenticated;
grant select,insert on public.admin_activity to authenticated;
grant select,insert,update,delete on public.badge_catalog to authenticated;
grant select,insert,delete on public.admin_badge_awards to authenticated;
grant select,insert,update,delete on public.drive_links to authenticated;

create policy admin_activity_admin on public.admin_activity for all to authenticated
using((select private.is_admin())) with check((select private.is_admin()));
create policy badge_catalog_admin on public.badge_catalog for all to authenticated
using((select private.is_admin())) with check((select private.is_admin()));
create policy admin_badge_awards_admin on public.admin_badge_awards for all to authenticated
using((select private.is_admin())) with check((select private.is_admin()));
create policy drive_links_admin on public.drive_links for all to authenticated
using((select private.is_admin())) with check((select private.is_admin()));

-- Publicly usable login resolver. It returns only an email for a matching active account.
create or replace function public.resolve_login_email(p_login text)
returns text language sql security definer set search_path=''
as $$
  select p.email from public.profiles p
  where p.account_status='active'
    and (lower(p.email)=lower(trim(p_login)) or lower(p.username)=lower(trim(p_login)))
  limit 1;
$$;
revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon,authenticated;

create or replace function public.admin_dashboard()
returns jsonb language plpgsql security definer set search_path=''
as $$
declare outv jsonb;
begin
  if not(select private.is_admin()) then raise exception 'Admin role required'; end if;
  select jsonb_build_object(
    'users',(select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at desc),'[]'::jsonb) from public.profiles p),
    'room_progress',(select coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) from public.room_progress r),
    'room_attempts',(select coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) from public.room_attempts r),
    'certificates',(select coalesce(jsonb_agg(to_jsonb(c)),'[]'::jsonb) from public.certificates c),
    'activity',(select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at desc),'[]'::jsonb) from public.admin_activity a),
    'badges',(select coalesce(jsonb_agg(jsonb_build_object('user_id',a.user_id,'badge_id',a.badge_id,'awarded_at',a.awarded_at,'name',b.name,'description',b.description,'xp_reward',b.xp_reward)),'[]'::jsonb) from public.admin_badge_awards a join public.badge_catalog b on b.badge_id=a.badge_id),
    'badge_catalog',(select coalesce(jsonb_agg(to_jsonb(b) order by b.name),'[]'::jsonb) from public.badge_catalog b),
    'drive_links',(select coalesce(jsonb_agg(to_jsonb(d) order by d.slug),'[]'::jsonb) from public.drive_links d),
    'quiz_questions',(select coalesce(jsonb_agg(to_jsonb(q) order by q.created_at desc),'[]'::jsonb) from public.quiz_questions q)
  ) into outv;
  return outv;
end$$;
revoke all on function public.admin_dashboard() from public,anon;
grant execute on function public.admin_dashboard() to authenticated;

create or replace function public.admin_update_user(p_user_id uuid,p_role text default null,p_status text default null)
returns boolean language plpgsql security definer set search_path=''
as $$
begin
  if not(select private.is_admin()) then raise exception 'Admin role required'; end if;
  if p_user_id=(select auth.uid()) and coalesce(lower(p_role),'admin')<>'admin' then raise exception 'You cannot remove your own admin role'; end if;
  update public.profiles set
    role=coalesce(lower(p_role),role),
    account_status=coalesce(lower(p_status),account_status),
    updated_at=now()
  where id=p_user_id;
  return found;
end$$;
revoke all on function public.admin_update_user(uuid,text,text) from public,anon;
grant execute on function public.admin_update_user(uuid,text,text) to authenticated;

create or replace function public.admin_soft_delete_user(p_user_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
begin
  if not(select private.is_admin()) then raise exception 'Admin role required'; end if;
  if p_user_id=(select auth.uid()) then raise exception 'You cannot delete your own account'; end if;
  update public.profiles set account_status='deleted',updated_at=now() where id=p_user_id;
  return found;
end$$;
revoke all on function public.admin_soft_delete_user(uuid) from public,anon;
grant execute on function public.admin_soft_delete_user(uuid) to authenticated;

create or replace function public.admin_log_activity(p_user_id uuid,p_action text,p_status text default 'success',p_metadata jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path=''
as $$
declare aid uuid;
begin
  if p_user_id<>(select auth.uid()) and not(select private.is_admin()) then raise exception 'Not allowed'; end if;
  insert into public.admin_activity(user_id,action,status,metadata) values(p_user_id,p_action,lower(p_status),coalesce(p_metadata,'{}'::jsonb)) returning id into aid;
  return aid;
end$$;
revoke all on function public.admin_log_activity(uuid,text,text,jsonb) from public;
grant execute on function public.admin_log_activity(uuid,text,text,jsonb) to authenticated;

create or replace function public.admin_issue_certificate(p_user_id uuid,p_type text,p_course text,p_score integer,p_issue_date date)
returns public.certificates language plpgsql security definer set search_path=''
as $$
declare c public.certificates; cid text;
begin
  if not(select private.is_admin()) then raise exception 'Admin role required'; end if;
  if p_score<0 or p_score>100 then raise exception 'Score must be between 0 and 100'; end if;
  if not exists(select 1 from public.profiles where id=p_user_id and account_status='active') then raise exception 'User not found or inactive'; end if;
  cid:='0x8A-CERT-'||to_char(coalesce(p_issue_date,current_date),'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.certificates(certificate_id,user_id,certificate_type,course,score_percent,completion_date,verification_hash)
  values(cid,p_user_id,initcap(p_type),p_course,p_score,coalesce(p_issue_date,current_date),encode(digest(cid||p_user_id::text,'sha256'),'hex'))
  returning * into c;
  return c;
end$$;
revoke all on function public.admin_issue_certificate(uuid,text,text,integer,date) from public,anon;
grant execute on function public.admin_issue_certificate(uuid,text,text,integer,date) to authenticated;

create or replace function public.admin_seed_badge(p_badge_id text,p_name text,p_description text,p_icon_svg text,p_xp integer)
returns public.badge_catalog language plpgsql security definer set search_path=''
as $$
declare b public.badge_catalog;
begin
  if not(select private.is_admin()) then raise exception 'Admin role required'; end if;
  insert into public.badge_catalog(badge_id,name,description,icon_svg,xp_reward)
  values(lower(trim(p_badge_id)),trim(p_name),coalesce(p_description,''),coalesce(p_icon_svg,''),greatest(0,p_xp))
  on conflict(badge_id) do update set name=excluded.name,description=excluded.description,icon_svg=excluded.icon_svg,xp_reward=excluded.xp_reward
  returning * into b;
  return b;
end$$;
revoke all on function public.admin_seed_badge(text,text,text,text,integer) from public,anon;
grant execute on function public.admin_seed_badge(text,text,text,text,integer) to authenticated;

insert into public.badge_catalog(badge_id,name,description,xp_reward)
values
('kernel-slayer','Kernel Slayer','Advanced systems challenge completed.',100),
('packet-sniffer-pro','Packet Sniffer Pro','Network analysis milestone.',75),
('forensic-investigator','Forensic Investigator','Digital forensics milestone.',100)
on conflict(badge_id) do nothing;

insert into public.drive_links(slug,label,url)
values
('ceh','CEH v13 Master Prep Drive',''),
('chfi','CHFI Digital Forensics Drive',''),
('cloud','Cloud Security Engineering Drive','')
on conflict(slug) do nothing;

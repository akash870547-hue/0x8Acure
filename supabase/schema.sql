-- 0x8Acure Supabase schema
-- Run this in Supabase SQL Editor before enabling production auth.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null,
  consent_at timestamptz not null,
  privacy_version text not null default '2026-09-30',
  leaderboard_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id text not null,
  completed boolean not null default false,
  xp integer not null default 0 check (xp >= 0),
  attempts integer not null default 0 check (attempts >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, room_id)
);

create table if not exists public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null,
  answer jsonb,
  correct boolean not null default false,
  points integer not null default 0 check (points >= 0),
  submitted_at timestamptz not null default now()
);

create index if not exists task_submissions_user_task_idx
  on public.task_submissions(user_id, task_id, submitted_at desc);

create table if not exists public.badges_earned (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table if not exists public.certificates (
  certificate_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course text not null,
  issued_at timestamptz not null default now(),
  verification_hash text not null unique
);

alter table public.profiles enable row level security;
alter table public.room_progress enable row level security;
alter table public.task_submissions enable row level security;
alter table public.badges_earned enable row level security;
alter table public.certificates enable row level security;

revoke all on public.profiles, public.room_progress, public.task_submissions,
  public.badges_earned, public.certificates from anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.room_progress to authenticated;
grant select, insert, update, delete on public.task_submissions to authenticated;
grant select, insert, update, delete on public.badges_earned to authenticated;

-- Users can only access their own rows.
create policy profiles_select_own on public.profiles for select
  to authenticated using (auth.uid() = id);
create policy profiles_insert_own on public.profiles for insert
  to authenticated with check (auth.uid() = id);
create policy profiles_update_own on public.profiles for update
  to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy profiles_delete_own on public.profiles for delete
  to authenticated using (auth.uid() = id);

create policy room_progress_select_own on public.room_progress for select
  to authenticated using (auth.uid() = user_id);
create policy room_progress_insert_own on public.room_progress for insert
  to authenticated with check (auth.uid() = user_id);
create policy room_progress_update_own on public.room_progress for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy room_progress_delete_own on public.room_progress for delete
  to authenticated using (auth.uid() = user_id);

create policy task_submissions_select_own on public.task_submissions for select
  to authenticated using (auth.uid() = user_id);
create policy task_submissions_insert_own on public.task_submissions for insert
  to authenticated with check (auth.uid() = user_id);
create policy task_submissions_update_own on public.task_submissions for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy task_submissions_delete_own on public.task_submissions for delete
  to authenticated using (auth.uid() = user_id);

create policy badges_select_own on public.badges_earned for select
  to authenticated using (auth.uid() = user_id);
create policy badges_insert_own on public.badges_earned for insert
  to authenticated with check (auth.uid() = user_id);
create policy badges_delete_own on public.badges_earned for delete
  to authenticated using (auth.uid() = user_id);

-- Certificates are intentionally NOT directly readable through the Data API.
-- Public verification uses the exact certificate ID through the RPC below.
revoke all on public.certificates from anon, authenticated;

create or replace function public.verify_certificate(p_certificate_id text)
returns table (
  certificate_id text,
  course text,
  issued_at timestamptz,
  verification_hash text,
  holder_name text
)
language sql
security definer
set search_path = public
as $$
  select c.certificate_id, c.course, c.issued_at, c.verification_hash, p.name
  from public.certificates c
  join public.profiles p on p.id = c.user_id
  where c.certificate_id = p_certificate_id
  limit 1;
$$;

revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- Keep profile timestamps current.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists room_progress_updated_at on public.room_progress;
create trigger room_progress_updated_at before update on public.room_progress
for each row execute function public.set_updated_at();

-- Prevent clients from changing certificate records.
revoke insert, update, delete on public.certificates from anon, authenticated;

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
grant select on public.certificates to authenticated;
create policy certificates_select_own on public.certificates for select
  to authenticated using (auth.uid() = user_id);

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


-- Production hardening and admin/RPC layer.
alter table public.profiles add column if not exists role text not null default 'learner';
alter table public.profiles add column if not exists xp integer not null default 0;
alter table public.profiles add column if not exists streak integer not null default 0;
alter table public.profiles add column if not exists last_active_date date;
alter table public.room_progress add column if not exists best_score integer not null default 0;
alter table public.room_progress add column if not exists completed_at timestamptz;

create table if not exists public.room_catalog(
 room_id text primary key,path_id text not null,module_id text not null,title text not null,created_at timestamptz not null default now()
);
create table if not exists public.quiz_questions(
 question_id text primary key,room_id text not null references public.room_catalog(room_id) on delete cascade,
 type text not null,prompt text not null,answer jsonb not null,section_reference text not null,created_at timestamptz not null default now()
);
create table if not exists public.room_attempts(
 attempt_id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 room_id text not null references public.room_catalog(room_id) on delete cascade,
 score_percent integer not null default 0 check(score_percent between 0 and 100),
 passed boolean not null default false,created_at timestamptz not null default now()
);
alter table public.task_submissions add column if not exists attempt_id uuid references public.room_attempts(attempt_id) on delete cascade;
alter table public.certificates add column if not exists certificate_type text not null default 'Master';
alter table public.certificates add column if not exists score_percent integer not null default 0;
alter table public.certificates add column if not exists completion_date date not null default current_date;
alter table public.certificates add column if not exists legal_basis_line text not null default 'Educational credential only. Not government endorsed or accredited.';
alter table public.certificates add column if not exists revoked_at timestamptz;

create index if not exists room_progress_user_idx on public.room_progress(user_id);
create index if not exists task_submissions_task_idx on public.task_submissions(task_id);
create index if not exists room_attempts_user_idx on public.room_attempts(user_id);

alter table public.room_catalog enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.room_attempts enable row level security;

create schema if not exists private;
create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path=''
as $$select exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin')$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

do $$declare p record;begin
 for p in select policyname,tablename from pg_policies where schemaname='public'
 and tablename in('profiles','room_progress','task_submissions','badges_earned','certificates','room_catalog','quiz_questions','room_attempts')
 loop execute format('drop policy if exists %I on public.%I',p.policyname,p.tablename);end loop;
end$$;

revoke all on public.profiles,public.room_progress,public.task_submissions,public.badges_earned,public.certificates,public.room_catalog,public.quiz_questions,public.room_attempts from anon,authenticated;
grant select,insert,update,delete on public.profiles to authenticated;
grant select,insert,update on public.room_progress to authenticated;
grant select,insert on public.task_submissions to authenticated;
grant select on public.badges_earned,public.certificates to authenticated;
grant select on public.room_catalog to anon,authenticated;
grant select on public.quiz_questions to authenticated;
grant select,insert on public.room_attempts to authenticated;

create policy profiles_self_select on public.profiles for select to authenticated using((select auth.uid())=id);
create policy profiles_self_insert on public.profiles for insert to authenticated with check((select auth.uid())=id and role='learner');
create policy profiles_self_update on public.profiles for update to authenticated using((select auth.uid())=id) with check((select auth.uid())=id and role='learner');
create policy profiles_admin_select on public.profiles for select to authenticated using((select private.is_admin()));
create policy profiles_admin_update on public.profiles for update to authenticated using((select private.is_admin()));

create policy room_progress_self on public.room_progress for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy room_progress_admin on public.room_progress for select to authenticated using((select private.is_admin()));
create policy task_submissions_self on public.task_submissions for select to authenticated using((select auth.uid())=user_id);
create policy task_submissions_admin on public.task_submissions for select to authenticated using((select private.is_admin()));
create policy badges_self on public.badges_earned for select to authenticated using((select auth.uid())=user_id);
create policy badges_admin on public.badges_earned for select to authenticated using((select private.is_admin()));
create policy certificates_self on public.certificates for select to authenticated using((select auth.uid())=user_id);
create policy certificates_admin on public.certificates for select to authenticated using((select private.is_admin()));
create policy room_attempts_self on public.room_attempts for select to authenticated using((select auth.uid())=user_id);
create policy room_attempts_admin on public.room_attempts for select to authenticated using((select private.is_admin()));
create policy quiz_questions_admin on public.quiz_questions for select to authenticated using((select private.is_admin()));

create or replace function public.start_room_attempt(p_room_id text)
returns uuid language plpgsql security definer set search_path=''
as $$declare uid uuid;aid uuid;begin uid:=(select auth.uid());if uid is null then raise exception 'Authentication required';end if;
insert into public.room_attempts(user_id,room_id) values(uid,p_room_id) returning attempt_id into aid;return aid;end$$;
revoke all on function public.start_room_attempt(text) from public,anon;grant execute on function public.start_room_attempt(text) to authenticated;

create or replace function public.submit_task(p_task_id text,p_answer jsonb,p_attempt_id uuid default null)
returns jsonb language plpgsql security definer set search_path=''
as $$declare q public.quiz_questions%rowtype;uid uuid;ok boolean;begin uid:=(select auth.uid());if uid is null then raise exception 'Authentication required';end if;
select * into q from public.quiz_questions where question_id=p_task_id;if not found then raise exception 'Unknown question';end if;
if p_attempt_id is not null and not exists(select 1 from public.room_attempts a where a.attempt_id=p_attempt_id and a.user_id=uid and a.room_id=q.room_id) then raise exception 'Invalid attempt';end if;
ok:=q.answer=p_answer;insert into public.task_submissions(attempt_id,user_id,task_id,answer,correct,points)values(p_attempt_id,uid,p_task_id,p_answer,ok,case when ok then 10 else 0 end);
return jsonb_build_object('correct',ok,'points',case when ok then 10 else 0 end);end$$;
revoke all on function public.submit_task(text,jsonb,uuid) from public,anon;grant execute on function public.submit_task(text,jsonb,uuid) to authenticated;

create or replace function public.complete_room(p_room_id text,p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$declare uid uuid;total int;correct int;score int;begin uid:=(select auth.uid());if uid is null then raise exception 'Authentication required';end if;
select count(*) into total from public.quiz_questions where room_id=p_room_id;
select count(*) into correct from public.task_submissions s join public.quiz_questions q on q.question_id=s.task_id where s.user_id=uid and s.attempt_id=p_attempt_id and q.room_id=p_room_id and s.correct;
score:=case when total=0 then 0 else round(correct::numeric/total::numeric*100) end;
update public.room_attempts set score_percent=score,passed=score>=70 where attempt_id=p_attempt_id and user_id=uid;
insert into public.room_progress(user_id,room_id,completed,best_score,attempts,completed_at)values(uid,p_room_id,score>=70,score,1,case when score>=70 then now() end)
on conflict(user_id,room_id)do update set completed=public.room_progress.completed or excluded.completed,best_score=greatest(public.room_progress.best_score,excluded.best_score),attempts=public.room_progress.attempts+1,completed_at=coalesce(public.room_progress.completed_at,excluded.completed_at),updated_at=now();
return jsonb_build_object('completed',score>=70,'score',score,'best_score',(select best_score from public.room_progress where user_id=uid and room_id=p_room_id));end$$;
revoke all on function public.complete_room(text,uuid) from public,anon;grant execute on function public.complete_room(text,uuid) to authenticated;

create or replace function public.evaluate_badges(p_user uuid default null)
returns jsonb language plpgsql security definer set search_path=''
as $$declare uid uuid;n int;xpv int;outv jsonb;begin uid:=coalesce(p_user,(select auth.uid()));if uid<>(select auth.uid()) then raise exception 'Not allowed';end if;
select count(*) into n from public.room_progress where user_id=uid and completed;select coalesce(p.xp,0)into xpv from public.profiles p where p.id=uid;
insert into public.badges_earned(user_id,badge_id)select uid,'first-room' where n>=1 on conflict do nothing;
insert into public.badges_earned(user_id,badge_id)select uid,'five-rooms' where n>=5 on conflict do nothing;
insert into public.badges_earned(user_id,badge_id)select uid,'100-xp' where xpv>=100 on conflict do nothing;
insert into public.badges_earned(user_id,badge_id)select uid,'path-runner' where n>=10 on conflict do nothing;
select coalesce(jsonb_agg(to_jsonb(b)),'[]'::jsonb)into outv from public.badges_earned b where b.user_id=uid;return outv;end$$;
revoke all on function public.evaluate_badges(uuid) from public,anon;grant execute on function public.evaluate_badges(uuid) to authenticated;

create or replace function public.use_hint(p_task_id text) returns jsonb language sql security definer set search_path=''
as $$select jsonb_build_object('task_id',p_task_id,'cost',5)$$;
revoke all on function public.use_hint(text) from public,anon;grant execute on function public.use_hint(text) to authenticated;

create or replace function public.issue_certificate(p_type text)
returns setof public.certificates language plpgsql security definer set search_path=''
as $$declare uid uuid;pct int;cid text;begin uid:=(select auth.uid());if uid is null then raise exception 'Authentication required';end if;
select coalesce(round(avg(best_score)),0)into pct from public.room_progress where user_id=uid and completed;if pct<70 then raise exception 'Certificate requires a 70%+ average across completed rooms';end if;
cid:='0X8A-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,20));
insert into public.certificates(certificate_id,user_id,certificate_type,course,score_percent,completion_date,verification_hash)values(cid,uid,initcap(p_type),'0x8Acure DPDP Learning - '||initcap(p_type),pct,current_date,encode(digest(cid||uid::text,'sha256'),'hex'))returning *;return next;end$$;
revoke all on function public.issue_certificate(text) from public,anon;grant execute on function public.issue_certificate(text) to authenticated;

create or replace function public.verify_certificate(p_certificate_id text)
returns setof jsonb language sql security definer set search_path=''
as $$select jsonb_build_object('valid',c.revoked_at is null,'certificate_id',c.certificate_id,'holder_name',p.name,'course',c.course,'certificate_type',c.certificate_type,'score_percent',c.score_percent,'completion_date',c.completion_date,'legal_basis_line',c.legal_basis_line)from public.certificates c join public.profiles p on p.id=c.user_id where c.certificate_id=p_certificate_id$$;
revoke all on function public.verify_certificate(text) from public;grant execute on function public.verify_certificate(text) to anon,authenticated;

create or replace function public.admin_dashboard() returns jsonb language plpgsql security definer set search_path=''
as $$begin if not(select private.is_admin())then raise exception 'Admin role required';end if;
return jsonb_build_object('users',(select coalesce(jsonb_agg(to_jsonb(p)order by p.created_at desc),'[]'::jsonb)from public.profiles p),'room_progress',(select coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb)from public.room_progress r),'room_attempts',(select coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb)from public.room_attempts r),'certificates',(select coalesce(jsonb_agg(to_jsonb(c)),'[]'::jsonb)from public.certificates c));end$$;
revoke all on function public.admin_dashboard() from public,anon;grant execute on function public.admin_dashboard() to authenticated;

create or replace function public.admin_question_failures() returns jsonb language sql security definer set search_path=''
as $$select coalesce(jsonb_agg(x order by x.failures desc),'[]'::jsonb)from(select s.task_id,q.room_id,q.prompt,q.section_reference,count(*)filter(where not s.correct)::int failures,count(*)::int attempts from public.task_submissions s join public.quiz_questions q on q.question_id=s.task_id group by s.task_id,q.room_id,q.prompt,q.section_reference having count(*)filter(where not s.correct)>0)x where(select private.is_admin())$$;
revoke all on function public.admin_question_failures() from public,anon;grant execute on function public.admin_question_failures() to authenticated;

create or replace function public.admin_revoke_certificate(p_certificate_id text)returns boolean language plpgsql security definer set search_path=''
as $$begin if not(select private.is_admin())then raise exception 'Admin role required';end if;update public.certificates set revoked_at=coalesce(revoked_at,now())where certificate_id=p_certificate_id;return found;end$$;
revoke all on function public.admin_revoke_certificate(text) from public,anon;grant execute on function public.admin_revoke_certificate(text) to authenticated;

create or replace function public.public_leaderboard()
returns jsonb language sql security definer set search_path=''
as $$select coalesce(jsonb_agg(jsonb_build_object('name',p.name,'xp',p.xp,'completed_rooms',(select count(*) from public.room_progress rp where rp.user_id=p.id and rp.completed) ) order by p.xp desc),'[]'::jsonb) from public.profiles p where p.leaderboard_opt_in=true$$;
revoke all on function public.public_leaderboard() from public;
grant execute on function public.public_leaderboard() to anon,authenticated;

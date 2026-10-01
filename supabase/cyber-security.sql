-- Run after schema.sql and the Prisma migration. The Prisma tables are the
-- source of record; these policies permit safe Supabase chat/realtime access.
alter table public.cyber_users enable row level security;
alter table public.cyber_projects enable row level security;
alter table public.cyber_quizzes enable row level security;
alter table public.cyber_questions enable row level security;
alter table public.cyber_quiz_attempts enable row level security;
alter table public.cyber_rooms enable row level security;
alter table public.cyber_room_messages enable row level security;

revoke all on public.cyber_users,public.cyber_projects,public.cyber_quizzes,
  public.cyber_questions,public.cyber_quiz_attempts,public.cyber_rooms,
  public.cyber_room_messages from anon,authenticated;
grant select on public.cyber_rooms to anon,authenticated;
grant select,insert on public.cyber_room_messages to authenticated;
grant select on public.cyber_users to authenticated;
grant select on public.cyber_projects,public.cyber_quizzes,public.cyber_questions,
  public.cyber_quiz_attempts to authenticated;

create policy cyber_rooms_read_active on public.cyber_rooms for select
  to anon,authenticated using (is_active);
create policy cyber_user_self on public.cyber_users for select
  to authenticated using (id=(select auth.uid()));
create policy cyber_messages_read_active_room on public.cyber_room_messages for select
  to anon,authenticated using (exists(
    select 1 from public.cyber_rooms r where r.id=room_id and r.is_active
  ));
create policy cyber_messages_insert_self on public.cyber_room_messages for insert
  to authenticated with check (
    user_id=(select auth.uid()) and char_length(trim(content)) between 1 and 2000
    and exists(select 1 from public.cyber_rooms r where r.id=room_id and r.is_active)
  );

-- Per-user database-side message throttle for browser Realtime inserts.
create or replace function public.cyber_limit_room_message_rate()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.cyber_room_messages
      where user_id=new.user_id and created_at>now()-interval '30 seconds')>=8 then
    raise exception 'Room message rate limit exceeded.' using errcode='P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.cyber_limit_room_message_rate() from public, anon;
grant execute on function public.cyber_limit_room_message_rate() to authenticated;
drop trigger if exists cyber_room_message_rate_limit on public.cyber_room_messages;
create trigger cyber_room_message_rate_limit
before insert on public.cyber_room_messages
for each row execute function public.cyber_limit_room_message_rate();

-- Answers and attempts are only read or changed through the server API using
-- the service database connection. Public clients never receive correct_option.
create policy cyber_projects_public_read on public.cyber_projects for select
  to anon,authenticated using (published);
create policy cyber_quiz_catalog_public_read on public.cyber_quizzes for select
  to anon,authenticated using (is_active);
create policy cyber_questions_admin_only on public.cyber_questions for select
  to authenticated using (false);
create policy cyber_attempts_self_read on public.cyber_quiz_attempts for select
  to authenticated using (user_id=(select auth.uid()));

do $$begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='cyber_room_messages') then
    alter publication supabase_realtime add table public.cyber_room_messages;
  end if;
end$$;

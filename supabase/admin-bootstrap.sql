-- 0x8Acure admin bootstrap migration
-- Run once in Supabase SQL Editor.
-- The admin password is intentionally NOT stored in this repository.

drop policy if exists profiles_self_insert on public.profiles;

create policy profiles_self_insert
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
  and (
    role = 'learner'
    or (role = 'admin' and lower(email) in ('admin@0x8acure.local','admin@0x8acure.in'))
  )
);

-- If the reserved admin account/profile already exists, promote it.
update public.profiles
set role = 'admin',
    name = 'Platform Administrator'
where lower(email) = 'admin@0x8acure.local';

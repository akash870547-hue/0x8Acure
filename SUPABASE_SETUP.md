# Supabase setup

0x8Acure is a static GitHub Pages frontend. **The frontend does not call `server.js`**. Supabase Auth + Postgres + RLS + database functions are the backend.

## Files
- `supabase/schema.sql`: core tables, RLS, auth/progress/quiz/certificate RPCs.
- `supabase/admin-console.sql`: Admin Command Center tables, admin RPCs, badge catalog, activity log, drive links, user controls, and certificate issuance.
- `supabase/seed-room-catalog.sql`: 50 current rooms mapped to the three curriculum paths/modules.
- `supabase/seed-quiz-questions.sql`: 502 current question answer keys. Normal learners cannot select this table; grading happens through `submit_task()`.
- `supabase-config.js`: intentionally contains empty URL/key placeholders.

## Setup
1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Run `supabase/admin-console.sql`.
5. Run `supabase/seed-room-catalog.sql`.
6. Run `supabase/seed-quiz-questions.sql`.
7. In **Authentication → URL Configuration**, set the Site URL to the deployed site and add the `/login` URL as a Redirect URL.
8. Enable Email/Password authentication. Social login is not used by the 0x8Acure UI.
9. Create the trusted admin Auth user in Supabase Authentication with the admin email and password you want to use. The password is intentionally not stored in GitHub.
10. In Supabase SQL Editor, promote the trusted account:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'YOUR_ADMIN_EMAIL';
   ```
   This is the only bootstrap role change. Do not expose it through the browser.
11. Put only the project URL and publishable/anon key in `supabase-config.js`:
   ```js
   window.SUPABASE_CONFIG = {
     url: "https://YOUR_PROJECT.supabase.co",
     anonKey: "YOUR_PUBLISHABLE_OR_ANON_KEY"
   };
   ```
12. **Never** commit `service_role`, secret keys, database passwords, JWT secrets, or `ADMIN_PASSWORD`.
13. Reload the site and sign in at `/login`.

## Security model
- Authentication uses Supabase Auth.
- Every application table has RLS enabled.
- Normal users can read/write only their own progress/submission rows.
- The browser cannot promote itself to admin: self profile insert/update policies force `role='learner'`.
- Admin reads and mutations go through SECURITY DEFINER functions that call `private.is_admin()` in Postgres.
- Question answer keys are not exposed through normal learner table reads.
- Certificate verification is a public RPC; certificate issue and revoke are authenticated/admin-controlled.
- Leaderboard is opt-in and exposed through a narrow RPC.
- The browser uses only the publishable/anon key. The key is not a secret when RLS is configured correctly.

## Backend status
The SQL and seeds are committed, but they are **not proven against your live Supabase project until you run them**. After you paste the project URL and publishable/anon key into `supabase-config.js`, the remaining live-project checks can be performed.

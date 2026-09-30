# Supabase setup for 0x8Acure

This integration uses Supabase Auth + Postgres + Row Level Security. The browser contains only the Supabase project URL and publishable/anon key. Never paste a service_role or sb_secret key into supabase-config.js.

## 1. Create the database schema

Run supabase/schema.sql in the Supabase SQL Editor.

The schema creates profiles, room_progress, task_submissions, badges_earned, and certificates. RLS is enabled on every table. Authenticated users can access only rows whose user_id or id matches auth.uid(). Certificates have no public table read policy. Public verification uses the exact certificate_id RPC.

## 2. Configure the browser client

Edit supabase-config.js with your project URL and publishable/anon key. The publishable/anon key is designed for browser use. RLS is the security boundary.

## 3. Enable email/password and verification

In Supabase Dashboard: Authentication -> Providers -> Email. Enable email/password and keep Confirm Email enabled. Set the Site URL and redirect URL to the deployed 0x8Acure origin.

## 4. Enable Google

In Supabase Dashboard: Authentication -> Providers -> Google. Configure the Google OAuth client using the Supabase callback URL shown in provider settings, and add the 0x8Acure site URL to allowed redirect URLs. The app requires an explicit, unticked privacy-consent checkbox before starting a Google account flow.

## 5. Password reset

The app uses Supabase resetPasswordForEmail() and handles the recovery event with supabase-recovery.js.

## 6. Delete account

Deploy supabase/functions/delete-account/index.ts as a Supabase Edge Function. The function uses a server-side secret key to delete the authenticated Auth user. Foreign-key cascades remove platform rows. The secret key must exist only in the Edge Function environment.

## 7. Guest mode and merge

Guest learning remains in localStorage. On account creation, completed room progress and earned local badges are merged into the user's Supabase rows.

## 8. Download my data

The Account page reads the authenticated user's rows through RLS and downloads JSON containing profile, room progress, task submissions, badges, and certificates belonging to that account.

## 9. Certificate verification

Do not expose certificates through public table SELECT. Use public.verify_certificate(certificate_id). The RPC returns only the certificate matching the exact supplied ID.

## Production checklist

- Run the SQL migration.
- Verify RLS policies in Supabase.
- Configure Email Confirmations.
- Configure Google OAuth.
- Set Site URL and redirect URLs.
- Populate supabase-config.js with only the publishable/anon key.
- Deploy the delete-account Edge Function.
- Verify account export and deletion with a test account.
- Test certificate lookup with a valid ID and confirm arbitrary certificate rows are not listable.
- Review the Privacy Notice against the platform's actual processing and current DPDP requirements before production launch.
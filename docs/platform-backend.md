# Platform Supabase and Razorpay setup

## Supabase

Apply the existing platform schema first (`supabase/schema.sql`), then apply:

- `supabase/migrations/20261003000000_assetpulse.sql`
- `supabase/migrations/20261003010000_platform_backend.sql`

The core platform tables are `user_profiles`, `dpdp_progress`, `breach_assessments`, `forensic_cases`, and `transactions`. Row-level security scopes learner data to `auth.uid()`. Payment transaction writes and plan changes are server-only. Auth user creation synchronizes the non-admin `user_profiles` identity row; the browser cannot self-assign an elevated role or plan.

Configure the application with the Supabase project URL, public anon/publishable key, and a server-only service-role key. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` on Vercel/Pages builds, and `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` only in the API runtime. The existing vanilla entry uses `window.SUPABASE_CONFIG` in `supabase-config.js`; the React app uses `frontend/src/lib/supabaseClient.ts`. Never expose the service-role key.

Supabase email/password, magic-link, and GitHub sign-in are available in the Cyber Lab header. Enable GitHub as a Supabase Auth provider, set its client credentials in the Supabase dashboard, and allow the deployed root and `/app/` callback URLs in Supabase's redirect URL allowlist. Account creation requires privacy acknowledgement and carries the existing learner consent metadata forward to the vanilla app profile.

Guest learning progress remains in local storage. After Supabase sign-in, `supabase-sync.js` merges completed rooms, best quiz scores, and bookmarks with `dpdp_progress`, then continues syncing local changes. Existing `profiles` / `room_progress` sync is retained for the platform's other features.

## Assessment and forensic data

The estimator saves scenario parameters, affected principal count, selected data categories, risk score, calculated penalty bounds in rupees, and an optional generated memo. History is fetched only for the signed-in user. Forensic cases store parsed timeline data, indicators, a report, and a SHA-256 over the ordered evidence digests; evidence file bytes remain in the browser and are not uploaded.

## Razorpay checkout

Configure server-side `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on Vercel Functions and/or the Express/Render service. Configure browser build `VITE_RAZORPAY_KEY_ID` only if needed for public checkout configuration; order creation returns the server's public key ID to the client. `RAZORPAY_KEY_SECRET` must never use a `VITE_` prefix.

`POST /api/create-order` accepts only `instant_audit_report` (₹299) and `pro_dpdp_pack` (₹999); the server controls the amount in paise. It requires a Supabase bearer session and persists the order before checkout. `POST /api/verify-payment` checks the Razorpay HMAC, retrieves the payment from Razorpay, verifies the order, amount and currency, and requires captured status before marking the transaction paid. A Pro Pack purchase updates `user_profiles.plan_tier` server-side. The verification endpoint is idempotent for the same captured payment.

For GitHub Pages, configure the `CYBER_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_RAZORPAY_KEY_ID` Actions variables; the payment API must be hosted on the configured backend origin because Pages cannot run serverless functions. For Vercel, the `/api/create-order` and `/api/verify-payment` rewrites call `api/razorpay.js` on the same origin. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` in Vercel's server environment, and `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optionally `VITE_API_BASE_URL` as build variables.

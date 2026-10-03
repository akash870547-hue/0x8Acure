# AssetPulse setup

AssetPulse is available at `/app/?view=assetpulse`. It requires a Supabase-authenticated user session; the existing SQLite-backed workbench login is intentionally not accepted for access to UUID-owned monitoring records.

## Supabase

1. Configure the Supabase project URL, the public anon/publishable key, and the server-only service-role key as shown in `.env.example`.
2. Apply `supabase/migrations/20261003000000_assetpulse.sql` to the project.
3. Enable email/password sign-in in Supabase Auth. The AssetPulse sign-in panel uses Supabase Auth directly.

The migration enables RLS for all AssetPulse tables. Users can only access their domains, assets, alert destinations, and subscription record. Worker and webhook writes use the service role exclusively on the server.

## Background monitoring

The Express service starts the scan scheduler when both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured. It checks for due domains every five minutes, queries crt.sh, resolves DNS A/CNAME records, and stores up to 500 active discovered hostnames per domain scan. A single HTTPS HEAD request may be made to a hostname with a resolved public IPv4 address to record an HTTP status; the connection is pinned to that address, redirects are not followed, and no page content is read. The worker does not perform port scans.

For production installations, run the Node service as a continuously available worker process. The in-process scheduler is not suitable for a serverless function that sleeps between requests.

## Telegram

Create a bot with BotFather, configure `TELEGRAM_BOT_TOKEN` and a random `TELEGRAM_WEBHOOK_SECRET`, then set the bot webhook to:

`https://<your-api-host>/api/asset-monitor/telegram/webhook`

Include Telegram's `secret_token` parameter matching `TELEGRAM_WEBHOOK_SECRET` when calling `setWebhook`. In the dashboard, generate a one-use `/link <token>` value and send it to `@AssetPulseBot`. Tokens expire after 15 minutes. Set the bot's username to `AssetPulseBot` or update the dashboard URL if using a different bot username.

## Razorpay

Create a recurring monthly plan priced at ₹499 in Razorpay and configure its plan ID as `RAZORPAY_PRO_PLAN_ID`. Configure the API key pair and a webhook secret. Register the webhook URL:

`https://<your-api-host>/api/asset-monitor/razorpay/webhook`

Subscribe to `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.halted`, and `subscription.completed`. Checkout callback signatures are verified server-side; plan access is activated by the signed Razorpay webhook. Razorpay secrets must never be exposed through `VITE_*` variables.

## Limits and discovery behavior

Free subscriptions support two domains and 24-hour checks. Active Pro/Agency subscriptions support 15 domains and two-hour checks. The database enforces the domain cap on inserts and resumes, derives scan frequency from the user's server-managed subscription row, and pauses domains above the free active-domain limit after a downgrade. Discovery is limited to names under the entered root domain. Add only domains you own or are explicitly authorized to monitor.

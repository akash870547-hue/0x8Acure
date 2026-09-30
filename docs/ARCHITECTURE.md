# Architecture

The platform has four application layers.

1. Learner UI: vanilla HTML/CSS/JavaScript, room content, challenge flow and local fallback state.
2. API: Express with JWT authentication, progress tracking, leaderboard, HR dashboard APIs and certificates.
3. Data: SQLite for local development. The schema is intentionally relational so it can be migrated to PostgreSQL for production.
4. Governance: room version, status, source URL, legal reference and effective-from metadata provide a base for reviewed compliance content.

Roles are learner, hr and admin. HR can view learner metrics and issue certificates. Admin can seed rooms and should be the only role allowed to manage platform-level content.

Production should use managed PostgreSQL, HTTPS, a restricted CORS origin, managed secrets, backups, rate limiting, password reset, email verification and a separate admin surface.

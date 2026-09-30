# Security Notes

Authentication uses bcrypt password hashing and signed JWTs. API authorization is enforced server-side by role.

Audit records are written for registration, login, challenge attempts, room completion, certificate issuance and room seeding.

The frontend must never contain JWT secrets, database credentials or admin credentials. Only the short-lived bearer token belongs in the browser.

Before production launch:

- replace the development JWT fallback with a required secret
- restrict CORS to trusted origins
- add rate limiting and account lockout controls
- add password reset and email verification
- add CSRF protection if cookie-based authentication is introduced
- use managed PostgreSQL and encrypted backups
- review every room against current notified primary-source text and commencement dates

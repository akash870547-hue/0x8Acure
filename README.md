# 0x8Acure DPDP CTF Platform

Full-stack, scenario-based DPDP compliance learning and capture-the-flag platform.

## Included

- 3 learning paths and 9 scenario rooms
- MCQ and flag-style challenges
- Local XP, streak and progress fallback
- JWT authentication and persistent progress API
- Server-backed leaderboard
- HR/admin learner dashboard
- Certificate issuance and verification API
- Audit logging
- Room metadata version/source/effective-date fields
- SQLite local development with a PostgreSQL migration path

## Run locally

1. npm install
2. copy .env.example .env
3. npm start
4. open http://localhost:8080

Set a strong JWT_SECRET and admin credentials before using the backend.

## Repository structure

- index.html, styles.css, app.js: learner web application
- rooms.js: room content
- server.js: auth, progress, leaderboard, HR and certificate API
- api-client.js: optional browser API adapter
- render.yaml: Render deployment starting point
- .github/workflows/ci.yml: basic Node validation

## Primary sources

DPDP Act 2023: https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf
DPDP Rules 2025: https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025

Production legal content should be reviewed against notified primary sources and tagged with the applicable commencement date.
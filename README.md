# 0x8Acure

0x8Acure keeps the existing source-first DPDP learning platform at / and adds a separate Cyber Lab at /app/. The Cyber Lab is a React 19 + TypeScript app served by the existing Express service. Supabase Auth supplies email/password, Google OAuth, GitHub OAuth, and password recovery; Prisma connects feature modules to PostgreSQL. Existing DPDP accounts, progress, room quizzes, certificates, themes, and admin pages remain available.

## Requirements

- Node.js 20.19+ (22 LTS recommended) and npm
- Docker Desktop / Docker Engine for local PostgreSQL, or a PostgreSQL 15+ database
- A Supabase project for learner auth, OAuth providers, and room chat

## Local setup

1. Copy .env.example to .env.
2. In .env, set a random JWT_SECRET of at least 32 characters, your Supabase project URL and public anon/publishable key, and its server-only service-role key. Keep the service-role key out of VITE_* variables and source control.
3. Enable Email, Google, and GitHub providers in Supabase Auth. Add http://localhost:5173/** to the Auth redirect allow list during local development.
4. Install packages and start PostgreSQL:

        npm install
        docker compose up -d postgres

5. Generate the client, apply the Prisma schema, and seed starter data:

        npm run db:generate
        npm run db:migrate
        npm run db:seed

6. In the Supabase SQL Editor, run supabase/cyber-security.sql. It enables chat RLS policies and the Realtime publication after Prisma creates the tables.
7. Start the Express API and Vite dev server:

        npm run dev

   The original DPDP platform is at http://localhost:8080/; the Cyber Lab is at http://localhost:5173/ (Vite proxies /api to Express). In a production build, Express serves the Cyber Lab at http://localhost:8080/app/.

To use an external PostgreSQL database, set DATABASE_URL in .env and skip the local PostgreSQL command.

## Docker

After configuring .env as above:

        docker compose up --build

Open http://localhost:8080/ or http://localhost:8080/app/. Compose migrates and seeds the Cyber Lab database on startup and persists PostgreSQL and legacy SQLite data in named volumes. Vite embeds its public Supabase URL and publishable key in the browser bundle at build time.

For production, use a unique long JWT_SECRET, a strong POSTGRES_PASSWORD, HTTPS-only CORS_ORIGINS, and the exact Supabase keys for the deployed project. Never publish the service-role key.

## GitHub Pages frontend

The Pages workflow publishes an allow-listed static frontend and does not upload Prisma, server code, seed data, or answer-bearing content files. Add these repository Actions variables so that the static site can use the deployed Express API and Supabase project:

- CYBER_API_BASE_URL: public HTTPS origin of the deployed Render service, with no trailing slash
- VITE_SUPABASE_URL: Supabase project URL
- VITE_SUPABASE_ANON_KEY: public Supabase anon/publishable key

Add https://akash870547-hue.github.io to the Render CORS_ORIGINS value and the Supabase Auth redirect allow list. The React app uses same-origin API paths when served from Express, and the Pages build embeds CYBER_API_BASE_URL.

## Supabase admin and chat setup

- Create or enable the admin email in Supabase Auth, then set the same ADMIN_EMAIL before npm run db:seed. On first sign-in, the API links the seeded admin row to the Supabase user ID.
- Supabase Auth roles are not trusted from browser metadata. The API resolves the signed-in user against PostgreSQL and checks the server-managed role column for admin endpoints.
- Room chat uses the Supabase browser client with row-level security. Run the SQL setup after Prisma migrations. Message text is rendered as text; fenced code is displayed without executing markup.

## Scripts

| Command | Purpose |
| --- | --- |
| npm run dev | Run Express and Vite together |
| npm run build | Generate Prisma Client and build React into public/app/ |
| npm run typecheck | Type-check React and TypeScript sources |
| npm start | Run Express and serve both / and /app/ |
| npm run db:generate | Generate the Prisma Client |
| npm run db:migrate | Apply checked-in Prisma migrations |
| npm run db:seed | Seed starter quizzes, projects, rooms, and admin role |
| npm run db:studio | Open Prisma Studio |

## Architecture

- frontend/src/: React app, accessible views, auth context, and theme styles
- server.js: existing DPDP Express API and static entry point
- services/feature-api.js: Cyber Lab API, Supabase token verification, Zod validation, quiz grading, XP, leaderboard, projects, and admin RBAC
- prisma/: PostgreSQL models, migration, and TypeScript seed
- supabase/: existing Auth setup and Cyber Lab RLS/Realtime SQL
- data/materialsData.js: extensible CHFI/DFIR catalog and shared Drive URL
- content/: original learning content; answer-bearing source JSON is blocked from static downloads and served through answer-stripped API responses

### Cyber Lab API

- GET /api/quizzes: active quizzes and public question data (no correct answers)
- POST /api/quizzes/submit: authenticated server-side grading, feedback, attempt persistence, and XP
- GET /api/cyber/leaderboard: live ranking by XP and best completion time
- GET /api/projects and GET /api/projects/:slug: published project catalog and sanitized Markdown
- GET /api/cyber/rooms: active Cyber Lab room catalog
- /api/admin/metrics, /api/admin/projects, /api/admin/quizzes: admin-only views
- /api/admin/projects, /api/admin/quizzes, /api/admin/quizzes/:id/questions, /api/admin/questions/:id: admin-only content CRUD

The original DPDP API and its SQLite database remain independent of the Cyber Lab schema.

## Study Materials

The Study Materials view is available in the Cyber Lab. It reads data/materialsData.js, starts with 16 CHFI v10/v11 and DFIR modules, and uses the supplied [master Drive vault](https://drive.google.com/drive/folders/1SKr0zxT9TPPx8vGk6RGzCtwGD5xLXMTb?usp=drive_link). Replace sample driveUrl values with individual Drive file links as they become available.

## Render deployment

render.yaml defines the Express web service and PostgreSQL database. Set Supabase server and Vite public variables in the Render dashboard, set the deployed HTTPS origin in CORS_ORIGINS, and use the generated Render database URL. The build generates Prisma Client; the pre-deploy command migrates and seeds PostgreSQL.

## Existing DPDP platform

The original UI and endpoints remain at /, including DPDP learning paths, cited room quizzes, progress sync, certificates, Google OAuth, theme toggle, and the existing admin workflow. The Cyber Lab is an additional application at /app/.

Primary-source references used by the DPDP learning content: [DPDP Act 2023](https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf) and [DPDP Rules 2025](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025).

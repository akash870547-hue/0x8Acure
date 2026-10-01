FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/0x8acure
ENV DATABASE_URL=$DATABASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run typecheck && npm run build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY --from=build /app/prisma ./prisma
RUN npm ci --omit=dev
COPY --from=build /app/public/app ./public/app
COPY --from=build /app/server.js /app/app.js /app/index.html /app/styles.css /app/command-palette.js /app/curriculum.js /app/rooms.js /app/act-reference.js /app/rules-reference.js /app/api-client.js /app/supabase-config.js /app/supabase-auth-v2.js /app/supabase-sync.js /app/supabase-recovery.js /app/admin-ui.js /app/certificate-ui.js /app/badge-ui.js ./
COPY --from=build /app/config ./config
COPY --from=build /app/lib ./lib
COPY --from=build /app/services ./services
COPY --from=build /app/content ./content
COPY --from=build /app/data/materialsData.js ./data/materialsData.js
EXPOSE 8080
CMD ["sh","-c","npm run db:migrate && npm run db:seed && npm start"]

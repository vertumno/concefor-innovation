# Dockerfile para self-host no Cefor (Next.js output: standalone + SQLite local)
# Build:  docker build -t concefor-app .
# Run:    docker run -p 3000:3000 -v concefor-data:/app/data --env-file .env.local concefor-app
# Sync:   docker run --rm -v concefor-data:/app/data --env-file .env.local concefor-app node scripts/sync-even3.mjs

FROM node:22-alpine AS deps
WORKDIR /app
# better-sqlite3 é binário nativo: no Alpine (musl) pode precisar compilar.
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# O sync periódico é runtime. Nunca deve abrir timers nem chamar o Even3 no build.
ENV SYNC_INTERVAL_MIN=0
RUN npm test && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/concefor.db
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Schema/seed (lidos em runtime por lib/db.ts) e o script de seed.
COPY --from=builder /app/db ./db
COPY --from=builder /app/scripts ./scripts
# Garante o pacote nativo (binário compilado) no runner, além do que o standalone traça.
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
# Volume para o arquivo SQLite persistir entre reinícios/deploys.
RUN mkdir -p /app/data
VOLUME /app/data
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]

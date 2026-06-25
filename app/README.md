# App — VIII Concefor (PWA)

PWA do evento. Escopo v1: **programação viva (timeline)** · **reações ao vivo no telão** ·
**dashboard/relatório**. Spec completo em [`../spec/app-v1.md`](../spec/app-v1.md).

> **Status:** scaffold. As telas ainda não foram construídas (ver TODOs abaixo).

## Stack

- Next.js (App Router) + `next-pwa` — mobile-first, instalável
- Supabase (Postgres + Realtime)
- Deploy: Vercel (Root Directory = `app/`) **ou** self-host no Cefor via Docker (`output: standalone`)

## Rodar localmente

```bash
cd app
cp .env.example .env.local   # preencher com as chaves do Supabase
npm install
npm run dev
```

Aplicar o esquema do banco: rode `supabase/schema.sql` no projeto Supabase (SQL editor) e
habilite Realtime na tabela `timeline_events`.

## Deploy

- **Vercel:** importar o repo, setar **Root Directory = `app/`**, configurar as env vars.
- **Self-host (Cefor):** `docker build -t concefor-app . && docker run -p 3000:3000 --env-file .env.local concefor-app`

## TODO (próxima fase — build das telas)

- [ ] Inicializar o projeto Next.js de fato (este é só o esqueleto de pastas/config)
- [ ] Telas Agora / A seguir / grade-timeline (feature 4.1 do spec)
- [ ] Reações + canal Realtime + `/telao` (feature 4.2 do spec)
- [ ] Dashboard ao vivo + relatório exportável (seção 5 do spec)
- [ ] Seed da programação (planilha oficial → `sessions`)
- [ ] Identidade do selo 20 anos

# App — VIII Concefor (PWA)

PWA do evento. Escopo v1: **programação viva (timeline)** · **reações ao vivo no telão** ·
**dashboard/relatório**. Spec completo em [`../spec/app-v1.md`](../spec/app-v1.md).

> **Status:** app rodável com **backend próprio** (SQLite local + API routes) e a **identidade
> visual** Concefor (ver [`../design-system/app/`](../design-system/app/)). Telas de programação
> (Agora / A seguir / timeline) e "minha programação" (favoritos) leem da tabela `sessions`. Dá
> para ver tudo funcionando **sem configurar nada** via `npm run dev:demo` (modo demonstração).
> Reações/telão/dashboard são os próximos marcos (ver TODOs).

## Stack

- Next.js (App Router) + `next-pwa` — mobile-first, instalável
- Backend próprio: SQLite local (`better-sqlite3`) atrás de `lib/db.ts` (interface única) + API routes
- Deploy: self-host no Cefor via Docker (`output: standalone`, volume para o arquivo SQLite)

## Rodar localmente

```bash
cd app
npm install
npm run seed         # cria ./data/concefor.db e carrega a programação oficial
npm run dev          # app com DADOS REAIS vindos do SQLite (relógio real)
# ou:
npm run dev:demo     # DADOS DE DEMONSTRAÇÃO + relógio simulado — nada a configurar
```

### Modo demonstração (flag `NEXT_PUBLIC_DEMO`)

Para ver o app **funcionando na hora**, sem banco. Liga com a flag `NEXT_PUBLIC_DEMO=1` (opt-in).
Carrega a **programação oficial** do VIII Concefor (17–20/08/2026). Como o evento é futuro, usa um
**relógio de demonstração**: o "agora" é simulado dentro do evento (ancorado em 18/08 09:30, correndo
em tempo real), então há sessão "Acontecendo agora", contagens, barra de progresso e a linha do tempo
viva. Uma faixa no topo mostra o relógio simulado e deixa claro que é uma demonstração.

- Vale em **dev e em produção** (a flag é embutida no build): `npm run dev:demo`, `npm run build:demo`.
- Em deploy (Vercel): defina `NEXT_PUBLIC_DEMO=1` no projeto/preview para uma demo pública.
- Programação em [`src/lib/demoData.ts`](src/lib/demoData.ts); relógio em [`src/lib/clock.ts`](src/lib/clock.ts).

### Dados reais (SQLite local)

O app tem backend próprio: um arquivo SQLite (default `./data/concefor.db`, configurável por
`DATABASE_PATH`) acessado **só** por [`src/lib/db.ts`](src/lib/db.ts) — a interface única de
dados. A UI nunca fala com o banco direto: consome a API route `GET /api/sessions`. Manter esse
único ponto de acesso é o que deixa barata uma futura volta ao Postgres.

```bash
cp .env.example .env.local   # opcional; defaults já servem para dev
npm run seed                 # aplica db/schema.sql + db/seed.sql em ./data/concefor.db
npm run dev                  # lê do SQLite via /api/sessions
```

O schema (`db/schema.sql`) é aplicado de forma idempotente no boot do `db.ts` e no seed. O
`db/seed.sql` traz a programação oficial (repetível: `npm run seed` limpa e recarrega; as
reações em `timeline_events` são preservadas). Sem seed e sem a flag demo, o app sobe e mostra
estado vazio em vez de quebrar.

## Estrutura

```
src/
├── app/                 App Router (telas)
│   ├── page.tsx         Início — Agora / A seguir + banner "não perca"
│   ├── timeline/        Programação completa (filtros, busca, "minha programação")
│   ├── sessao/[id]/     Detalhe da sessão (+ favoritar; reações chegam na semana 3)
│   └── telao/           Placeholder do modo telão (semana 3)
├── components/          SessionCard
└── lib/                 db (SQLite, interface única) · clientId (anônimo) · favorites · sessions · types

db/                      schema.sql + seed.sql (programação oficial)
scripts/                 seed.mjs (npm run seed)
```

## Deploy

- **Self-host (Cefor):** `docker build -t concefor-app .`, depois
  `docker run -p 3000:3000 -v concefor-data:/app/data --env-file .env.local concefor-app`.
  O volume `/app/data` guarda o SQLite entre reinícios. Semeie uma vez com
  `docker run --rm -v concefor-data:/app/data concefor-app node scripts/seed.mjs`.

## TODO

- [x] Projeto Next.js + TypeScript de pé (build passando)
- [x] Telas Agora / A seguir / timeline + "minha programação" (favoritos) — feature 4.1
- [x] Identidade visual (Concefor base + selo 20 anos acento) — ver `design-system/app/`
- [x] Modo demonstração (`NEXT_PUBLIC_DEMO=1` / `npm run dev:demo`) — dados fictícios sem banco
- [x] Backend próprio: SQLite local (`lib/db.ts`) + `GET /api/sessions` + `npm run seed` (E1)
- [ ] Reações na sessão ao vivo → `timeline_events` (E2)
- [ ] Tempo real (SSE) + modo telão "batimento cardíaco" (E3)
- [ ] Dashboard admin ao vivo (E4) + relatório exportável (E9)
- [ ] Importar a programação oficial (planilha → `sessions`), substituindo o seed
- [ ] Wiring do `next-pwa` (service worker + cache offline da programação)

# App — VIII Concefor (PWA)

PWA do evento. Escopo v1: **programação viva (timeline)** · **reações ao vivo no telão** ·
**dashboard/relatório**. Spec completo em [`../spec/app-v1.md`](../spec/app-v1.md).

> **Status:** scaffold rodável, já com a **identidade visual** Concefor (ver
> [`../design-system/app/`](../design-system/app/)). Telas de programação (Agora / A seguir /
> timeline) e "minha programação" (favoritos) funcionam lendo de `sessions`. Dá para ver tudo
> funcionando **sem banco** via `npm run dev:demo` (modo demonstração). Reações/telão/dashboard
> são os próximos marcos (ver TODOs).

## Stack

- Next.js (App Router) + `next-pwa` — mobile-first, instalável
- Supabase (Postgres + Realtime)
- Deploy: Vercel (Root Directory = `app/`) **ou** self-host no Cefor via Docker (`output: standalone`)

## Rodar localmente

```bash
cd app
npm install
npm run dev          # app vazio (sem dados) — precisa de Supabase configurado
# ou:
npm run dev:demo     # carrega DADOS DE DEMONSTRAÇÃO (fictícios) — nada a configurar
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

### Dados reais (Supabase)

```bash
cp .env.example .env.local   # preencher NEXT_PUBLIC_SUPABASE_URL e ANON_KEY (deixe DEMO=0)
```

Rode `supabase/schema.sql` no projeto Supabase (SQL editor) e habilite Realtime na tabela
`timeline_events`. Para dados de exemplo, rode também `supabase/seed.sql` (**não** é a
programação oficial). Sem `.env.local` e sem a flag demo, o app sobe e mostra estado vazio em
vez de quebrar.

## Estrutura

```
src/
├── app/                 App Router (telas)
│   ├── page.tsx         Início — Agora / A seguir + banner "não perca"
│   ├── timeline/        Programação completa (filtros, busca, "minha programação")
│   ├── sessao/[id]/     Detalhe da sessão (+ favoritar; reações chegam na semana 3)
│   └── telao/           Placeholder do modo telão (semana 3)
├── components/          SessionCard
└── lib/                 supabaseClient · clientId (anônimo) · favorites · sessions · types
```

## Deploy

- **Vercel:** importar o repo, setar **Root Directory = `app/`**, configurar as env vars.
- **Self-host (Cefor):** `docker build -t concefor-app . && docker run -p 3000:3000 --env-file .env.local concefor-app`

## TODO

- [x] Projeto Next.js + TypeScript de pé (build passando)
- [x] Telas Agora / A seguir / timeline + "minha programação" (favoritos) — feature 4.1
- [x] Identidade visual (Concefor base + selo 20 anos acento) — ver `design-system/app/`
- [x] Modo demonstração (`NEXT_PUBLIC_DEMO=1` / `npm run dev:demo`) — dados fictícios sem banco
- [ ] Criar projeto Supabase, aplicar `schema.sql` + seed, preencher `.env.local`
- [ ] Reações + canal Realtime + modo telão "batimento cardíaco" (feature 4.2) — semana 3
- [ ] Dashboard ao vivo + relatório exportável (seção 5) — semana 4
- [ ] Importar a programação oficial (planilha → `sessions`), substituindo o seed
- [ ] Wiring do `next-pwa` (service worker + cache offline da programação)

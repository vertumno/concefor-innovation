# App — VIII Concefor (PWA)

PWA do evento. Escopo v1: **programação viva (timeline)** · **reações ao vivo no telão** ·
**dashboard/relatório**. Spec completo em [`../spec/app-v1.md`](../spec/app-v1.md).

> **Status:** scaffold rodável. App Next.js + TypeScript de pé, build passando. Telas de
> programação (Agora / A seguir / timeline) e "minha programação" (favoritos) já funcionam lendo
> de `sessions`. Reações/telão/dashboard são os próximos marcos (ver TODOs).

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
habilite Realtime na tabela `timeline_events`. Para ver a programação em dev, rode também
`supabase/seed.sql` (dados de exemplo — **não** é a programação oficial).

Sem `.env.local` o app sobe mesmo assim: as telas mostram estado vazio (Supabase não
configurado) em vez de quebrar.

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
- [ ] Criar projeto Supabase, aplicar `schema.sql` + seed, preencher `.env.local`
- [ ] Reações + canal Realtime + modo telão "batimento cardíaco" (feature 4.2) — semana 3
- [ ] Dashboard ao vivo + relatório exportável (seção 5) — semana 4
- [ ] Importar a programação oficial (planilha → `sessions`), substituindo o seed
- [ ] Identidade do selo 20 anos (trocar placeholders de cor/grid/ícone)
- [ ] Wiring do `next-pwa` (service worker + cache offline da programação)

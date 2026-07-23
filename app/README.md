# App — VIII CONCEFOR (PWA)

PWA do evento **VIII CONCEFOR** (17–20/08/2026, Cefor/IFES, Vitória-ES). Escopo v1:
**programação viva (timeline)** · **reações ao vivo no telão** · **dashboard/relatório**.
Mobile-first, instalável.

> Espelho do código do app. O desenvolvimento e o contexto do projeto ficam no repositório
> interno da equipe — abra *issues* aqui, mas alinhe mudanças com o time antes de contribuir.

## Regras de conteúdo

- **Toda comunicação com o participante é no singular** (a pessoa lê sozinha, no celular
  dela): nunca "bem-vindos"/"vocês". Preferir neutro de gênero ("que bom ter você aqui").
  Decisão de 20/07.

## Stack

- **Next.js 15** (App Router, `output: standalone`) + React 19 + TypeScript
- **SQLite local** (`better-sqlite3`, binário nativo) atrás de `src/lib/db.ts` (interface única de dados) + **API routes** + **SSE** (Server-Sent Events) para o tempo real das reações/telão
- `next-pwa` (service worker + cache offline — em wiring)

> ⚠️ **Restrição de arquitetura:** por usar **SQLite em disco + SSE**, o app precisa de um
> **processo sempre-ligado com disco persistente**. **Não roda em serverless** (Vercel/Functions).
> O alvo é container Docker (ou Node de longa duração numa VM/servidor).

## Rodar localmente (dev)

```bash
cd app
npm install
npm run seed        # cria ./data/concefor.db e carrega a programação oficial
npm run dev         # app com dados reais do SQLite (relógio real) — http://localhost:3000
# ou:
npm run dev:demo    # dados de demonstração + relógio simulado — nada a configurar
```

Requisitos: **Node.js 22+**. O `better-sqlite3` é binário nativo — em Linux/Alpine pode exigir
`python3`, `make` e `g++` para compilar no `npm install` (o Dockerfile já cuida disso).

## Deploy (produção) — Docker

O `Dockerfile` já produz a imagem standalone. Na pasta `app/`:

```bash
# 1. build da imagem
docker build -t concefor-app .

# 2. subir (volume p/ o SQLite + variáveis em .env.local)
docker run -d --name concefor-app -p 3000:3000 \
  -v concefor-data:/app/data \
  --env-file .env.local \
  concefor-app

# 3. semear a base UMA vez (programação oficial)
docker run --rm -v concefor-data:/app/data concefor-app node scripts/seed.mjs
```

O volume `/app/data` guarda o arquivo SQLite entre reinícios e atualizações.

### Dependências de infraestrutura

| Item | Detalhe |
|---|---|
| **Host** | Linux com Docker (recomendado). Sem Docker: Node.js 22 + `python3`/`make`/`g++`. |
| **Disco** | Volume persistente para o arquivo SQLite (o dado do evento vive nele). |
| **Rede** | Porta **3000** (interna do container). |
| **HTTPS** | **Obrigatório.** Endereço estável atrás de reverse proxy com TLS — o PWA instalável e a câmera do QR scanner só funcionam em *secure context* (HTTPS). |
| **No evento (17–20/08)** | Idealmente rodando na **LAN do Cefor**, para o app sobreviver a quedas de internet (usa só a rede local). |

## Variáveis de ambiente (`.env.local`)

Baseie-se em `.env.example`. Segredos **não** estão no repositório (`.env.local` é gitignored).

| Variável | Uso |
|---|---|
| `DATABASE_PATH` | Caminho do arquivo SQLite. No Docker: `/app/data/concefor.db`. Default local: `./data/concefor.db`. |
| `ADMIN_TOKEN` | Segredo do painel admin (`/admin`). |
| `EVEN3_API_TOKEN` | Token de **leitura** da API do Even3 (programação/inscritos). |
| `NEXT_PUBLIC_DEMO` | `0` em produção (`1` = modo demonstração com dados fictícios). Embutido no build. |

## Operação

- **Backup:** copiar o arquivo `concefor.db` do volume `/app/data` — o backup é o próprio arquivo.
- **Atualizar:** `git pull` → `docker build` → recriar o container. Os dados persistem no volume, sem re-seed.
- **Logs:** `docker logs -f concefor-app`.
- **Re-seed:** `npm run seed` (ou o comando docker acima) limpa e recarrega a programação; as reações em `timeline_events` são preservadas.

## Modo demonstração (`NEXT_PUBLIC_DEMO=1`)

Para ver o app funcionando **sem banco**. Carrega a programação oficial e usa um **relógio
simulado** (ancorado dentro do evento), então há sessão "acontecendo agora", contagens e a
linha do tempo viva. Uma faixa no topo deixa claro que é demonstração. Atalhos:
`npm run dev:demo` / `npm run build:demo`.

## Estrutura

```
src/
├── app/                 App Router (telas)
│   ├── page.tsx         Início — Agora / A seguir + banner "não perca"
│   ├── timeline/        Programação completa (filtros, busca, "minha programação")
│   ├── sessao/[id]/     Detalhe da sessão (+ favoritar + reações ao vivo)
│   ├── telao/           Telão "batimento" — /telao (sessão no ar) ou /telao/[sessionId]
│   └── api/             sessions · reactions (POST/GET) · live/[sessionId] (SSE)
├── components/          SessionCard · Reactions · Telao · Speakers · TimeStamp
└── lib/                 db (SQLite, interface única) · reactions · clientId (anônimo) · favorites · sessions · types

db/                      schema.sql + seed.sql (programação oficial)
scripts/                 seed.mjs (npm run seed) + seed-live.mjs (npm run seed:live)
```

O schema (`db/schema.sql`) é aplicado de forma idempotente no boot do `db.ts` e no seed. A UI
nunca fala com o banco direto — consome as API routes; `src/lib/db.ts` é o único ponto de acesso
a dados, o que mantém barata uma futura volta ao Postgres.

## Status (v1)

- [x] Telas Agora / A seguir / timeline + "minha programação" (favoritos)
- [x] Identidade visual (Concefor base + selo 20 anos acento)
- [x] Backend próprio: SQLite local (`lib/db.ts`) + `GET /api/sessions` + `npm run seed`
- [x] Reações na sessão ao vivo → `timeline_events`, com throttle anti-flood
- [x] Tempo real (SSE) + modo telão "batimento cardíaco" em `/telao`
- [ ] Dashboard admin ao vivo + relatório exportável
- [ ] Sync da programação oficial via API do Even3 (substitui o seed)
- [ ] Wiring do `next-pwa` (service worker + cache offline da programação)

# App — VIII CONCEFOR (PWA)

PWA do evento **VIII CONCEFOR** (17–20/08/2026, Cefor/IFES, Vitória-ES). Escopo v1:
**programação viva (timeline)** · **reações/perguntas/enquetes ao vivo** ·
**networking com escolha por campo** · **dashboard/relatório**. Mobile-first, instalável.

> Espelho do código do app. O desenvolvimento e o contexto do projeto ficam no repositório
> interno da equipe — abra *issues* aqui, mas alinhe mudanças com o time antes de contribuir.

## Regras de conteúdo

- **Toda comunicação com o participante é no singular** (a pessoa lê sozinha, no celular
  dela): nunca "bem-vindos"/"vocês". Preferir neutro de gênero ("que bom ter você aqui").
  Decisão de 20/07.

## Stack

- **Next.js 15** (App Router, `output: standalone`) + React 19 + TypeScript
- **SQLite local** (`better-sqlite3`, binário nativo) atrás de `src/lib/db.ts` (interface única de dados) + **API routes** + **SSE** (Server-Sent Events) para o tempo real das reações/telão
- Manifesto web + instalação na tela inicial. Cache offline fica para uma etapa
  própria, com solução atual e teste específico no iOS/Android.

> ⚠️ **Restrição de arquitetura:** por usar **SQLite em disco + SSE**, o app precisa de um
> **processo sempre-ligado com disco persistente**. **Não roda em serverless** (Vercel/Functions).
> O alvo é container Docker (ou Node de longa duração numa VM/servidor).

## Rodar localmente (dev)

```bash
cd app
npm install
npm run sync:even3  # cria ./data/concefor.db com a programação oficial do Even3 (exige EVEN3_API_TOKEN)
npm run dev         # app com dados reais do SQLite (relógio real) — http://localhost:3000
# ou:
npm run dev:demo    # dados de demonstração + relógio simulado — nada a configurar
```

> ⚠️ O antigo `npm run seed` está **aposentado**: recriaria a programação manual
> desatualizada por cima. A fonte da programação é a **API do Even3** (`sync:even3`),
> que é idempotente e preserva sessões locais de teste (ids sem prefixo `even3-`).

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

# 3. carregar a programação oficial do Even3 (idempotente — pode rodar sempre)
docker run --rm -v concefor-data:/app/data --env-file .env.local \
  concefor-app node scripts/sync-even3.mjs
```

O volume `/app/data` guarda o arquivo SQLite entre reinícios e atualizações.
Antes e depois de cada deploy, `npm run audit:persistence` verifica a integridade
do banco e contabiliza conexões atuais, recuperáveis e órfãs sem exibir dados pessoais.

> ⚠️ **Se a base foi criada com o antigo `scripts/seed.mjs`** (programação manual,
> hoje desatualizada): apague o arquivo `concefor.db` do volume e rode o passo 3 de
> novo — o banco renasce só com a programação oficial do Even3. Depois do primeiro
> sync, o re-sync também pode ser disparado pelo painel `/admin` (botão
> "re-sincronizar Even3"), sem acesso ao servidor.

### Sessões de teste (período de validação)

Para um teste inteiramente local, com três participantes fictícios e uma sessão
já no ar, use `npm run seed:qa`. As credenciais aparecem no terminal. Reexecutar o
comando atualiza a massa sem apagar logins, perfis, conexões ou interações. Ao terminar,
`npm run seed:qa -- --limpar` remove deliberadamente a sessão, as contas e todas as
interações delas.

**Sem acesso ao servidor:** o painel `/admin` tem o botão **"Inserir bloco para agora"**
(seção *Bloco de teste*) — cria uma sessão fictícia já no ar, com a duração escolhida,
para o público presente reagir e perguntar. O mesmo painel apaga o bloco depois, junto
com as reações e perguntas do teste. É o caminho normal para experimentar com gente.

Para uma **grade inteira** de um dia, `scripts/seed-validacao.mjs` (as sessões sobrevivem
ao re-sync; horários ajustáveis pelo `/admin`):

```bash
docker run --rm -v concefor-data:/app/data --env-file .env.local \
  concefor-app node scripts/seed-validacao.mjs            # grade de 30/07/2026
#   ... node scripts/seed-validacao.mjs --data=AAAA-MM-DD # outro dia
#   ... node scripts/seed-validacao.mjs --data=AAAA-MM-DD --comissao
#                                                         # grade curta (teste de 30 min às 15h)
#   ... node scripts/seed-validacao.mjs --limpar          # remover tudo depois
```

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
| `SYNC_INTERVAL_MIN` | Sync automático do Even3 embutido no serviço, em minutos. **Padrão: 10 fora de dev** (em `next dev` fica desligado). Roda também uma vez no boot. `0` desliga — mas em produção isso significa que quem for confirmado no credenciamento **não entra no app** até alguém apertar o re-sync no `/admin`. |
| `NEXT_PUBLIC_DEMO` | `0` em produção (`1` = modo demonstração com dados fictícios). Embutido no build. |

## Operação

- **Verificar:** `npm test`, `npx tsc --noEmit`, `npm run build` e `npm run smoke`.
  O smoke sobe a compilação com um banco temporário e valida saúde/autorização.
- **Backup:** `npm run backup -- /diretorio/de-destino` (ou o equivalente no
  container). O script usa a API de backup do SQLite, segura com WAL ativo, e
  valida o resultado com `integrity_check`, entregando um único arquivo `.db`.
  A pipeline cria um backup no volume
  antes de trocar o container; copie periodicamente uma cópia para fora do host.
- **Atualizar:** merge no `main` deste repositório → **deploy automático em produção**
  (integração contínua, 30/07). Mudanças entram por **branch + Merge Request** — nunca
  commit direto no `main`. Os dados persistem no volume, sem re-seed.
- **Logs:** `docker logs -f concefor-app`.
- **Atualizar a programação:** botão "re-sincronizar Even3" no `/admin`, ou o comando
  docker do passo 3; reações e demais registros em `timeline_events` são preservados.

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
│   ├── telao/           Telão "linha do tempo" — /telao (sessão no ar / sala de espera) ou /telao/[sessionId]
│   └── api/             sessions · reactions (POST/GET) · live/[sessionId] (SSE)
├── components/          SessionCard · Reactions · Telao · Speakers · TimeStamp
└── lib/                 db (SQLite, interface única) · reactions · clientId (anônimo) · favorites · sessions · types

db/                      schema.sql + enrich.sql (enriquecimento local pós-sync)
scripts/                 sync-even3.mjs (fonte da programação) + seed-live.mjs +
                         seed-validacao.mjs (grade de teste) + seed.mjs (aposentado)
```

O schema (`db/schema.sql`) é aplicado de forma idempotente no boot do `db.ts` e no seed. A UI
nunca fala com o banco direto — consome as API routes; `src/lib/db.ts` é o único ponto de acesso
a dados, o que mantém barata uma futura volta ao Postgres.

## Status (v1)

- [x] Telas Agora / A seguir / timeline + "minha programação" (favoritos)
- [x] Identidade visual (Concefor base + selo 20 anos acento)
- [x] Backend próprio: SQLite local (`lib/db.ts`) + `GET /api/sessions` + `npm run seed`
- [x] Reações na sessão ao vivo → `timeline_events`, com throttle anti-flood
- [x] Tempo real (SSE) + telão "linha do tempo de reações" em `/telao` (com sala de espera/contagem regressiva)
- [x] Dashboard admin ao vivo (`/admin`) + relatório (`/admin/relatorio`)
- [x] Sync da programação oficial via API do Even3 (substituiu o seed)
- [x] Perguntas com upvote · login opcional pelo crachá · mosaico de conexões
- [x] Sessão autenticada HttpOnly · compartilhamento de contato configurável por campo
- [x] Enquetes moderadas em lista/nuvem de palavras + projeção em `/enquete`
- [x] Backup consistente · healthcheck · rollback de deploy · validação de branches
- [ ] Cache offline da programação (integração anterior removida por estar desativada e obsoleta)

# Próximos passos — plano de execução (revisado em 06/07/2026)

Plano acionável do app v1. Cada etapa está escopada para ser **uma sessão de trabalho**
(um prompt, um PR): tem objetivo, tarefas e critério de pronto. A ordem importa — E1→E4
são o caminho crítico do **piloto na reunião da comissão do Concefor** (data a confirmar,
≈ semana de 13/07).

Estado de partida: semanas 1–2 entregues (scaffold, identidade, linha do tempo viva,
favoritos, filtros, modo demo). Nada de backend real ainda: o app roda 100% em demo.
Ver `app-v1.md` para a spec e `../decisoes.md` (2026-07-06) para os porquês.

---

## Caminho crítico do piloto

### E1 — Camada de dados local (SQLite + API routes)

**Objetivo:** o app deixa de depender de Supabase e passa a ter backend próprio,
funcionando com dados reais persistidos.

- Criar `lib/db.ts` como **interface única** de acesso a dados (o resto do app nunca
  importa o driver direto — é o que mantém a volta ao Postgres barata).
- Implementar com `better-sqlite3`; arquivo em `DATABASE_PATH` (default `./data/concefor.db`).
- Adaptar `supabase/schema.sql` → `db/schema.sql` SQLite (`uuid`→`text` gerado no app,
  `timestamptz`→`text` ISO-8601; mesmas tabelas: `sessions`, `speakers`,
  `session_speakers`, `timeline_events`). Aplicar schema na inicialização (idempotente).
- Portar `seed.sql` e criar `npm run seed`.
- API routes: `GET /api/sessions` (e o que a UI já consome); trocar `lib/sessions.ts`
  para buscar da API quando não estiver em `DEMO_MODE`.
- Remover `@supabase/supabase-js` e `lib/supabaseClient.ts`; atualizar `.env.example`
  (`DATABASE_PATH`, `ADMIN_TOKEN`, `LOCAL_AI_ENDPOINT` comentado).
- Garantir que o `Dockerfile` monta volume para `./data`.

**Pronto quando:** `npm run dev` (sem flag demo) mostra a programação vinda do SQLite;
`npm run dev:demo` continua funcionando; build standalone ok.

### E2 — Reações na sessão ao vivo

**Objetivo:** participante reage numa sessão em andamento e a reação fica gravada na
linha do tempo.

- UI na tela da sessão (`/sessao/[id]`): botões de reação pré-definida (❤️ 👏 👍 — fechar
  o conjunto ao implementar), **visíveis só enquanto a sessão está `live`**.
- `POST /api/reactions` → insere `timeline_events(tipo='reaction', payload={reaction},
  client_id)`. Anônimo (`client_id` já existe em `lib/clientId.ts`).
- Anti-flood: throttle por `client_id` no servidor (ex.: máx 1/seg) + debounce na UI.
- Feedback tátil/visual no toque (a reação "voa" — pode ser simples agora).
- Contagem agregada discreta na própria tela da sessão.

**Pronto quando:** dois navegadores reagindo na mesma sessão e as reações aparecem em
`timeline_events` com throttle funcionando.

### E3 — Tempo real (SSE) + modo telão "batimento cardíaco"

**Objetivo:** o telão projeta as reações ao vivo — o momento "uau" do piloto.

- `GET /api/live/[sessionId]` como **SSE**: stream de reações novas da sessão (poll
  interno no SQLite a ~1s ou notificação in-process; medir o mais simples que funciona).
- `/telao/[sessionId]` (e `/telao` escolhe a sessão ao vivo): linha de batimento cardíaco
  que pulsa a cada reação, agregado por tipo, identidade visual do evento (navy + cyan +
  vermelho `#D6004B` para picos). Fullscreen, pensado para projetor.
- Identidade anônima consistente: avatar/cor estável por `client_id` (hash → paleta).
- Tirar o Telão da navegação do app (decisão de 26/06 — hoje ainda está no menu em
  `layout.tsx`).
- Explorar como a reação aparece na timeline do app (bolinha que cresce / anéis / onda —
  ver `../design-system/app/roadmap.md`); implementar a opção mais barata.

**Pronto quando:** celular reage → telão pulsa em <2s, com vários dispositivos ao mesmo
tempo, rodando na rede local.

### E4 — Dashboard admin mínimo

**Objetivo:** a comissão vê números ao vivo durante o piloto; é o embrião do relatório.

- `/admin` protegido por `ADMIN_TOKEN` simples (query/cookie; sem gestão de usuários).
- Ao vivo: dispositivos ativos (client_ids únicos na última hora), reações por sessão,
  reações por minuto (gráfico de linha simples — os picos de engajamento).
- Sem BI: um punhado de números e 1–2 gráficos resolve o piloto.

**Pronto quando:** durante um teste com reações rolando, `/admin` mostra os números
atualizando.

### E5 — Piloto na reunião da comissão do Concefor

**Objetivo:** validar o núcleo (reagir → telão → dashboard) com gente de verdade.

- [ ] **Confirmar a data** da reunião da comissão (e se haverá demonstração no conselho
  de gestão também).
- Preparar: seed com uma "sessão" fictícia no horário da reunião; QR code na tela para
  entrar no app; telão projetado; roteiro de 10 min (mostrar app → todo mundo reage →
  telão pulsa → dashboard).
- Coletar: fricção de entrada (quantos conseguiram sem ajuda?), reação ao telão, ideias.
- Registrar aprendizados em `../decisoes.md` / `../contexto/reunioes/`.

**Pronto quando:** piloto aconteceu e os aprendizados estão registrados no cérebro.

---

## Pós-piloto (ordem sugerida, ajustar com os aprendizados)

### E6 — Programação oficial + conteúdo real

- Conseguir a planilha/doc da programação oficial (placeholder em `../links.md` — cobrar).
- Script de importação planilha → SQLite (`npm run import`); repetível, porque a
  programação vai mudar.
- Preencher `speakers` (bio/foto) com o material que chegar. Sem inventar dados.

### E7 — Perguntas com upvote (stretch goal — só se E1–E5 estiverem sólidos)

- `timeline_events(tipo='question')` + `tipo='question_vote'`; texto com limite de
  caracteres; janela aberta/fechada pelo admin; lista ordenada por votos; autor oculto.
- Moderação mínima: admin oculta pergunta no `/admin`.

### E8 — Login pelo crachá + consentimento (LGPD)

- **Bloqueado por:** confirmar no Even3 os campos do cadastro e o export/API da lista de
  inscritos (pendências em `../contexto/even3/README.md`).
- Importar inscritos; login = nº do ingresso (digitado ou QR scanner no app) + segundo
  fator; associa `client_id` ao inscrito.
- Tela de consentimento clara na entrada (modelo discutido em 02/07: quem não aceita usa
  a parte pública). Navegar nunca exige login.
- Divulgar o app aos inscritos antes do evento (mensagem via Even3, a confirmar).

### E9 — Endurecimento para o evento

- Admin de horários (editar sessão: horário/sala) — absorver atrasos.
- PWA de verdade: manifest ok, cache offline da programação, ícone do selo.
- Relatório pós-evento: ranking de sessões por engajamento, linha do tempo do evento,
  destaques do público; exportável (print/PDF).
- Deploy definitivo no Cefor (Docker + volume + backup do arquivo SQLite); ensaio de
  telão na sala real; plaquinhas físicas de fallback impressas.

---

## Pendências que não são código (podem andar em paralelo)

| Pendência | Onde está |
|---|---|
| Data da reunião da comissão (piloto) | — a confirmar com a comissão |
| Planilha da programação oficial | `../links.md` (placeholder) |
| Campos do cadastro / API Even3 | `../contexto/even3/README.md` |
| Prints do app do evento EDEN (benchmark networking) | pedir à Rutinha |
| Servidor do Cefor para deploy (ou notebook dedicado) | `../links.md` (placeholder) |
| Assets vetoriais do selo | `../contexto/identidade-selo.md` |

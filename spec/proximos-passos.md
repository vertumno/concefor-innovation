# Próximos passos — plano de execução (revisado em 16/07/2026)

Plano acionável do app v1, reformulado após a reunião com a Márcia (16/07 — ver
`../contexto/reunioes/sintese-2026-07-16.md`) e o benchmark do app EDEN
(`../contexto/benchmark-app-eden/`). Cada etapa está escopada para ser **uma sessão de
trabalho** (um prompt, um PR): objetivo, tarefas e critério de pronto.

**Datas duras** (acordadas com a Márcia, não mudam):

- **30/07, 10h** — validação com a comissão do Concefor
- **07/08 (sexta)** — lançamento por e-mail aos inscritos
- **17/08, 18h30** — abertura do evento

Estado de partida (16/07): E1–E3 do plano anterior **entregues** — SQLite + API routes,
reações com throttle, SSE, telão "batimento cardíaco". Não há dashboard admin nem barra
de navegação nova. A API do Even3 está validada (chave em `app/.env.local`, achados em
`../contexto/even3/api.md`).

---

## Caminho crítico até a validação (30/07)

### R1 — Reformulação da navegação: barra inferior + "Ao Vivo" ✅ (entregue 20/07)

**Objetivo:** o app passa a navegar pela barra inferior de 5 itens com o botão central
"Ao Vivo" (spec §4.0) — a cara nova que a comissão vai ver em 30/07.

> **Entregue em 20/07.** BottomNav com pílula ativa e pulso no live; `/ao-vivo` cobre os
> 3 estados (1 live → tela de reagir; várias → seletor; nenhuma → contagem regressiva);
> `/timeline`→`/agenda` e `/informacoes`→`/mais` com redirect 308; `/pessoas` lê os
> palestrantes do banco (`/api/speakers`). Nota de build: `better-sqlite3` subiu para
> ^12 (o Node 25 não tem prebuild da v11 e a máquina não tem toolchain C++).
>
> **Feedback de 20/07 (Elton viu rodando; aprovado — ver síntese da reunião):**
> - [x] Contadores longos com **dias + horas** ("em 28 d 2 h") — feito em 20/07.
> - [ ] **Diferenciar o Início** de Agenda/Ao Vivo (hoje repetem agora/a seguir): avisos da
>   organização, dica do dia e atalhos (ex.: leitor de QR) — encaixar antes de 30/07 se
>   couber, sem furar R2–R5.
> - [ ] Perfil no topo direito: genérico "faça login" → avatar/inicial (entra com o R7).

- Componente `BottomNav` (fixo, 5 slots, item ativo = pílula preenchida com label;
  tokens `--surface-2`/`--cyan`; central elevado em `--accent`).
- Rotas: `/` (Início), `/agenda` (hoje `/timeline` — redirecionar), `/ao-vivo`,
  `/pessoas`, `/mais` (absorve `/informacoes` — redirecionar).
- `/ao-vivo`: com uma sessão `live` → cai direto nela (tela de sessão com reações);
  várias simultâneas → seletor simples por sala; nenhuma → próxima sessão + contagem
  regressiva. Pulso discreto no botão quando há sessão live (`prefers-reduced-motion` ok).
- `/pessoas` v1: palestrantes (bio/foto do banco). Placeholder honesto até o R2 popular.
- Remover o `topnav` do `layout.tsx`; topbar mantém selo + gradiente.
- Ajustar `globals.css` (safe-area do iOS, padding inferior do conteúdo).

**Pronto quando:** no celular, todos os fluxos atuais são alcançáveis pela barra; um toque
no "Ao Vivo" durante uma sessão live cai na tela de reagir.

### R2 — Sync Even3 (somente leitura): programação, palestrantes e evento reais ✅ (entregue 20/07)

**Objetivo:** o app mostra a programação oficial que já está no Even3 — a planilha manual
morreu (achado de 16/07).

> **Entregue em 20/07** (`scripts/sync-even3.mjs` + `npm run sync:even3`): sync rodado 2×
> com a chave real — 15 sessões nos 4 dias, 10 duplicatas ignoradas, idempotente. Como o
> cadastro do Even3 veio **sem venue/tags/speakers**, o sync ganhou: título limpo (sai o
> prefixo "Dia N -"), **eixo por heurística do título** (tags vencem quando existirem),
> upsert com `coalesce` (Even3 vence quando fala; silêncio preserva o local) e
> **`db/enrich.sql`** aplicado ao final (salas do Auditório + palestrantes estruturados
> Vanessa/Tessarolo/Mariano, citados nos títulos/descrições do próprio Even3).
> **Modo teste garantido:** sessões locais sem prefixo `even3-` sobrevivem ao sync —
> `npm run seed:live` segue funcionando por cima da programação real (testado).
> **Seed manual aposentado**: `npm run seed` não deve mais ser usado (recriaria a
> programação antiga por cima); o caminho é `sync:even3`.
>
> ⚠️ **Divergência a verificar com a organização:** o Even3 não tem a mesa "Tecnologia
> Delas" (18/08 9h30) — no lugar há "Desafios da EaD para os próximos 20 anos" em DOIS
> dias (18 com "palestrantes confirmados: Felipe Tessarolo" e 19 com "pesquisadores
> locais"). A comunicação vem produzindo cards com outra programação — alinhar qual está
> certa (o app mostra o que está no Even3).

- `lib/even3.ts`: cliente server-side (`EVEN3_API_TOKEN` do env; header
  `Authorization-Token`); nunca importado por código de cliente.
- `npm run sync:even3`: `GET /session/getschedule` + `GET /speaker` → upsert em
  `sessions`/`speakers` (**deduplicar por `id_session`** — a API retorna sessões repetidas;
  guardar `even3_id` para re-sync idempotente). Sessões locais extras (ex.: fictícia de
  teste) sobrevivem ao sync.
- Mapear: `venue`→sala, datas+`start_time`/`end_time`→`inicio`/`fim` ISO, tags→eixo
  (conferir o que vem), speakers→`session_speakers`.
- Rodar o sync e conferir os 4 dias no app de verdade.

**Pronto quando:** `npm run sync:even3` duas vezes seguidas popula o banco com a
programação real sem duplicar nada, e a agenda do app mostra os 4 dias.

### R3 — Dashboard admin mínimo ✅ (entregue 20/07)

**Objetivo:** a comissão vê números ao vivo na validação; é o embrião do relatório.

> **Entregue em 20/07.** `/admin` protegido por `ADMIN_TOKEN` (header/`?token=` →
> localStorage; fora da nav): dispositivos ativos (1 h), reações totais/por sessão/por
> minuto (barras), moderação de perguntas (R4) e botão de re-sync Even3 (reusa o
> `runSync()` do script — fonte única). Atualiza a cada 5 s.

- `/admin` protegido por `ADMIN_TOKEN` (query/cookie; sem gestão de usuários; fora da nav).
- Ao vivo: dispositivos ativos (client_ids únicos na última hora), reações por sessão,
  reações por minuto (linha simples — os picos).
- Botão "re-sincronizar Even3" (dispara o sync do R2 no servidor).

**Pronto quando:** durante um teste com reações rolando, `/admin` mostra os números
atualizando e o re-sync funciona.

### R4 — Perguntas com upvote ✅ (entregue 20/07)

**Objetivo:** segunda interação da tela Ao Vivo (a Márcia validou com entusiasmo em
16/07). ~~Primeira coisa a cortar se o caminho crítico apertar.~~

> **Entregue em 20/07**, sem mudar o schema (spec §3): `tipo='question'` /
> `question_vote` / `questions_window` em `timeline_events`. Texto ≤140, autor oculto,
> 1 voto por dispositivo (toggle), throttle 15 s, janela abre/fecha e ocultar/reexibir
> pelo `/admin`; lista atualiza por polling de 4 s. Testado: ordenação por votos,
> toggle de voto, moderação e UTF-8 ponta a ponta.

- `timeline_events` tipo `question` / `question_vote`; texto com limite (~140), autor
  oculto no app, 1 voto por `client_id` por pergunta.
- UI na tela da sessão ao vivo: lista ordenada por votos, compositor simples.
- Janela abre/fecha pelo `/admin` + ocultar pergunta (moderação mínima).

**Pronto quando:** dois navegadores perguntam/votam e a ordem atualiza ao vivo; admin
consegue fechar a janela e ocultar uma pergunta.

### R5 — Deploy em endereço estável (articular com a TI)

**Objetivo:** sair do notebook do Marquito. Para a validação de 30/07 (participantes
remotos!) e obrigatório pro lançamento. **HTTPS é requisito**, não luxo: PWA instalável e
a câmera do QR scanner (R7/networking) só funcionam em secure context.

- Articular com a TI do Cefor: onde roda o Docker, DNS/URL amigável, HTTPS (proxy
  reverso), persistência do volume `./data` + backup do arquivo SQLite.
- Deploy do build standalone; smoke test de SSE atrás do proxy (buffering off).
- Plano B documentado: notebook na rede local do evento (LAN sobrevive sem internet).

**Pronto quando:** URL estável com HTTPS abre o app de fora da rede do Cefor, reações
fluem pro telão em <2s e o arquivo do banco sobrevive a restart do container.

### R6 — Validação com a comissão (30/07, 10h)

**Objetivo:** validar o app reformulado com gente de verdade e decidir o corte final do
lançamento.

- Preparo: sessão fictícia no horário da reunião (extra local, sobrevive ao sync), QR de
  acesso projetado, telão, roteiro de 10 min (entrar → navegar pela barra → Ao Vivo →
  reagir → perguntar → telão pulsa → dashboard).
- Coletar: fricção de entrada (quantos entraram sem ajuda?), reação ao telão e às
  perguntas, ideias.
- Registrar aprendizados em `../decisoes.md` / `../contexto/reunioes/` e recortar o
  escopo do lançamento com base neles.

**Pronto quando:** validação aconteceu e os aprendizados estão registrados no cérebro.

---

## Da validação ao lançamento (07/08)

### R7 — Login pelo crachá + consentimento (LGPD)

**Objetivo:** interagir passa a ter identidade (navegar segue aberto). Destravado pela
API: o QR do crachá codifica o `checkin_code` que já vem no sync de inscritos.

- Estender o sync do R2: `GET /attendees/` → tabela `attendees` local (**288+ inscritos**;
  PII fica só no servidor).
- [x] ~~Decidir o segundo fator com o Elton~~ → **decidido 20/07: 4 primeiros dígitos do
  CPF** (ideia registrada: redefinir para senha própria após o primeiro login).
- Login: **nº do ingresso digitado é o caminho primário** — o QR impresso no crachá não é
  garantido (crachá vai pra gráfica, decisão de 20/07); QR scanner entra depois se der
  (exige HTTPS do R5) + segundo fator; associa `client_id` ao inscrito; sessão persistente
  no dispositivo. "Meu QR" no app pode substituir o QR físico onde faltar.
- Tela de consentimento clara na entrada (modelo de 02/07): quem não aceita segue na
  parte pública, interagindo anonimamente onde permitido.
- Avatar/inicial no topo direito quando logado (padrão EDEN).

**Pronto quando:** um inscrito real loga com nº do ingresso + segundo fator, reage, e a
reação sai associada a ele no banco; quem recusa o consentimento continua navegando.

### R8 — Lançamento (07/08): PWA de verdade + e-mail aos inscritos

**Objetivo:** o app público, instalável, divulgado para quem está inscrito.

- PWA: manifest ok, ícone do selo, cache offline da programação, teste de instalação
  Android + iPhone.
- Congelamento de features do lançamento (o que não entrou vai pra semana do evento ou
  morre).
- Texto do e-mail com a Márcia (ela manda pros grupos de inscritos) + QR code de acesso
  para materiais impressos/telões.
- Smoke test final na URL pública; seed real conferido.

**Pronto quando:** e-mail enviado em 07/08 com o app no ar, instalável, com a programação
oficial.

---

## Semana pré-evento e evento (10–20/08)

### R9 — Endurecimento para o evento

- Admin de horários (editar sessão: horário/sala/ordem) — absorver atrasos de última hora.
- Relatório pós-evento: ranking de sessões por engajamento, linha do tempo do evento,
  destaques do público; exportável (print/PDF) — insumo do relatório institucional (PRPPG).
- Ensaio de telão na sala real; plaquinhas físicas de fallback impressas.

### R10 — Candidatas da semana do evento (só se R1–R9 estiverem sólidos; nesta ordem)

1. **Avisos da organização** no Início (mão única, sem chat).
2. **Dica do dia** (alimentação, arredores) — precisa de conteúdo da Márcia.
3. **Networking por QR do crachá**: scanner no app lê o crachá do outro → salva contato
   (nome/e-mail do banco de inscritos). Sem chat interno (decisão do benchmark EDEN).
4. **Gamificação leve**: QR codes espalhados → badges, contextuais ao conteúdo.

**Fase 2 / pós-evento** (registrado, sem compromisso): relatório individual por
participante (reações + transcrição → IA local; ideia do Elton em 16/07, insumo pro
relatório PRPPG) · transcrição com minutagem → "momentos quentes" · demais itens do
backlog em `app-v1.md` §8.

---

## Pendências que não são código (podem andar em paralelo)

| Pendência | Estado / onde está |
|---|---|
| Servidor do Cefor + URL/HTTPS para deploy (R5) | **urgente** — articular com a TI; ver `../links.md` |
| ~~Chave `EVEN3_API_TOKEN` em `app/.env.local` desta máquina~~ | **resolvida 20/07** — Marquito enviou; gravada no `.env.local` (gitignored) |
| Even3 desatualizado em relação ao site (fonte da verdade editorial) | **mensagem à Márcia preparada em 20/07**: atualizar o Even3 pra espelhar o site (mesa "Tecnologia Delas" 18/08, intervalos, momentos culturais) e mantê-lo em dia — o app espelha o Even3; até corrigirem lá, o app mostra a versão desatualizada |
| Cadastro do Even3 sem salas/tags/palestrantes | pedir à organização preencher lá (aí `db/enrich.sql` esvazia); enquanto isso o enriquecimento local cobre |
| ~~Segundo fator do login (CPF parcial × e-mail)~~ | **decidido 20/07** — 4 primeiros dígitos do CPF |
| Crachá: gráfica imprime lote personalizado (nome+QR+categoria)? | Elton verifica com a copiadora/gráfica; se sim, geramos a planilha a partir do sync Even3 (R2/R7) |
| Impressora de etiquetas no campus (inscrições de última hora) | organização do evento verifica (20/07) |
| Teste de carga das reações (SQLite, 100–200 simultâneos) | fazer no R9 (endurecimento), na URL real do R5 |
| Convidados da validação de 30/07 | Márcia convida (CGPE, Simon, Rutinelli aventados) |
| Texto do e-mail de lançamento (07/08) | escrever com a Márcia na semana de 03/08 |
| Conteúdo de "dica do dia" / alimentação / arredores | pedir à Márcia (ela topou mandar) |
| Transmissão ao vivo × gravação por sessão | Márcia levou pro checklist dela (16/07) |
| Envio de mensagem aos inscritos pelo Even3 | verificar; plano A é e-mail comum |
| Assets vetoriais do selo | `../contexto/identidade-selo.md` |
| ~~Planilha da programação oficial~~ | **morta** — programação vem da API Even3 (R2) |
| ~~Prints do app EDEN~~ | **chegou 16/07** — `../contexto/benchmark-app-eden/` |
| ~~Campos do cadastro / API Even3~~ | **resolvida 16/07** — `../contexto/even3/api.md` |

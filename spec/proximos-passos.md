# Próximos passos — plano de execução (revisado em 30/07/2026, pós-validação)

Plano acionável do app v1. Última revisão grande após o **teste de validação de 30/07**
(aprovado — ver `../contexto/reunioes/sintese-2026-07-30.md`); histórico das revisões
anteriores em 16/07 (`sintese-2026-07-16.md`) e no benchmark EDEN. Cada etapa está
escopada para ser **uma sessão de trabalho**: objetivo, tarefas e critério de pronto.

**Datas duras** (revisadas em 30/07 com Márcia/Elton/Juliana):

- ~~30/07~~ — **validação feita e aprovada** (9h–10h45)
- **05/08 (qua), 15h** — teste com a comissão toda (meia hora, sala híbrida)
- **10/08 (segunda)** — lançamento por e-mail aos inscritos (~~era 07/08~~)
- **17/08, 18h30** — abertura do evento

Janela de implementação: **o grosso em 03–04/08** (segunda/terça; Marquito viaja
31/07–02/08).

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
> - [x] **Diferenciar o Início** — feito em 20/07: avisos da organização (admin publica),
>   "não perca", sessão no ar com CTA pro Ao Vivo, só 3 próximas + link pra Agenda,
>   saudação pelo nome quando logado. (Atalho de leitor de QR fica pro networking/R10.)
> - [x] Perfil no topo direito — feito em 20/07: "Entrar" → avatar/inicial (R7).

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

### R5 — Deploy em endereço estável (articular com a TI) 🟡 (no ar por IP desde 29/07)

**Objetivo:** sair do notebook do Marquito. Para a validação de 30/07 (participantes
remotos!) e obrigatório pro lançamento. **HTTPS é requisito**, não luxo: PWA instalável e
a câmera do QR scanner (R7/networking) só funcionam em secure context.

> **29/07:** app no ar em **http://172.17.159.15:3000** (servidor CGTI, Sérgio). Deploy
> **manual** (Sérgio puxa o espelho GitLab no servidor); integração automática em estudo.
> A primeira versão no ar estava desatualizada (espelho sem R1–R9) e com a base do seed
> antigo — corrigido em 29/07, ver `validacao-2026-07-30.md` e `../decisoes.md`.
>
> **30/07: 🎉 https://app.cefor.ifes.edu.br no ar com TLS válido** (proxy em IP público;
> SSE atravessa — testado). PWA instalável e câmera de QR destravados.
>
> **30/07 (tarde): integração contínua no ar** — merge no `main` do GitLab = produção.
> Fluxo de trabalho: branch → teste local → MR no GitLab (ver `../decisoes.md`).
> **Faltam:** testar acesso de fora da rede (4G), rotina de backup do volume, e o smoke
> test de instalação PWA no domínio (R8).

- Articular com a TI do Cefor: onde roda o Docker, DNS/URL amigável, HTTPS (proxy
  reverso), persistência do volume `./data` + backup do arquivo SQLite.
- Deploy do build standalone; smoke test de SSE atrás do proxy (buffering off).
- Plano B documentado: notebook na rede local do evento (LAN sobrevive sem internet).

**Pronto quando:** URL estável com HTTPS abre o app de fora da rede do Cefor, reações
fluem pro telão em <2s e o arquivo do banco sobrevive a restart do container.

### R6 — Validação com a comissão (30/07) ✅ (feita e aprovada)

**Objetivo:** validar o app reformulado com gente de verdade e decidir o corte final do
lançamento.

> **✅ 30/07:** *"o melhor teste de protótipo que já fiz — tudo funcionou"*. Telão,
> reações, perguntas, admin, PWA, login e conexões validados no domínio oficial com
> Elton, Juliana, CGTI e Márcia. Aprendizados, bugs e decisões em
> **`../contexto/reunioes/sintese-2026-07-30.md`** e `../decisoes.md`. O plano abaixo
> ("Da validação ao lançamento") foi reescrito a partir deles.

> Preparação de 29/07 (roteiro, checklists, riscos): `validacao-2026-07-30.md`.
> Sessões fictícias: `npm run seed:validacao`; QR projetável: `/projecao`.

- Preparo: sessão fictícia no horário da reunião (extra local, sobrevive ao sync), QR de
  acesso projetado, telão, roteiro de 10 min (entrar → navegar pela barra → Ao Vivo →
  reagir → perguntar → telão pulsa → dashboard).
- Coletar: fricção de entrada (quantos entraram sem ajuda?), reação ao telão e às
  perguntas, ideias.
- Registrar aprendizados em `../decisoes.md` / `../contexto/reunioes/` e recortar o
  escopo do lançamento com base neles.

**Pronto quando:** validação aconteceu e os aprendizados estão registrados no cérebro.

---

## Da validação ao lançamento (10/08)

Etapas novas saídas do teste de 30/07, em ordem de prioridade. V1 e V2 precisam estar
prontas **antes do teste de 05/08**; o resto entra até o congelamento do lançamento.

### V1 — Correções do teste de 30/07 (bugs) — antes de 05/08 🟡 (4 de 6 entregues em 04/08)

> **Entregue em 04/08** (branch `feat/conexoes-por-pessoa`, ver `../decisoes.md`), com um
> bug novo achado no caminho: **as conexões eram do aparelho, não da pessoa** —
> `insertConnection` gravava só o `client_id` do localStorage, então reinstalar o PWA
> (no iOS o app instalado tem storage separado do Safari), trocar de aparelho ou limpar
> o navegador zerava o mosaico, e outra pessoa logando no mesmo aparelho herdava as
> conexões da anterior. Agora a conexão carrega `payload.de` (o attendee de quem
> conecta), com migração idempotente no boot. **Falta testar no iPhone de verdade.**

1. [x] **Login por e-mail** — `findAttendeeByLogin` aceita CPF4 **ou** e-mail no mesmo
   campo; a rota ainda aceita o nome antigo `cpf4` no corpo (app em cache do PWA).
2. [x] **Scanner de QR sem câmera no iPhone/alguns Androids**: sem `BarcodeDetector`, cai
   no **jsQR** sobre canvas (import dinâmico, meia resolução), com mensagem clara quando a
   permissão é negada e botão de tentar de novo. **Validar no iPhone da Juliana.**
3. [ ] **Vazamentos de layout** (celular do Sérgio + prints da Juliana): botão Conectar,
   filtros da Agenda, revisar em viewport pequeno/zoom grande.
4. [x] **Avisos**: polling de 30 s + ao voltar pra aba, e botão **apagar** no admin.
5. [x] **Perguntas órfãs**: o admin lista também sessões encerradas com janela aberta.
6. [ ] Polimento da tela do perfil (meu QR / nº do ingresso).

**Também em 04/08 (não estava na lista):** cartão da conexão com **símbolo do WhatsApp +
wa.me** (número normalizado), **copiar cada dado**, copiar tudo e **salvar nos contatos**
(.vcf) — pedido do Marquito ao rever o networking.

**Pronto quando:** iPhone da Juliana conecta pela câmera (ou recebe fallback claro),
Márcia loga com e-mail, aviso publicado aparece sozinho, e nenhum botão vaza nos prints.

### V2 — Novas reações contextualizadas (Elton implementa) — antes de 05/08

**Que massa 👏 · Me identifico 🙋 · Vou usar ✅ · Amei 💚 (coração na paleta) ·
Explodiu a mente 🤯** — substituem as genéricas; viram medição (cruzam com transcrição
no relatório). **Branch do Elton, merge direto autorizado.** Apoiar: revisar o branch,
atualizar o mapeamento de emojis do telão e as legendas, migrar/zerar dados de teste.

**Pronto quando:** mergeado, telão e relatório falam as novas reações, espelho GitLab
atualizado.

### V3 — Telão 2.0

- **Token no telão** (hoje é público; mesma mecânica do admin, `?token=` → localStorage).
- **Perguntas mais votadas no telão** (top N, sem scroll infinito — desenho da Juliana:
  mostrar as primeiras, "ver outras" a critério do operador).
- Animações/efeito "uau": thresholds de reações disparam surpresa visual; reação
  aparece grande ao clicar.
- Telão ocioso (sem sessão ao vivo) mostra a tela de acesso (`/projecao`) sozinho.

### V4 — Materiais dos palestrantes (depende do Alex/Even3)

- Reunião com o Alex (semana de 03/08): a API expõe os materiais anexados à atividade?
  (Juliana confirmou que o organizador consegue anexar no painel.)
- Se sim: sync puxa e a página da sessão mostra os materiais (sem menu novo; "todos os
  materiais" pode ser link no Mais). Se não: CGTE recebe por e-mail e cadastra à mão
  (mecanismo mínimo de upload/URL no admin).
- Márcia intermedia autorização com cada palestrante (nem todos compartilham).

### V5 — Teste com a comissão toda (05/08, 15h)

- Nova grade fictícia: `npm run seed:validacao -- --data=2026-08-05` (ajustar horários
  pelo admin se preciso); `--limpar` da grade de 30/07.
- Meia hora, sala híbrida: entrar pelo QR → reagir (novas reações) → perguntar → telão.
- Coletar de novo: fricção, ideias, veto de última hora. Registrar no cérebro.

### R7 — Login pelo crachá + consentimento (LGPD) 🟡 (núcleo entregue 20/07; exigência p/ interagir fica pós-validação)

**Objetivo:** interagir passa a ter identidade (navegar segue aberto). Destravado pela
API: o QR do crachá codifica o `checkin_code` que já vem no sync de inscritos.

> **20/07 — entregue o núcleo:** sync puxa os **288 inscritos** (tabela `attendees`, PII
> só no servidor, CPF normalizado); `/entrar` com consentimento explícito + nº do
> ingresso + 4 primeiros dígitos do CPF; anti força-bruta (5 tentativas/min); associação
> `client_id`↔inscrito na tabela `identities` (sair = apagar); avatar/inicial na topbar;
> saudação no Início; tiles de inscritos/logados no admin. **Login é OPCIONAL por ora** —
> reagir/perguntar seguem anônimos (decisão de 06/07: anônimo é o piso até a validação);
> a exigência de login para interagir liga depois de 30/07, se validada.
> **Faltam:** QR scanner (exige HTTPS do R5) · validar o texto do termo LGPD com a
> organização · decidir quando ligar a exigência.

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

### R8 — Lançamento (**10/08, segunda**): PWA de verdade + e-mail aos inscritos

**Objetivo:** o app público, instalável, divulgado para quem está inscrito.

> 30/07: instalação validada (iPhone via Safari/Compartilhar, Android via menu;
> `apple-touch-icon` corrigido no mesmo dia). Manifest ok. Falta o service worker.

- PWA: wiring do `next-pwa` (service worker + cache offline da programação); de quebra,
  **testar notificações push** (pedido da Juliana: "faltam 5 min pra palestra") — se o
  suporte for ruim (iOS), o contador regressivo do Ao Vivo já cobre.
- **Limpar os dados de teste do servidor** (reações/perguntas/conexões de 29–30/07 e
  05/08 + `seed-validacao --limpar`) no congelamento.
- Congelamento de features (o que não entrou vai pra semana do evento ou morre).
- Texto do e-mail com a Márcia (ela envia pela plataforma a todos os inscritos) +
  **vídeo tutorial curto** (Juliana/CGTE) + QR de acesso para materiais impressos.
- Smoke test final no domínio; programação real conferida.

**Pronto quando:** e-mail enviado em 10/08 com o app no ar, instalável, com a programação
oficial e sem dados de teste.

---

## Semana pré-evento e evento (10–20/08)

### R9 — Endurecimento para o evento 🟡 (código entregue 20/07; falta o ensaio físico)

- [x] Admin de horários — seção "Programação" no `/admin`: editar início/fim/sala de
  qualquer sessão (com aviso de que o re-sync do Even3 sobrescreve horários — corrigir lá
  também). Entregue 20/07.
- [x] Relatório pós-evento — `/admin/relatorio`: números gerais, reações por tipo, ranking
  de sessões por engajamento (com barras), momentos mais quentes (picos/min); botão
  Imprimir/PDF com `@media print` limpo. Insumo do relatório institucional (PRPPG).
  Entregue 20/07.
- [ ] Ensaio de telão na sala real; plaquinhas físicas de fallback impressas.
- [ ] **Cerimonial** (30/07): fala de 1 min na abertura + lembrete de 15 s do mestre de
  cerimônias em toda sessão + QR no telão — combinar roteiro com a Márcia.
- [ ] **Etiquetas do crachá com QR do app + nº do ingresso embaixo** (Elton confirma a
  impressão; gerar a partir do sync — casa com `comunicacao/.../etiquetas-nomes.md`).
- [ ] **Desenhar o Ao Vivo com sessões simultâneas** (programação técnica paralela à
  palestra): o seletor por sala existe, mas a UX de "vários ao vivo" não foi testada.
- [ ] Admins do evento: Marquito, Elton, Juliana + indicação da Márcia (tokens e
  treino de 15 min no /admin mobile).

### R10 — Candidatas da semana do evento (só se R1–R9 estiverem sólidos; nesta ordem)

1. ~~**Avisos da organização** no Início~~ — **antecipada, entregue 20/07** (admin publica).
2. **Dica do dia** (alimentação, arredores) — precisa de conteúdo da Márcia.
3. ~~**Networking por QR do crachá**~~ — **antecipada, entregue 20/07** como **mosaico de
   conexões** na tela Pessoas: quadradinhos (malha do selo) com as iniciais dos 290
   inscritos, apagados; escanear o QR do crachá do outro (BarcodeDetector, com fallback
   de digitar o nº — câmera plena exige o HTTPS do R5) acende o quadradinho; contato
   completo (nome + e-mail) só depois de conectar; conexões mais recentes no topo;
   "meu QR" no perfil substitui o QR físico. Sem chat interno (decisão do benchmark EDEN).
4. **Gamificação leve**: QR codes espalhados → badges, contextuais ao conteúdo.

**Fase 2 / pós-evento** (registrado, sem compromisso): relatório individual por
participante (reações + transcrição → IA local; ideia do Elton em 16/07, insumo pro
relatório PRPPG) · transcrição com minutagem → "momentos quentes" · demais itens do
backlog em `app-v1.md` §8.

---

## Pendências que não são código (podem andar em paralelo)

| Pendência | Estado / onde está |
|---|---|
| Servidor do Cefor + URL/HTTPS para deploy (R5) | ✅ **https://app.cefor.ifes.edu.br no ar desde 30/07** (TLS válido, SSE ok; usar sempre o DNS nos links). IP interno 172.17.159.15:3000 só como fallback. Deploy manual via espelho GitLab; falta backup do volume e teste de acesso externo (4G) |
| ~~Chave `EVEN3_API_TOKEN` em `app/.env.local` desta máquina~~ | **resolvida 20/07** — Marquito enviou; gravada no `.env.local` (gitignored) |
| Even3 desatualizado em relação ao site (fonte da verdade editorial) | **mensagem à Márcia preparada em 20/07**: atualizar o Even3 pra espelhar o site (mesa "Tecnologia Delas" 18/08, intervalos, momentos culturais) e mantê-lo em dia — o app espelha o Even3; até corrigirem lá, o app mostra a versão desatualizada |
| Cadastro do Even3 sem salas/tags/palestrantes | pedir à organização preencher lá (aí `db/enrich.sql` esvazia); enquanto isso o enriquecimento local cobre |
| ~~Segundo fator do login (CPF parcial × e-mail)~~ | **fechado 30/07: aceitar CPF4 OU e-mail no mesmo campo** (premissa "CPF p/ todos" quebrou em 29/07; na reunião foi dito como já funcionando) — **implementar no V1** |
| Crachá: gráfica imprime lote personalizado (nome+QR+categoria)? | Elton verifica com a copiadora/gráfica; se sim, geramos a planilha a partir do sync Even3 (R2/R7) |
| Impressora de etiquetas no campus (inscrições de última hora) | organização do evento verifica (20/07) |
| Teste de carga das reações (SQLite, 100–200 simultâneos) | fazer no R9 (endurecimento), na URL real do R5 |
| Inscritos não confirmados no Even3 (~151/300, todos sem categoria; **a própria Márcia está 3× entre eles**) | 30/07: **não filtrar** por ora; Juliana acha que "confirmado" = credenciamento no evento, mas há ~150 marcados antes — **perguntar ao Alex** (reunião semana de 03/08, junto com API de materiais, e-mail e coffee breaks) |
| Limpar dados de teste do servidor antes do lançamento (10/08) | reações/perguntas/conexões dos testes de 29–30/07 e 05/08 em `timeline_events`; sessões `demo-validacao-*` saem com `seed-validacao --limpar`; faxina no congelamento do R8 |
| ~~Convidados da validação de 30/07~~ | **feita 30/07** — Elton, Juliana, CGTI, Márcia; próximo: comissão toda em 05/08 15h (Márcia convoca) |
| Texto do e-mail de lançamento (**10/08**) + vídeo tutorial | escrever com a Márcia na semana de 03/08 (ela envia pela plataforma); vídeo curto com a CGTE (ideia da Juliana, 30/07) |
| Conteúdo de "dica do dia" / alimentação / arredores | pedir à Márcia (ela topou mandar) |
| Transmissão ao vivo × gravação por sessão | Márcia levou pro checklist dela (16/07) |
| Envio de mensagem aos inscritos pelo Even3 | verificar; plano A é e-mail comum |
| Assets vetoriais do selo | `../contexto/identidade-selo.md` |
| ~~Planilha da programação oficial~~ | **morta** — programação vem da API Even3 (R2) |
| ~~Prints do app EDEN~~ | **chegou 16/07** — `../contexto/benchmark-app-eden/` |
| ~~Campos do cadastro / API Even3~~ | **resolvida 16/07** — `../contexto/even3/api.md` |

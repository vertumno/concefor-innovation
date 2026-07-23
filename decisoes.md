# Decisões

Log datado das decisões do projeto, com o porquê. Mais recente no topo.

---

## 2026-07-23 — App espelhado para o GitLab do IFES (só `app/`); monorepo segue como fonte

**Decisão:** o código do app passa a ter um **espelho no GitLab do IFES**
(https://gitlab.ifes.edu.br/cefor/concefor-app), contendo **apenas a pasta `app/`** extraída
com histórico via `git subtree split --prefix=app`. O **monorepo (GitHub) continua sendo a
fonte de verdade** e o "cérebro"; o GitLab é o repositório que a CGTI/Sérgio usam para revisar e
**deployar** — resolve o pedido do Saymon (gestor da CGTI, 23/07) de dar acesso ao Sérgio sem
expor na infra institucional o material interno (comunicação, reuniões, brainstorm, decisões).
O `README.md` do app foi reescrito para ser as **instruções de instalação/deploy** (Docker,
HTTPS obrigatório, variáveis, backup) e é o README do repo no GitLab.

**Atualizar o espelho** (após mudanças em `app/`): o `main` do GitLab é **branch protegida**
(sem force push), e o remoto carrega o commit inicial do GitLab mesclado. Rotina que faz
fast-forward:

```bash
git subtree split --prefix=app -b gitlab-split      # re-split determinístico do app/
git checkout gitlab-app                             # branch de espelho (mantém o merge history)
git merge -X theirs --no-edit gitlab-split          # traz as novas mudanças
git push gitlab gitlab-app:main                     # fast-forward, aceito pela branch protegida
git checkout main && git branch -D gitlab-split
```

Remote: `git remote add gitlab https://gitlab.ifes.edu.br/cefor/concefor-app.git`. Segredos
(`.env.local`, `/data/`, `*.db`) são gitignored — não vão no espelho.

**Por quê:** o Sérgio é do IFES e acessa o GitLab institucional nativamente (sem entrar na
conta pessoal `vertumno`); e o app oficial do evento fica sob governança institucional, com
CI/CD do GitLab disponível para build/deploy. Mantém-se **uma** fonte de verdade (monorepo) —
o GitLab é derivado, não concorrente. Ver `links.md` (Repositório).

---

## 2026-07-16 — Interface reformulada: barra inferior com "Ao Vivo" no centro (benchmark EDEN)

**Decisão:** o menu do app sai do topo e vira **barra inferior fixa de 5 itens** — Início ·
Agenda · **● Ao Vivo** (slot central em destaque, gold) · Pessoas · Mais — inspirada nos
prints do app do evento EDEN 2026 (`contexto/benchmark-app-eden/`), mantendo o design
system. O botão central leva direto à sessão acontecendo agora (reações/perguntas); sem
sessão ao vivo, mostra a próxima com contagem regressiva. Do EDEN levamos também: pílula
preenchida no item ativo, avatar de login no topo direito, lista de participantes com
busca, mapa dentro do app. **Não** levamos chat interno nem canais estilo Slack (custo de
moderação — alerta do Léo em 02/07); nosso networking segue sendo troca de contato por QR
do crachá. Spec §4.0 e plano (`spec/proximos-passos.md` R1) atualizados.

**Por quê:** barra inferior é o padrão consolidado de app de evento (alcançável com o
polegar, labels visíveis); e o slot central em destaque dá interface ao conceito-espinha
do projeto — a linha do tempo/"o que está acontecendo agora" vira o botão mais visível do
app. É a reformulação que a comissão verá na validação de 30/07.

---

## 2026-07-16 — Even3 conectado via API, somente leitura; chave fora do repo

**Decisão:** obtida e validada a chave da API do Even3 do VIII Concefor. Ela vive em
`app/.env.local` (**gitignored** — jamais commitá-la), placeholder documentado em
`app/.env.example`, achados em `contexto/even3/api.md`. Uso **somente leitura** por ora:
um sync server-side puxa programação/palestrantes/inscritos para o SQLite (o navegador
nunca fala com o Even3). Credenciamento/check-in por API fica para decisão futura.

**Achados que mudam o plano** (validados com chamadas reais em 16/07):

- O QR do crachá codifica o campo **`checkin_code`** dos inscritos → login pelo crachá
  casa direto com o sync, sem export manual.
- **Não existe data de nascimento no cadastro** → o segundo fator de 02/07 caiu; restam
  CPF parcial ou e-mail (decidir com o Elton).
- A **programação oficial já está no Even3** (4 dias) → a pendência "planilha da
  programação" morreu; importação vira `npm run sync:even3`.
- **288 inscritos** já retornados pela API em 16/07 (lista viva, inscrições de última hora
  entram sozinhas).
- Cuidado: `getschedule` retorna sessões duplicadas — deduplicar por `id_session`.

**Por quê:** a reunião de 16/07 já tinha descartado export estático em favor da API; com a
chave validada, o caminho de login + dados reais destravou de vez. Leitura-apenas limita o
raio de dano de um vazamento e mantém o Even3 como fonte da verdade das inscrições.

---

## 2026-07-16 — Repo único: central de comunicação (concefor2026) incorporada em `comunicacao/`

**Decisão:** o repo `concefor2026` (central de comunicação da CGTE — programação, palestrantes,
board de produção de peças, calendário de publicação, marca) foi **incorporado a este repo** na
pasta `comunicacao/`, via `git subtree add` — o histórico completo dos commits dele foi
preservado no log deste repo. Este passa a ser o **repo único do Concefor**, com duas áreas:
inovação/app (raiz) e comunicação (`comunicacao/`). A estrutura interna da área de comunicação
(contexto numerado, produção por fase, planejamento, templates, `_inbox` próprio) foi mantida
intacta; a entrada da área é `comunicacao/README.md`.

**Por quê:** mesma dor que criou este repo — "tem que ter algum lugar que é o cérebro". Dois
cérebros do mesmo evento em repos separados recriavam a dispersão que queríamos matar (fatos do
evento, marca e prazos duplicados). O repo antigo em `github.com/vertumno/concefor2026` deve
ser **arquivado** (leitura apenas) para não virar fonte concorrente de verdade.

**Pendência consciente:** há sobreposições a consolidar aos poucos — `contexto/evento.md` vs
`comunicacao/contexto/00-evento.md`, e os PNGs do selo 20 anos que existem em
`design-system/selo-20-anos/assets/logo-png/` e em `comunicacao/contexto/_marca/logos/`.
Regra até lá: **identidade/tokens → `design-system/`; fatos operacionais do evento e peças →
`comunicacao/`**.

---

## 2026-07-16 — Cronograma do app fechado com a Márcia: validação 30/07, lançamento 07/08

**Decisão:** primeira demo do app pra Márcia (Concefor), na reunião de divulgação com
Elton. Compromisso fechado: **30/07 às 10h** roda uma simulação/validação com a comissão
do Concefor (presencial ou remoto, convidados a definir); ajustes na semana seguinte;
**lançamento alvo em 07/08** (sexta-feira) via e-mail aos inscritos. Escopo mínimo
garantido pro lançamento: programação + telão com reações (já funciona). Login por nº de
inscrição + data de nascimento, dados por pessoa e relatório individual pós-evento ficam
como "se der, melhor" — não são compromisso do v1. Duas ideias novas ficaram registradas
(não implementadas): resumo pessoal pós-evento cruzando reações+transcrição por pessoa
(sugestão do Elton, também serviria de insumo pro relatório institucional na PRPPG), e
gamificação por QR codes espalhados com badges contextuais ao conteúdo. Ver síntese
completa em `contexto/reunioes/sintese-2026-07-16.md`.

**Por quê:** era a primeira vez que a Márcia via o app rodando — precisava de um
compromisso de data pra não virar promessa solta, e de deixar claro o que é garantido
(v1 mínimo) vs. o que é aspiracional, para não sobrecarregar o v1 já perto do prazo do
evento real.

---

## 2026-07-06 — Backend do v1: SQLite local + SSE no próprio Next (Supabase sai por ora)

**Decisão:** o v1 troca Supabase por **SQLite local** (arquivo no servidor, via
`better-sqlite3`) com **API routes do próprio Next** para gravar/ler e **SSE**
(Server-Sent Events) para o tempo real das reações/telão. A camada de dados fica atrás de
uma interface única (`lib/db`), para que voltar ao Supabase (ou ir a outro Postgres) seja
troca barata. O schema conceitual não muda (`sessions`, `speakers`, `timeline_events`).

**Por quê:** a conta Supabase do Marquito está sem espaço para um projeto novo, e as
reações não exigem mais que um servidor comum na rede — SSE resolve o pub/sub. Bônus real:
zero custo, zero dependência externa e **funciona na rede local do Cefor mesmo se a
internet cair** (o maior risco listado na spec §10). **Consequência:** o deploy deixa de
poder ser Vercel serverless (SQLite precisa de disco persistente e SSE de processo
sempre-ligado) — o caminho é o que já estava previsto como alternativa: **self-host no
Cefor via Docker** (ou notebook na rede do evento, para piloto/fallback). Se mais tarde
quisermos Vercel + Supabase de volta, basta liberar espaço (pausar projeto antigo ou nova
org gratuita) e reimplementar a interface `lib/db`.

---

## 2026-07-06 — Rumo ao piloto: reações anônimas primeiro, login pelo crachá depois

**Decisão:** o **piloto** (teste na **reunião da comissão do Concefor** — não no conselho
de gestão, embora possa ser mostrado lá também; data a confirmar, ≈ semana de 13/07) sai
com **reações 100% anônimas** (`client_id` no dispositivo), como a spec original. O
**login pelo crachá** discutido em 02/07 (QR/nº do ingresso Even3 + segundo fator) **entra
depois do piloto e antes do evento**, como barreira apenas para interagir — navegar segue
aberto. **Perguntas com upvote** ficam como **stretch goal pós-piloto**: entram se houver
tempo depois de reações + telão + dashboard estarem sólidos; não são compromisso do v1.

**Por quê:** a conversa de 02/07 (ver `contexto/reunioes/sintese-2026-07-02.md`) puxou
login e perguntas para o v1, mas empilhar identidade (Even3 + LGPD + consentimento) e
moderação de perguntas *antes* do piloto arriscaria o piloto inteiro — e o segundo fator
do login nem está confirmado no cadastro Even3 (ver `contexto/even3/README.md`). Sequência
escolhida: provar o núcleo (reação → telão → dashboard) com o mínimo, e adicionar
identidade com calma. Refina (não reverte) a decisão de 25/06: o v1 *no evento* deverá ter
login para interagir, mas o anônimo continua sendo o piso de todo o sistema.

---

## 2026-07-06 — Convenção: `_inbox/` é a porta de entrada, e deve viver vazia

**Decisão:** arquivos brutos (transcrições, fotos, PDFs) chegam em `_inbox/` e são
**processados** para o lugar certo: reuniões → `contexto/reunioes/` (com síntese em
`.md`), material de inscrição/Even3 → `contexto/even3/`, e as decisões extraídas → este
arquivo. Processar = mover + sintetizar + registrar decisões. O inbox vazio é o estado bom.

**Por quê:** a dor apareceu na própria reunião de 02/07 ("parece que eles precisam de uma
inbox... é muito difícil"). Sem porta de entrada, os brutos param na raiz e o cérebro vira
depósito.

---

## 2026-06-26 — App: linha do tempo viva, timestamp visual e demo com a programação oficial

**Decisão:** o app passou a ser, visualmente, uma **linha do tempo** (espinha + nós), não uma
lista. Criamos um **timestamp visual** (a hora como nó na linha) — assinatura temporal usada em
tudo que tem hora, materializando o princípio "timestamp em tudo". A **demo** usa a **programação
oficial** (17–20/08) com um **relógio de demonstração** (o "agora" é simulado dentro do evento,
correndo em tempo real), via flag opt-in `NEXT_PUBLIC_DEMO` (`npm run dev:demo`).

Outras decisões da rodada:
- **"AO VIVO"** no **vermelho do Concefor** (`#D6004B`); a estrutura da timeline (hora, nó, barra)
  fica no cyan. Sessões passadas ficam mais discretas; a bolinha "agora" pulsa (escala).
- **Palestrantes** viram **entidade estruturada** (tabela `speakers` no schema; tipo `Speaker`
  com `bio`/`foto` a preencher) — sem inventar dados de pessoas reais.
- O **Telão sai da navegação** do app (responde em outra URL própria); entra a aba
  **Informações** (local, hospedagem, alimentação).

**Por quê:** reforçar o conceito-espinha (passagem do tempo / 20 anos) e deixar a demo "viva" para
apresentar. Ideias de evolução (reações na bolinha, onda, zoom-out, fenda temporal) ficam para a
**semana 3** — ver `design-system/app/roadmap.md`.

---

## 2026-06-26 — Identidade visual: design system + app vestido (Concefor base, selo acento)

**Decisão:** criados dois design systems de marca em `design-system/` — **Concefor** (base, do banner
oficial) e **selo 20 anos** (acento, do Manual de Identidade Visual oficial) — e um terceiro,
**design system do app**, que traduz as duas marcas em **tokens semânticos** (`app/src/app/tokens.css`).
O app foi remarcado: tema escuro navy (oceano Concefor), gold para "o que importa agora", Oswald+Inter,
selo branco na topbar e selo colorido como ícone do PWA. Hierarquia travada: **Concefor governa, selo é
acento comemorativo pontual** (só a borda da topbar usa o gradiente do selo).

**Por quê:** o app tinha um placeholder roxo/índigo sem relação com a identidade real do evento. Separar
*marca* (referência) de *tokens do app* (aplicação) deixa a remarcação futura num arquivo só
(`tokens.css`), sem cor solta espalhada. Cores do selo são exatas do manual; as do Concefor foram
amostradas do banner (tipografia dos títulos é inferência — Oswald — a confirmar com o arquivo-fonte).
Ver `design-system/README.md` e `design-system/app/README.md`.

---

## 2026-06-25 — Identidade dos participantes: fica fase 2, v1 segue anônimo

**Decisão:** o v1 permanece **100% anônimo** (`client_id` no dispositivo, sem PII). A integração com
a plataforma de inscrição (**Even3**) para identificar quem é quem — puxar inscritos por API e
**login/check-in via QR do crachá + e-mail** — é **fase 2**.

**Por quê:** identidade destrava coisas boas (timeline pessoal identificada, "quem está no evento",
networking), mas traz dependência de API externa e cuidado de LGPD/consentimento — risco que não
combina com "causar com simplicidade" na janela curta. O v1 entrega valor sem saber nomes: a
identidade anônima consistente (avatar/cor por `client_id`, estilo Google Docs) já dá personalidade
às reações. Surgiu na conversa de 25/06 (Marquito + Elton). Ver `spec/app-v1.md` §8.

---

## 2026-06-25 — "Minha programação" (favoritos) entra no v1

**Decisão:** favoritar sessões + **banner "não perca"** (avisa quando uma favorita está chegando)
entram no v1, dentro da feature de programação viva. Funciona **anônimo, no dispositivo**
(localStorage por `client_id`) — sem login, sem mudança de esquema.

**Por quê:** é a "linha do tempo pessoal que o participante leva pra casa" — o coração do conceito
dos 20 anos — e custa pouco (cai da timeline que já estamos construindo, sem backend novo). Marquito
tratou disso quase como parte natural da programação na conversa de 25/06. Ver `spec/app-v1.md` §4.1.

---

## 2026-06-25 — Escopo do app v1: 3 coisas, nada mais

**Decisão:** o v1 do app entrega exatamente três coisas:
1. **Programação viva + "agora/depois"** (navegação por linha do tempo)
2. **Reações ao vivo no telão** (joinha/coração durante palestras)
3. **Dashboard / relatório final** (requisito fixo)

Todo o resto do brainstorm (perguntas com upvote, anotação colaborativa→PDF, networking por QR,
gamificação, AR/Easter eggs, instagramável, animações em tempo real, tangíveis) vai para **fase 2**.

**Por quê:** o objetivo é "causar com simplicidade" em ~7,5 semanas. As três features caem do
mesmo modelo de dados (tudo com timestamp), então o custo marginal de tê-las juntas é baixo e o
risco de não entregar é o que mais importa controlar. Ver `contexto/brainstorm/sintese-ideias.md`.

---

## 2026-06-25 — Monorepo: o app mora dentro do cérebro

**Decisão:** o código do app fica em `app/` dentro de `concefor-innovation` (não em repo separado).

**Por quê:** resolve a dor central do projeto — "tem que ter algum lugar que é o cérebro". Um
repo só: contexto + spec + decisões + código, histórico único, fácil de achar. Para não complicar
o deploy, o `app/` é **auto-contido e deploy-agnóstico** (Next.js `output: standalone` +
Dockerfile): roda no Vercel (Root Directory = `app/`) **ou** em servidor próprio do Cefor.

---

## 2026-06-25 — Stack: PWA Next.js + Supabase

**Decisão:** PWA (Next.js + `next-pwa`), Supabase (Postgres + Realtime), deploy Vercel ou
self-host. Sem app store — instalável via "adicionar à tela inicial".

**Por quê:** alinhado ao caminho já catalogado `web-app-vercel-supabase`. Supabase Realtime
resolve nativamente as reações ao vivo. PWA evita fricção de loja e funciona em qualquer celular.

---

## 2026-06-25 — Premissa: IA local no Cefor

**Decisão:** assumir que haverá uma **IA local rodando no Cefor** durante o evento, disponível
como recurso (endpoint interno).

**Por quê:** não é necessária no v1, mas destrava features de fase 2 (transcrição em tempo real,
resumo automático de palestras, filtro de perguntas por palavrão/má-intenção) **sem custo por
token** de API externa. Alinha com a regra de hard-cap/anti-loop em bots — preferir IA local onde
der, e qualquer uso de IA externa entra com teto.

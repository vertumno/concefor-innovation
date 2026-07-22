# Decisões

Log datado das decisões do projeto, com o porquê. Mais recente no topo.

---

## 2026-07-22 — App vai distribuir materiais dos palestrantes

**Decisão:** o app do evento passa a oferecer **os materiais que cada palestrante quiser
compartilhar** (livro, artigo, slides), na sessão e/ou no perfil dele. Guardamos **link, não
arquivo**: aponta para a fonte oficial, sem hospedar nada.

**Primeiro material confirmado:** livro gratuito do Mariano Pimentel, *"IA generativa e educação:
práticas e teorizações"* (SBC, +10 mil downloads),
https://books-sol.sbc.org.br/index.php/sbc/catalog/book/182 — casa direto com a palestra dele.

**Por quê:** dá utilidade real ao app além da programação, e o conteúdo já existe, é só apontar.
Custa quase nada de código (uma lista de `{titulo, url}` por palestrante), e não hospedar evita
discussão de direitos autorais e peso no servidor.

**O caminho crítico é conteúdo, não código.** Depende de cada palestrante enviar o material, então
o pedido **entrou na mensagem de solicitação de vídeo** que já ia ser enviada, com prazo 03/08.
Um contato só, dois pedidos. A tabela de controle dessa mensagem ganhou coluna para o material.

**Ficou em aberto:** onde exatamente isso aparece na navegação do app, e se entra antes ou depois
do lançamento do piloto.

---

## 2026-07-21 — Brindes: logo sem numeral confirmado e cronograma da gráfica antecipado

**Decisão / fatos:**

1. **Logo do Concefor sem o "VIII" está resolvido.** As artes foram produzidas sem o numeral,
   como o TR 72/2026 exige para reaproveitamento institucional. Isso **encerra a pendência 🔴**
   que travava todas as artes de brinde e que estava aberta no board e no README da fase.
2. **O cronograma da gráfica é mais curto que o documentado.** O que valia era "entrega até
   07/08"; o real é: **envio das artes em 22/07**, prova digital na sequência, e **avaliação das
   amostras pela comissão em 28/07 (terça), às 11h**. O 07/08 é só o limite contratado.
3. **Acompanhamento das amostras em 28/07:** **Marquito e/ou Andreia**.
4. **Duas peças em aprovação com a Márcia** desde 21/07: **camisa** em duas opções (aguardando
   ela escolher 1 ou 2) e **bloco** em opção única (aguardando se há ajustes).

**Por quê:** o prazo real muda a leitura de urgência do board. Com envio em 22/07, a escolha da
camisa deixa de ser confortável e vira bloqueio imediato: sem a opção definida, não há o que
mandar para a gráfica.

## 2026-07-20 — Mosaico de conexões (networking antecipado), tom no singular e R9 de código pronto

**Decisão** (terceira rodada do dia, após Marquito testar o login):

1. **Networking antecipado como "mosaico de conexões"** na tela Pessoas: os 290 inscritos
   viram **quadradinhos de canto arredondado** (a malha do selo 20 anos) com as iniciais,
   apagados; conectar — escaneando o QR do crachá do outro ou digitando o nº do ingresso —
   acende o quadradinho. **Contato completo (nome + e-mail) só depois de conectar**; antes,
   só o primeiro nome. Conexões mais recentes no topo. Exige login. "Meu QR" no perfil
   (`/entrar`) substitui o QR físico onde o crachá não tiver. Scanner via BarcodeDetector
   com fallback manual (câmera plena depende do HTTPS do R5). Sem autorização do outro
   lado no v1 (só o escaneamento) — reevaluar se surgir incômodo.
2. **Toda comunicação com o usuário no singular** (a pessoa lê sozinha no celular) e
   neutra de gênero quando possível — regra registrada em `app/README.md`.
3. **Texto do login ficou honesto:** quem não entra mantém programação/favoritos/infos,
   mas perde as interações que dependem de identidade (ex.: conexões). Texto final do
   termo ainda passa por validação da organização.
4. **R9 de código entregue:** admin de horários (curativo local; Even3 continua mandando
   nos horários no re-sync) e relatório imprimível em `/admin/relatorio`.

**Por quê:** o mosaico transforma o networking em jogo visual alinhado à identidade (cada
conexão acende um ponto da malha dos 20 anos) e dá sentido concreto ao login; o tom no
singular é como o participante de fato lê o app.

---

## 2026-07-20 — Início vira a "casa" (avisos da organização) e login entra como OPCIONAL

**Decisão:** entregues no mesmo dia os dois ajustes pedidos após o feedback: (1) o
**Início** se diferenciou de Agenda/Ao Vivo — avisos da organização (publicados pelo
`/admin`, mão única, tipo `aviso` na linha do tempo), "não perca", sessão no ar com CTA
pro Ao Vivo e só 3 próximas + link pra Agenda; (2) o **login do R7** (nº do ingresso + 4
primeiros dígitos do CPF + consentimento LGPD) entrou **antes do previsto, como
opcional**: quem entra ganha avatar/inicial no topo e saudação pelo nome, e suas
interações ficam associadas no banco; reagir/perguntar **continuam abertos e anônimos**
— a exigência de login para interagir só liga depois da validação de 30/07, se validada
(mantém a decisão de 06/07: anônimo é o piso). Os 288 inscritos são sincronizados do
Even3 para o servidor (PII nunca vai ao cliente; rotas públicas devolvem só o primeiro
nome). Texto do termo de consentimento é rascunho — **validar com a organização** antes
do lançamento.

**Por quê:** antecipar o login como opcional tira o risco técnico do caminho (30/07 já
mostra o fluxo completo) sem quebrar o piloto anônimo; e o Início com avisos resolve a
repetição apontada no feedback dando à organização um canal direto com o participante.

---

## 2026-07-20 — Programação do app vem do Even3 (sync entregue); enriquecimento local sobrevive ao re-sync

**Decisão:** o R2 foi entregue com a chave real: `npm run sync:even3` puxa a programação
oficial do Even3 (15 sessões, 4 dias, idempotente, dedup das duplicatas da API). Como o
cadastro de lá está **sem salas/tags/palestrantes**, o modelo é: **Even3 é a fonte da
verdade da espinha** (dias, horários, títulos — mudou lá, muda no app); o que ele não
preenche é coberto por **enriquecimento local** que sobrevive ao re-sync (`coalesce` no
upsert + `db/enrich.sql`: salas do Auditório e palestrantes estruturados citados nos
títulos/descrições do próprio Even3). Sessões locais sem prefixo `even3-` sobrevivem ao
sync — é o **modo teste** (`npm run seed:live` continua funcionando por cima da
programação real, mesmo depois do link com o Even3). O seed manual foi **aposentado**.

**Por quê:** o Even3 é a fonte *operacional* do app (é de lá que o sync lê), mas o cadastro
pobre de lá não pode empobrecer o app — as duas fontes se compõem em vez de competir.
**Achado e desdobramento (20/07):** a programação do Even3 diverge do site oficial — e o
Marquito confirmou que **a fonte da verdade editorial no momento é o site** (o Even3 está
desatualizado: falta a mesa "Tecnologia Delas" de 18/08, credenciamento, coffees, momentos
culturais e almoço). Encaminhada mensagem à Márcia pedindo para atualizarem o Even3 para
espelhar o site e mantê-lo em dia — enquanto não corrigirem lá, o app exibe a versão
desatualizada do Even3.

---

## 2026-07-20 — Crachá impresso pela gráfica (QR não garantido) e segundo fator do login: 4 primeiros dígitos do CPF

**Decisão** (Marquito + Elton, reunião de 20/07 — síntese em
`contexto/reunioes/sintese-2026-07-20.md`):

1. **Crachá físico:** o modelo nativo do Even3 (A4 dobrado, layout fixo) e o crachá de
   plástico caíram (o segundo não está no termo de referência). Caminho: **crachás
   impressos pela gráfica/copiadora**. Se a gráfica aceitar lote personalizado, mandamos
   planilha com nome + QR + categoria — dados que o sync Even3 já nos dá; senão, crachás
   todos iguais com nome à mão. Última hora: à mão, sem QR (verificar impressora de
   etiquetas no campus).
2. **Consequência pro app:** o QR impresso no crachá **não é garantido** → o login pelo
   crachá não pode depender do scanner. Caminho primário: **digitar o nº do ingresso**
   (`checkin_code`); QR scanner vira melhoria progressiva; o **"meu QR" no app** pode
   substituir o QR físico onde ele faltar.
3. **Segundo fator do login: 4 primeiros dígitos do CPF** (fecha a pendência aberta em
   16/07 — data de nascimento não existe no cadastro). Ideia registrada: permitir
   redefinir para senha própria após o primeiro login.

**Por quê:** o crachá de plástico não foi contemplado na contratação e o modelo Even3 não
carrega a identidade dos 20 anos; imprimir na gráfica dá controle visual e cabe no que já
está orçado. O CPF parcial é o único segundo fator que existe para todos os inscritos e
não expõe o dado inteiro. O app absorve a incerteza do QR físico ficando independente dele.

---

## 2026-07-20 — Barra inferior validada com o Elton; ajustes: dias nos contadores e Início diferenciado

**Decisão:** a navegação nova (R1, entregue 20/07) foi vista rodando e aprovada. Ajustes
acordados: contadores longos passam a mostrar **dias + horas** ("em 28 d 2 h", não
"em 674 h"); o **Início** precisa se diferenciar de Agenda/Ao Vivo (hoje os três repetem
agora/a seguir) — vai concentrar avisos, dica do dia e atalhos; o topo direito ganhará o
**perfil** ("faça login" genérico → avatar quando logado, futura casa da pontuação).
Ideias novas registradas sem compromisso: "bolinhas de conexões" na tela Pessoas, plano
de gamificação (Elton), badge "atualizado" no material do palestrante. Preocupação
registrada: concorrência do SQLite sob 100–200 reações simultâneas → teste de carga antes
do evento (mitigação: WAL + interface `lib/db` de troca barata).

**Por quê:** feedback direto da primeira demo interna da interface nova; os ajustes são
pequenos e o que é ideia nova fica catalogado (fase 2/candidatas) para não inflar o
caminho crítico até 30/07.

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

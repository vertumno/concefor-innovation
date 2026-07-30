# Decisões

Log datado das decisões do projeto, com o porquê. Mais recente no topo.

---


## 2026-07-29 — Grade final das camisas enviada à gráfica (agora com PP, XG e XXG)

**A grade que vale é esta**, enviada à Brindes Expresso:

| PP | P | M | G | GG | XG | XXG | **Total** |
|---|---|---|---|---|---|---|---|
| 2 | 20 | 30 | 28 | 16 | 2 | 2 | **100** |

**Substitui a grade do e-mail de 28/07** (25 P · 30 M · 30 G · 15 GG). A diferença que importa:
a numeração **abriu nas pontas** — entraram **PP, XG e XXG**, que antes não existiam, e o miolo
foi redistribuído (P caiu de 25 para 20, G subiu de 30 para 28, GG de 15 para 16). Continua
fechando as **100 unidades** contratadas no TR 72/2026.

**Por quê:** camisa de evento sem PP e sem XG/XXG deixa gente de fora — e sobra tamanho que
ninguém usa. As 6 unidades das pontas saíram do miolo, sem alterar o total contratado.

---

## 2026-07-29 — Banners de programação sem local; NTE vira "Encontro dos NTEs dos Ifes"

**Decisão:** os **banners de programação por dia (#02 a #05) não levam mais o local das
atividades** — só **horário e atividade**. O **#06 (eventos paralelos) mantém o local**, porque
ali ele é a informação principal: são seis eventos simultâneos em espaços diferentes.

**Por que importa mais do que parece:** era a coluna de local que segurava três banners. As
perguntas em aberto com a Coordenação — onde ficam as **sessões técnicas**, onde fica a **Mostra
de Produtos**, e a confirmação de **UAB/UnAC no Pátio e NTE no Auditório** — deixaram de ser
requisito das peças. Com isso, **11 dos 13 banners passam a poder ser produzidos**, em 8 artes;
sobram apenas o **#05** (confirmar se é mesmo do dia 20/08) e o **#13** (falta o endereço da
vitrine de MOOCs).

As definições de local continuam registradas em `comunicacao/contexto/01-programacao.md` — elas
seguem valendo para o app, o site e a sinalização, só não são mais insumo destes banners.

**Correção de nome:** no dia 17/08, o que estava como "Evento NTE" passa a ser
**"Encontro dos NTEs dos Ifes"**.

---

## 2026-07-29 — Eventos paralelos fechados: 6 eventos, todos com local

**Fato novo:** o documento vivo da Coordenação
([Eventos Satélites do VIII Concefor](https://docs.google.com/document/d/1XpyWM2oB7L_ORyRBg62Jozkvgw3dFUAQvkDyyrmr4gw/edit))
foi atualizado e **fechou todos os locais** do dia 20/08:

| Evento | Local |
|---|---|
| IA além do chat (Cefor) | Laboratório de Informática |
| "Ciência delas" · Rio Doce Escolar | **Auditório** *(era "Auditório ou Pátio")* |
| Escola de Inovação (CCEC-EI/SEME/PMV) | **Sala 2** *(era a definir)* |
| Entre Dois Mundos (Ifes) | **Sala 4** *(era a definir)* |
| Workshop Pros@tec (Cefor) | **Sala 1** *(era a definir)* |
| **EDUCIMAT: 15 anos elaborando produtos, tecendo saberes e modificando vidas** | **Pátio** |

**O evento do Educimat deixou de ser incógnita.** O que estava registrado como "Aula Inaugural do
Educimat", sem coordenação e sem programação, agora tem **nome oficial** e coordenação —
**Edmar Reis Thiengo e Ana Raquel Santos de Medeiros Garcia** (coordenacao.educimat@ifes.edu.br ·
27 99968-2027), 13h30–16h, no Pátio. Só a programação interna dele segue sem divulgação, o que
**não impede o banner** — ele leva nome, horário e local.

**Consequência direta: o banner #06 (eventos paralelos) foi destravado.** Ele era "o último a
imprimir" justamente porque esperava o Educimat; agora pode ir à gráfica junto com os outros.
Com isso, **8 dos 13 banners podem ser produzidos já** — em 5 artes: #01, #06, a dos andares
(que serve para #07–#10), #11 e #12.

**O documento do Google Docs virou referência oficial na página da Andreia**, no bloco do #06 e
na lista de links — é lá que qualquer mudança aparece primeiro.

---


## 2026-07-30 — Validação aprovada; lançamento vai para 10/08; novas reações (Elton); teste com a comissão em 05/08

**Decisões do teste de validação** (9h–10h45, Marquito + Elton + Juliana + CGTI na sala +
Márcia no final — síntese em `contexto/reunioes/sintese-2026-07-30.md`):

1. **O app está validado.** Telão, reações, perguntas com upvote, admin (inclusive edição
   de horário ao vivo), PWA instalável (ícone do selo aprovado), login e conexões — tudo
   funcionou com gente real no domínio oficial. Bugs restantes são de acabamento (câmera
   de QR no iPhone/alguns Androids, botões vazando em telas maiores, avisos sem
   auto-atualizar, janela de perguntas órfã em sessão encerrada).
2. **Lançamento remarcado: 10/08 (segunda)**, e-mail pela plataforma (Márcia) + vídeo
   tutorial curto (CGTE). Antes disso, **teste com a comissão toda em 05/08 (qua) 15h**.
3. **Reações deixam de ser genéricas** e viram instrumento de medição (cruzam com a
   transcrição das palestras no relatório): **Que massa · Me identifico · Vou usar ·
   Amei · Explodiu a mente**. **Elton implementa** em branch próprio, com merge direto
   autorizado.
4. **⚠️ Compromisso assumido em voz alta que ainda não existe em código:** na reunião foi
   dito que o login aceita "CPF ou e-mail" — o fallback de e-mail (decisão de 29/07)
   **ainda não foi implementado**. Vira prioridade nº 1, junto com o texto da tela.
5. **Divulgação no evento**: etiqueta do crachá com QR do app + nº do ingresso (Elton),
   fala de 1 min na abertura, lembrete de 15 s do cerimonial em toda sessão, QR no telão
   ocioso (`/projecao`).
6. **Materiais dos palestrantes**: Márcia intermedia e colhe autorização; Even3 permite
   anexar materiais à atividade — verificar com o Alex se a API expõe (aí entra no sync).
   Reunião com o Alex na semana de 03/08 (também: semântica do "confirmado", envio de
   e-mail, coffee breaks na programação).
7. **Nova frente registrada (pós-evento):** oferecer o app como **serviço de eventos do
   Cefor/Ifes** (fala do Saymon: "temos a infra"; design system parametrizável) e/ou
   liberar o código. Sem compromisso agora.

---

## 2026-07-30 — DNS oficial no ar com HTTPS (app.cefor.ifes.edu.br) + sync automático do Even3 embutido no serviço

**Fatos do dia da validação (30/07, durante os testes):**

1. **https://app.cefor.ifes.edu.br está no ar** (DRTI/CGTI) — proxy com TLS válido em IP
   público (200.137.82.61), na frente do servidor da CGTI. **SSE atravessa o proxy**
   (testado ao vivo: `event: init` imediato) — telão em tempo real funciona no domínio.
   Destrava o que dependia de secure context: **PWA instalável e câmera do QR scanner**.
   O nome ficou mais curto que o aventado (`app.cefor…`, sem o "concefor"). Esse é o
   endereço do lançamento de 07/08; `/projecao` gera o QR pro domínio automaticamente.
   Verificar de fora da rede do IFES (4G) se o acesso público está liberado.

2. **Sync automático embutido** (pedido do Marquito ao vivo, quando a inscrição da
   Andreia não apareceu no app): `src/instrumentation.ts` (hook padrão do Next) roda o
   `runSync()` no boot e a cada `SYNC_INTERVAL_MIN` minutos. **Desligado por padrão**
   (decisão do Marquito na sequência: o botão de re-sync do `/admin` cobre a necessidade
   por ora; liga-se definindo a env). Guardas: execuções nunca se sobrepõem; falha de
   rede só loga, não derruba o app. Nota técnica: a checagem de `NEXT_RUNTIME` precisa
   ser um `if` englobando `import()` de arquivo separado (padrão da doc do Next) — como
   early-return, o webpack tentava resolver o better-sqlite3 no compile edge e o dev
   quebrava com "Can't resolve 'fs'". **Esclarecido de novo:** re-sync nunca exigiu
   rebuild — é ação de runtime.

---

## 2026-07-29 — Conexões ganham contato preenchido pelo participante (telefone/Instagram) + foto e categoria do Even3

**Decisão (Marquito, testando o networking em 29/07):** o cartão de conexão mostrava só
nome + e-mail — e o Even3 não tem mais nada aproveitável (payload completo verificado:
sem instituição, bio, telefone ou redes; só `photo`, com 24% de cobertura entre
confirmados, e `registration_category`, 100%). Em vez de esperar dado que não existe:

1. **O próprio participante preenche o contato** que quer compartilhar — telefone/WhatsApp
   e Instagram — na tela do avatar (`/entrar`, logado), com aviso de que aparece **só para
   as conexões dele**; campo vazio = não mostrar. Tabela nova `attendee_profile`,
   separada de `attendees` para o re-sync do Even3 nunca sobrescrever.
2. **Cartão de conexão enriquecido:** foto da inscrição (quando houver), etiqueta curta da
   categoria (as 5 frases oficiais viram "Equipe Cefor/NTEs", "Estudante", …), e-mail,
   WhatsApp (link `wa.me`) e Instagram.
3. **Foto no quadradinho aceso** do mosaico (conexões); iniciais seguem como fallback e
   para os não conectados — foto de quem a pessoa **não** conectou não aparece, mantendo a
   mecânica "acender = conectar" e o piso de privacidade (PII só após conexão).

**Por quê:** networking é troca de contato (decisão do benchmark EDEN — sem chat); e-mail
sozinho é fraco pra isso no Brasil — WhatsApp/Instagram é como as pessoas de fato se
falam. Fornecimento voluntário e com propósito explícito na UI (LGPD). Fluxo de deploy
combinado em 29/07: **a equipe implementa sem sincronizar com a CGTI**; o Sérgio traz pro
servidor quando possível (espelho GitLab sempre atualizado é a única obrigação nossa).

---

## 2026-07-29 — App no ar no servidor da CGTI; espelho GitLab estava sem R1–R9 (corrigido); preparação da validação de 30/07

**Fato novo (WhatsApp com o Sérgio/CGTI, manhã de 29/07):** o app está no ar em
**http://172.17.159.15:3000** (servidor da CGTI). Deploy é **manual** — o Sérgio puxa o
espelho do GitLab no servidor e rebuilda; ele vai estudar integração automática (com o
Eduardo) e vai abrir chamado na DRTI para o DNS (`app.concefor.cefor.ifes.edu.br` foi a
forma aventada). **A validação com a comissão é 30/07, das 9h às 10h** (antes constava 10h).

**Diagnóstico:** a versão no ar estava **sem tudo de 20/07** (rotas `/agenda`, `/ao-vivo`,
`/pessoas` → 404) e com o banco semeado pela **programação manual aposentada** (23 sessões).
Causa raiz dupla: (1) o **espelho GitLab de 23/07 foi gerado de uma linha do histórico que
ainda não continha R1–R9** — esses commits só entraram no `main` pelo merge `0a08bb0`,
feito *depois* do push do espelho; (2) o README de deploy ainda mandava rodar o
`seed.mjs` aposentado, e o Sérgio seguiu o README (corretamente).

**Decisões/ações de 29/07:**

1. **Espelho GitLab atualizado** pela rotina documentada em 23/07 (re-split + merge no
   `gitlab-app` + push), agora contendo R1–R9 e a preparação da validação. Lição: **após
   qualquer merge no `main` que toque `app/`, rodar a rotina do espelho** — o push de 23/07
   foi feito antes do merge e ninguém percebeu.
2. **README do app reescrito no que importa ao deploy**: a fonte da programação é o
   `sync:even3` (o `npm run seed` está aposentado e o README agora avisa); passo de
   migração para base criada com o seed antigo (apagar `concefor.db` do volume e re-sincronizar).
3. **`npm run seed:validacao`** (novo `scripts/seed-validacao.mjs`): grade de **7 sessões
   fictícias em 30/07, 9h–17h30** — a validação às 9h e blocos de teste o dia todo (pedido
   do Marquito: o teste pode se estender). Ids `demo-validacao-*` sobrevivem ao re-sync,
   horários ajustáveis pelo `/admin`, `--limpar` remove tudo, `--data=` replica noutro dia.
4. **Página `/projecao`**: QR de acesso + endereço, tela cheia para o telão. O QR aponta
   pro endereço em que a página foi aberta — vale pro IP hoje e pro DNS depois, sem configurar.
5. **Roteiro da validação e checklists** (Marquito e Sérgio) em `spec/validacao-2026-07-30.md`,
   incluindo a mensagem pronta pro Sérgio e os riscos: IP interno (só rede IFES), sem HTTPS
   (sem PWA instalável nem câmera de QR), participantes remotos só por tela compartilhada.

---

## 2026-07-28 — Brindes: camisa, bloco e crachá aprovados; caneta branca; três ajustes na gráfica

**Decisão (e-mail enviado à Brindes Expresso em 28/07, registrado em
`comunicacao/producao/01-brindes-promocionais/_especificacoes/email-grafica-envio-artes.md`):**
respondemos ao documento de montagens que a gráfica mandou **por WhatsApp**.

1. **Aprovadas: camisa, bloco e crachá.** Encerram a fila de aprovação do nosso lado — inclusive
   a pendência que estava com a Márcia desde 21/07. Na camisa **ficou a opção 2: logo do Concefor
   e selo dos 20 anos do Cefor na frente**; costas só com Realização e Apoio.
2. **Grade das camisas fechada: 25 P · 30 M · 30 G · 15 GG** — soma exatamente as 100 unidades
   contratadas no TR 72/2026.
3. **Caneta será branca, com a logo simplificada:** só "Concefor", **sem** "Congresso Regional de
   Formação e Educação a Distância". O TR especifica caneta **azul**, e **a comissão deu o aval
   para a troca** — a divergência com o contrato está chancelada.
4. **Copo:** o selo dos 20 anos vai no **lado oposto** à logo do Concefor (a montagem trazia as
   duas lado a lado) e **um pouco maior**.
5. **Bolsa:** alinhamento e tamanho das logos ajustados por nós; seguiu **arquivo de referência em
   anexo** para a gráfica remontar.
6. **Pedido de que a gráfica responda também por e-mail**, não só por WhatsApp.

**Por quê (item 6, que é o que vale para além destas peças):** as artes começaram a chegar por
WhatsApp, num canal pessoal. Aprovação de material contratado que só existe em conversa de celular
não é rastreável, não passa pela coordenação e some quando alguém entra de férias — exatamente o
caso desta semana, em que **quem conduz o contato está fora de 27 a 31/07** e o acompanhamento é
do **Marquito** (por isso a cópia obrigatória para cgte.cefor@ifes.edu.br, combinada em 22/07).

**Impacto no prazo:** as três montagens (caneta, copo, bolsa) voltam para refação e precisam ser
reaprovadas com folga sobre **07/08**, a entrega contratada. Camisa, bloco e crachá já podem rodar.

**Também em 28/07 — a cadência diária de cards está de pé.** Publicados **Mariano Pimentel** em
27/07 (https://www.instagram.com/p/DbT3A9apgf0/) e **Rutinelli Fávero** em 28/07
(https://www.instagram.com/p/DbT4FRUJKh1/). São 4 dos 7 cards individuais no ar; restam Márcia
Oliveira (29/07), Mariella Berger (30/07) e Jaqueline Sanz (31/07) — e aí a série se esgota, com
as **duas artes de mesa** (01 e 02/08) ainda por produzir. Segue sendo o gargalo da divulgação.

**👷 Produção dos banners passada para a Andreia (28–29/07).** São **13 banners**: os **10 do TR**
mais os **3 institucionais** da Vanessa (livro dos 20 anos, Base de Conhecimentos e MOOCs,
custeados pela UAB). O briefing é uma **página no GitHub Pages** —
https://vertumno.github.io/concefor-innovation/comunicacao/briefing-banners/ , fonte em
`comunicacao/briefing-banners/index.html` — reunindo o que estava espalhado em cinco arquivos:
os 13 banners **numerados um a um na ordem de produção**, o conteúdo linha a linha dos banners de
dia, as regras de marca (com o alerta do "VIII"), especificação técnica, referências visuais,
paleta, fluxo de entrega e as pendências com **quem responde o quê**.

**Duas decisões que vieram junto (29/07):**
- 🔢 **Nova numeração, na ordem do calendário:** 01 Geral · 02–05 dias (17, 18, 19 e um quarto a
  confirmar) · 06 eventos paralelos · 07–10 andares · 11–13 institucionais. Substitui o rateio
  original, que listava os paralelos em segundo lugar. Vale no brief, no board e na página.
- 🎨 **Os 3 institucionais saem em ARTE ÚNICA** — um template, três conteúdos. Responde à pergunta
  que a Vanessa deixou em aberto em 14/07. **Por quê:** produz mais rápido no prazo de 01/08, fica
  coerente com os três lado a lado na parede, e permite um quarto produto depois sem redesenhar.

**A Andreia trabalha pelo Google Drive, não por este repositório** — a página foi reescrita sem
nenhum caminho interno. Pasta de trabalho: **Artes Concefor 2026**
(`drive.google.com/drive/folders/1Qtm4qtGLQsV4svTGmPeBNx1SwfTCkdak`). Pasta principal de
referência, com os banners de 2024: `.../folders/1ZzI49nOTudvH9JwZ4AHHO8xQjuJWw4xQ`. Ambas em
`links.md`.

**Prazos das artes (29/07):** **31/07** para os 10 banners do evento · **01/08** para o livro
(#11) e a Base de Conhecimentos (#12) · **03/08** para a vitrine de MOOCs (#13). A entrega
contratada da gráfica continua sendo 07/08 — o 31/07 é o prazo interno da arte.

**Assinaturas desta edição:** **Realização: Cefor** · **Apoio: Ifes Campus Vila Velha e Educimat**.
São as únicas logos — o rodapé de 2024 trazia mais marcas e **não deve ser repetido**.

**O #11 (livro) entrou no primeiro lote de produção**, porque **a capa do livro já está pronta**:
são 6 peças que não dependem de mais nada (#01, #07–#10 e #11), quase metade do trabalho.

**Link confirmado:** a **Base de Conhecimentos** está no ar em https://conhecimento.cefor.ifes.edu.br/
— *"Aprenda. Consulte. Ensine melhor."*, 130 artigos em trilhas sobre Moodle, acessibilidade e IA
na educação. Já serve para o QR code. Faltam o **link definitivo do livro** e o **endereço da nova
vitrine de MOOCs**, que é a única trava dos três institucionais.

**Por que uma página, e não um documento:** quem produz precisa **ver** as referências e a paleta
enquanto trabalha, e precisa de um link que não desatualize numa cópia de WhatsApp. A página é
gerada do mesmo repositório que guarda as decisões — **mudou a definição, muda a página**. Ela é
derivada: se divergir do brief, o brief vale (está escrito lá).

**Mais três fatos de 28/07, à noite:**

- ❌ **Squeezes canceladas: não serão produzidas.** O **copo bucks** ocupou o lugar delas no kit —
  encerra a dúvida que estava aberta desde 20/07 (a squeeze nunca esteve no TR 72/2026).
- ✅ **Amostras dos brindes avaliadas e finalizadas**, conduzidas por **Viviane e Dennis** (a
  previsão era Marquito e/ou Andreia).
- ✅ **Card do Mauro Oliveira desbloqueado.** Chegaram a **foto oficial** e a **trajetória
  completa** dele (matéria de revista + lista de formação), arquivadas em
  `comunicacao/producao/02-pre-evento/palestrantes/_refs/`. O registro canônico — e fonte única
  para card, legenda, app e notícia — é a seção dele em
  `comunicacao/contexto/03-palestrantes.md`. Credencial de card: **Professor do IFCE e do
  doutorado da Fiocruz**; doutorado na Sorbonne e pós-doutorados no King's College London e na
  Ottawa University sustentam a legenda. ⚠️ A foto é **de palco** e precisa de recorte para o
  padrão da série.

**✅ Rateio dos 10 banners definido (28/07, pela Viviane — Coordenação Geral).** Encerra a
pendência aberta em 20/07: **1** Concefor Geral · **1** de eventos paralelos (todos do dia 20/08) ·
**4** de programação por dia (17, 18, 19 e um quarto — a lista repete "18/08", provavelmente é
20/08, `[confirmar]`) · **4** de andar do Cefor — 🔁 **uma arte só, impressa 4 vezes** (Térreo/Pátio · 1º/Salas 1 e 2 · 2º/Salas 3 e 4 ·
4º/Auditório e Laboratório). Detalhamento e referências visuais de 2024 em
`comunicacao/producao/01-brindes-promocionais/banners/brief.md`.

**Fechado na mesma noite:**
- 📍 **Locais da programação: quase tudo é o PÁTIO.** Ficam lá as **palestras e mesas-redondas**,
  **todo o bloco da noite de 17/08** (momento musical, abertura, palestra da Vanessa, lançamentos
  e celebração dos 20 anos, em sequência) e ainda os **momentos culturais**, os **coffee-breaks**
  e a **premiação** — **15 atividades**.
  ➖ **Credenciamento e almoço não levam local no banner**: é decisão editorial da peça, não falta
  de informação (evita poluir a arte com o que não ajuda a orientar ninguém).
  🟡 **Eventos UAB/UnAC provavelmente no Pátio e NTE no Auditório** — a confirmar.
  🔴 **Sobraram 5 blocos, em 2 perguntas:** onde ficam as **sessões técnicas** (18/08 tarde,
  19/08 manhã e tarde) e a **Mostra de Produtos e Produções Técnicas** (18/08, 2 blocos).
  As duas respostas fecham os banners #4 e #5; a confirmação do UAB/NTE fecha o #3.
  Mapa por dia e por banner em `comunicacao/contexto/01-programacao.md`.
- 🚫 **Os 4 banners de andar vão sem a logo do Concefor e sem o selo dos 20 anos.** A orientação
  da coordenação é que **não há problema em ficar sem a logo quando for necessário** — o que
  encerra a divergência com o item 4.1 do TR 72/2026. E o **selo fica de fora de propósito**:
  essas peças são permanentes no prédio, e o selo comemorativo as deixaria datadas.
  **Consequência prática:** esses 4 mais o Concefor Geral — **5 dos 10** — não dependem de mais
  ninguém e podem ser produzidos imediatamente.

**Ainda aberto:** 3 dos 5 eventos paralelos estão "a definir" e o "Ciência delas" oscila entre
Auditório e Pátio, o que segura o banner #2 junto com a programação do Educimat.

📌 **Decisão junto:** o **banner de eventos paralelos fica por último para imprimir**, esperando a
programação da **Aula Inaugural do Educimat** (já sabemos quando e onde: 20/08, 13h30–16h, Pátio).

**O que fica pendente de impressão depois desta rodada** (anotado em 28/07 para não sumir):
1. **Arte dos 10 banners do TR** — é o **último item contratado sem arte**. O rateio saiu; as
   artes, não. Brief em `comunicacao/producao/01-brindes-promocionais/banners/brief.md`.
2. **Etiquetas dos nomes do crachá** — faltam as duas decisões que sustentam tudo: **quais
   etiquetas comprar** e **como será a impressão dos nomes**. A ordem é medir a área livre do
   crachá → achar um gabarito à venda → comprar → gerar o arquivo → testar numa amostra.
3. **3 banners de lançamentos da Vanessa** (livro do Cefor, MOOCs, Base de Conhecimentos) —
   pedidos em 14/07, **arte até 01/08**, ainda não começados. São peça à parte: fora do TR, fora
   dos 10 banners, custeados pela UAB.

**Inbox processado:** os PDFs que a gráfica mandou por WhatsApp foram para
`comunicacao/producao/01-brindes-promocionais/_artes-enviadas-pela-grafica/` (guardados como
chegaram, sem processar), e o **banner de entrada de 2024** virou referência do banner deste ano em
`comunicacao/producao/01-brindes-promocionais/banners/_refs/`.

---

## 2026-07-27 — Nomes dos crachás vão em etiqueta; cadência de um card por dia; legenda de WhatsApp com link de inscrição

**1. Etiquetas adesivas para os nomes dos crachás.** Como os 400 crachás chegam **em branco**
(confirmado com a gráfica em 22/07), a impressão dos nomes é nossa. A decisão de hoje é **não
imprimir o nome direto no crachá**: o nome vai em **etiqueta adesiva colada por cima**. Abre três
tarefas: **comprar as etiquetas**, **encontrar o formato correto** (medida da etiqueta × área
livre do crachá × gabarito de folha que exista à venda) e **gerar os arquivos de impressão** a
partir da lista de inscritos do Even3. Brief em
`comunicacao/producao/01-brindes-promocionais/cracha/etiquetas-nomes.md`.

**Por quê:** mata o maior risco do plano anterior — a dúvida se a impressora do Cefor aguenta 400
passagens de papel fotográfico fosco 240 g. Com etiqueta, o suporte da impressão é uma folha A4
comum, errar um nome custa uma etiqueta em vez de um crachá, e a reimpressão de última hora fica
trivial. **Sequência obrigatória:** medir a área livre → achar o gabarito comercial → comprar →
gerar o arquivo → **testar numa amostra antes de rodar as 400**.

**2. Registro do e-mail que fechou o assunto do crachá com a gráfica** (22/07, 16h07): encaminhado
o PDF do crachá **sem nome**, com marcas de corte e sangria, e pedido de que as respostas venham
sempre com cópia para **cgte.cefor@ifes.edu.br**, porque quem conduz o contato está **de férias de
27 a 31/07** — janela que inclui a avaliação das amostras de **28/07, 11h**. Nessa semana o
acompanhamento é do **Marquito**.

**3. Cadência de publicação: um card por dia, em sequência, e só cards.** Nada de pular data e
nada de story. Publicados: **Vanessa Battestin** em 21/07
(https://www.instagram.com/p/DbF30gOOToU/) e **Felipe Tessarolo** em 24/07
(https://www.instagram.com/p/DbF4cUPh-TT/). A fila passa a ser: Mariano 27/07 · Rutinelli 28/07 ·
Márcia Oliveira 29/07 · Mariella 30/07 · Jaqueline Sanz 31/07 · mesa "Desafios da EaD" 01/08 ·
mesa "Tecnologia Delas" 02/08.

**Consequência imediata:** os 7 cards individuais **se esgotam em 31/07** e as **duas artes de
mesa ainda não existem** — viraram o gargalo da série (as legendas já estão prontas). Ficaram
dois pontos em aberto, registrados sem apagar nada: 01 e 02/08 caem em **sábado e domingo**; e a
**contagem regressiva** de 07–16/08 tem 9 das 10 peças em story, ou seja, a regra nova a derruba
quase inteira — decisão pendente entre converter para card, abrir exceção ou cortar.

**4. Legenda de WhatsApp: mesmo conteúdo do Instagram, com link direto de inscrição.** A página de
aprovação (`comunicacao/aprovacao/cards-palestrantes.html`, publicada no GitHub Pages) ganhou o
botão **"Copiar WhatsApp"** ao lado do de Instagram. As 9 legendas de WhatsApp foram **reescritas
por extenso**: eram um resumo de 3 linhas e passaram a acompanhar o Instagram parágrafo a
parágrafo (gancho + credencial da pessoa + CTA), com quatro adaptações de canal — título em
negrito na primeira linha (`*VIII Concefor · ...*`), sem `@handle`, sem hashtags, e o link
`https://concefor.cefor.ifes.edu.br/inscricoes/` no próprio texto.

**Por quê:** o resumo jogava fora justamente o que convence alguém a se inscrever — o gancho e a
credencial. Não há motivo de canal para cortar: WhatsApp não tem limite prático de caracteres, e
as duas versões ficaram equivalentes em tamanho (±600 caracteres). O que muda de verdade é a
forma: em grupo a mensagem precisa se identificar na primeira linha, arroba não vira link e não
existe "link da bio" — o link tem que levar direto ao lugar onde a pessoa age.

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

## 2026-07-22 — Crachás vêm todos em branco; nomes impressos no Cefor

**Fato novo (ligação com José Fernando Antonio, Brindes Expresso, (27) 99803-1617):** os crachás
são produzidos em **impressão gráfica**, não digital. Não existe personalização com o nome de cada
participante. **Os 400 vêm em branco**, sem nome.

**Decisão decorrente:** a impressão dos nomes passa a ser **nossa, no Cefor**, sobre os crachás já
impressos. Cai o plano de enviar à gráfica um PDF final com os nomes, e cai também a necessidade
de segurar a lista de inscritos até a última data possível: sem lote nomeado na gráfica, não há
data-limite dela para cumprir.

**Por quê:** limitação técnica do processo do fornecedor, não escolha nossa.

**O que isso destrava:** o prazo dos crachás volta a ser o do restante do material (entrega até
07/08). Podemos imprimir nomes até a véspera, inclusive para quem se inscrever depois de 15/08.

**O que isso cria (riscos a resolver antes de 17/08):**
1. **Papel.** Crachá é papel fotográfico fosco 240 g. Falta confirmar se a impressora do Cefor
   roda essa gramatura, e fazer teste com uma amostra antes da entrega dos 400.
2. **Arte.** A área do nome precisa ficar limpa no crachá impresso, e o nome entra por cima, no
   registro certo. Alinhamento e margem viram problema de impressão, não de design.
3. **Modelo do Canva** (https://canva.link/vx6e7xpwox32wyy) muda de função: em vez de gerar o
   crachá inteiro com nome, agora gera **só a camada dos nomes** posicionada para sobreimpressão.
4. **Volume.** 400 passagens de papel fotográfico numa impressora de escritório, mais recorte de
   erro. Definir quem faz e quando.

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

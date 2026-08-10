# Brief — Cards dos eventos paralelos (um por evento, para os coordenadores divulgarem)

> **Pedido recebido em 03/08/2026:** *"Solicitamos cards dos eventos paralelos para seus
> coordenadores divulgarem entre os seus."*
> ([documento da solicitação](https://docs.google.com/document/d/1CbaFQLbt9towXNZprXqrRNkv3NOl0DxD/edit?usp=sharing&ouid=107277811938798859491&rtpof=true&sd=true))
>
> 📌 **Isto é a liberação que estava sendo esperada.** O combinado com a Márcia em 16/07 era que a
> divulgação dos eventos paralelos sairia toda junta, **depois** que o Educimat mandasse as
> informações e a Coordenação liberasse. O Educimat fechou em 29/07 e o pedido chegou agora.
>
> ⚠️ **O pedido muda o formato do que estava planejado.** O calendário previa **um carrossel dos 6
> eventos** no feed do Cefor, em 04/08. O que se pede agora é **seis cards individuais**, um por
> evento, entregues a cada coordenação para ela distribuir na própria rede. São coisas diferentes,
> e as duas fazem sentido: os cards individuais servem à rede de cada coordenador, o carrossel serve
> ao feed do Cefor. **Recomendação: fazer os 6 cards primeiro** (é o que foi pedido e o que destrava
> outras pessoas divulgando por nós) e montar o carrossel a partir deles.

## Identificação
- **Peça:** 6 cards individuais, um por evento paralelo, + texto pronto para cada coordenação enviar
- **Fase:** pré-evento
- **Data dos eventos:** todos na **quinta-feira, 20/08/2026** (Momento I: 9h–12h · Momento II: 13h30–16h)
- **Responsável pela arte:** Elton (07/08 cards individuais · **10/08 carrossel v4/v5** — ver abaixo)
- **Status:** 🟡 **Carrossel em refinamento (v4 → v5).** ✅ Coordenações completas e ✅ textos
  revisados em 10/08. 🔴 **Falta regerar os PNGs com os textos novos** e depois **enviar** os kits
  às 6 coordenações. Os eventos são **20/08**

## Como a arte foi produzida (07/08/2026)

Template único, gerado por código para garantir que os 6 saiam idênticos em estrutura — mesma
técnica já usada no card do Defeso Eleitoral do Cefor (`comunicacao-periodo-eleitoral/`):
HTML/CSS → Chrome headless (2x) → downscale Lanczos → PNG 1080×1350. Identidade visual seguindo
[`contexto/05-identidade-visual.md`](../../../contexto/05-identidade-visual.md) — a mesma família
dos 8 cards de palestrante já publicados (logo VIII Concefor, selo 20 anos, gradiente
turquesa→azul, tipografia Teko + Montserrat), não a de nenhuma ferramenta genérica de carrossel.

- **Fonte:** [`_build/build_cards.py`](_build/build_cards.py) (conteúdo + layout) e
  [`_build/render_cards.py`](_build/render_cards.py) (renderização)
- **Resultado:** [`cards/`](cards/) — 6 PNGs, nomeados
  `2026-08-07_pre_card_evento-paralelo-<slug>_v1.png`

**v2 (07/08, após 1ª rodada de revisão):** local retirado da arte (fica só no texto de WhatsApp);
horário migrou para dentro do badge de data, no topo direito (abaixo de "20 AGO · 2026"), o que
liberou espaço embaixo; logo do Concefor maior; tag "Evento paralelo" e título do evento maiores;
no lugar do gancho de uma linha, cada card agora traz uma descrição de 2–3 linhas sobre o que
acontece no evento, condensada da **descrição original enviada pelos coordenadores**
([`fonte-eventos-satelites.md`](fonte-eventos-satelites.md)) — não é texto inventado, é a
descrição oficial resumida para caber no card.

## 🔄 10/08 — nova direção visual: o carrossel (v4 / v5)

**O layout acima, de 07/08, foi superado.** A peça passou a ser um **carrossel de 7 slides**
(capa + os 6 eventos), com direção visual nova: **fundo escuro**, badge "20 AGO 2026" no topo,
etiqueta do tipo de evento, numeração "02 / 07" e — o ganho maior — **a imagem que cada
coordenação enviou** ocupando o topo do slide (logo do Rio Doce Escolar, foto da Escola de
Inovação, capas do Sofia Carter, logo do Pros@tec, logo do Educimat).

| Onde | O quê |
|---|---|
| [`_build_v4/`](_build_v4/) | Pipeline do carrossel. **`build_cards_v4.py` é a fonte única dos dados** (lista `EVENTOS`) |
| [`_build_v5/`](_build_v5/) | Refinamento de tipografia sobre o v4 — ele **importa o `EVENTOS` do v4**, não duplica conteúdo. Traz [`auditoria-tipografia.md`](_build_v5/auditoria-tipografia.md), que dimensiona cada bloco pela leitura real no celular (arte de 1080 px exibida a ~360 px) |
| [`cards/proposta-v4/`](cards/proposta-v4/) · [`cards/proposta-v5-gradiente/`](cards/proposta-v5-gradiente/) | Saídas para avaliação, com preview do carrossel e `.zip` para publicar |
| [`_build/`](_build/) | 🕘 **Histórico.** Cards individuais 1080×1350 em gradiente turquesa (07/08). Mantido como referência |

✅ **As 3 abreviações de coordenação já entraram resolvidas no v4** — Ciência delas com "Ifes Vila
Velha", Escola de Inovação com "(CCEC-EI / SEME / PMV)" e o Educimat com "Ana Raquel Santos de
Medeiros Garcia" por extenso. **A pendência que travava o envio está encerrada.**

### ✏️ Revisão de texto — 10/08

Aplicada em `_build_v4/build_cards_v4.py`, campo `"sobre"`, que alimenta **v4 e v5 de uma vez**.

**Duas retiradas pedidas:**
- 🚫 *"Não é preciso saber programar"* (IA além do chat) — a ressalva ocupava o lugar do argumento.
- 🚫 *"aberta a quem quiser participar"* (Educimat) — não diz nada sobre o evento.

**E os seis passaram a usar a informação concreta que já estava na
[descrição enviada pelos coordenadores](fonte-eventos-satelites.md) e não chegava ao card:**

| # | Antes | Agora |
|---|---|---|
| 1 | Monte um espaço de trabalho que guarda seu contexto e produz com você. Não é preciso saber programar. | Um professor levava uma semana para transformar aulas antigas. **Passou a levar meia hora.** Você sai com o seu próprio espaço de trabalho, pronto para usar. |
| 2 | O trabalho das mulheres da Rede de Educadores Ambientais do Rio Doce Escolar em pauta. | **Gestoras, pesquisadoras, professoras e agentes comunitárias** da bacia do Rio Doce contam a ciência que fazem na Rede de Educadores Ambientais. |
| 3 | Cultura maker, impressão 3D, robótica e realidade virtual na educação de Vitória. | Impressão 3D, **corte a laser**, robótica e realidade virtual: seis anos da Escola de Inovação, **com visita às estações** onde tudo acontece. |
| 4 | Livros-jogo e projeto autoral para alfabetização em IA na educação básica, com abordagem STEAM. | **Uma jornada em sete etapas** com a coleção de livros-jogo Sofia Carter, para levar a alfabetização em IA à sua sala de aula. |
| 5 | Propostas de resposta aos desafios da Educação em Computação elencados pela SBC. | Pesquisadores apresentam respostas aos desafios da Educação em Computação apontados pela SBC, **em rodas de conversa nos dois turnos**. |
| 6 | Uma celebração aberta a quem quiser participar dos 15 anos do Programa Educimat. | **Quinze anos do mestrado e doutorado profissional em Educação em Ciências e Matemática do Ifes**, comemorados dentro do Concefor. |

**De onde saiu cada informação** *(nada inventado — Artigo IV)*: o caso do professor que passou de
uma semana para meia hora, o corte a laser, a visita às estações, as rodas de conversa nos dois
turnos e a jornada de sete etapas estão todos na descrição ou na programação que os coordenadores
preencheram no formulário. **O evento 6 é a exceção: não tem descrição na fonte** *(consta como
"programação interna ainda sem divulgação")*, então o texto passou a dizer **o que o Educimat é**,
conforme [`contexto/00-evento.md`](../../../contexto/00-evento.md) — mestrado e doutorado
profissional em Educação em Ciências e Matemática do Ifes.

✅ Os textos já apareceram na `proposta-v5-gradiente`, gerada depois da edição — como o v5 lê o
`EVENTOS` do v4, bastou corrigir num lugar.

## 🆕 Proposta "v1 com imagem" — o layout do v1, agora com a imagem de cada evento

**Pedido de 10/08:** uma nova versão do **v1** (card individual, não carrossel) **inserindo a
imagem de referência** que cada coordenação enviou, hoje em [`_refs/`](_refs/).

- **Pipeline:** [`_build_v1-com-imagem/`](_build_v1-com-imagem/) — `build_cards.py` + `render_cards.py`
- **Saída:** [`cards/proposta-v1-com-imagem/`](cards/proposta-v1-com-imagem/) — 6 PNGs
  1080×1350, [preview em grade](cards/proposta-v1-com-imagem/00-preview.png) e
  `preview-celular-360px/` *(mesmo critério da auditoria do v5: 360px é o tamanho real de leitura
  no feed)*
- ⚠️ **Por que o nome não é numerado:** esta proposta nasceu como `_build_v6` e foi **sobrescrita**
  por outra sessão, que usava o mesmo número para a variação *respiro* do carrossel
  ([`cards/proposta-v6-respiro/`](cards/proposta-v6-respiro/)). O nome descritivo tira as duas
  linhas de trabalho da disputa por número.
- **Conteúdo:** importado do `EVENTOS` do v4, como o v5 faz. **Nenhum texto duplicado.**
- **Assets:** referenciados nas pastas que já existem (`../_build/assets` e
  `../_build_v4/assets/events`), sem copiar binário novo para o repo.

### O que mudou em relação ao v1

| # | Decisão | Por quê |
|---|---|---|
| 1 | **Faixa de imagem sangrada no topo** (440px) com a imagem da coordenação | Era o ganho real do v4: a peça deixa de ser só tipografia e passa a mostrar o evento |
| 2 | **Barra de marca sólida** sobre a faixa, com o logo horizontal branco | ⚠️ **Um scrim em degradê não resolveu.** Três imagens vieram como **logo em fundo branco** (Rio Doce Escolar, Pros@tec, Educimat) e o logo branco do Concefor sumia sobre elas. A barra garante contraste em qualquer imagem e conversa com o header do v4/v5 |
| 3 | **Corte reto no fim da faixa + régua turquesa** | O gradiente do card é diagonal, então nenhuma cor fixa casaria com ele. Borda assumida fica mais limpa que um degradê aproximado |
| 4 | **Etiqueta do tipo** ao lado de "Evento paralelo" | O campo `tipo` já existia no v4 e não era aproveitado no v1 |
| 5 | **Dia da semana** no bloco "Quando" | "20/08 · 9h às 12h · quinta-feira" ajuda quem lê sem calendário na mão |
| 6 | **Layout em flexbox**, no lugar do posicionamento absoluto | 🐛 O v1 calculava cada posição a partir de `titulo_lines`, `sobre_lines` e `coord_lines` **declarados à mão**. Se o texto quebrasse em uma linha a mais que o declarado, o bloco seguinte era sobreposto — e cada mudança de texto exigia recontar linha por linha. Em fluxo, o problema deixa de existir |

🐛 **Bug de CSS encontrado e corrigido:** o seletor do modo `contain` era `.hero.is-contain img`,
que atinge **toda** `img` dentro da faixa — inclusive o logo da barra de marca, que herdou um
`padding-top` de 154px e foi empurrado para fora. Pior: com duas classes, ele vencia
`.brandbar img` por especificidade. Resolvido com filho direto (`.hero > img`).

### 🔁 Rodada de ajuste — 10/08

- **Logo do Concefor maior:** 74 → **104px** de altura, com a barra de marca subindo de 138 para
  **168px** para acomodá-la. Era a queixa principal: na barra estreita a marca ficava tímida.
- **Rio Doce Escolar e Educimat maiores.** Os dois são logos em modo `contain`, então ficam
  limitados pela **altura** disponível — mexer só no padding lateral não resolveria. Ganharam
  faixa mais alta (**484px** e **452px**, contra os 440 do padrão) **e** padding bem menor
  (lateral de 96 → **28px**). O ganho maior veio do padding.
- ⚠️ **As duas alturas não são iguais de propósito.** Quanto mais alta a faixa, menos sobra para o
  texto: numa primeira tentativa com 536px nos dois, o bloco "Quando" encostou no rodapé — pior no
  Educimat, cujo título ocupa 3 linhas contra 2 do Ciência delas. Os valores estão calibrados até
  o respiro voltar.
- **Pros@tec ficou no padrão**, embora também seja `contain`: o arquivo enviado já traz uma caixa
  clara própria em volta da marca, e ampliar só aumentaria essa caixa.

### 🔁 Segunda rodada — 10/08

**Educimat maior, sem tocar no layout.** O ajuste anterior tinha esbarrado num limite: a faixa não
podia crescer mais sem espremer o texto. A causa real estava no arquivo — o PNG enviado tem
400×300, mas **o logo ocupa só 45% da altura**; o resto é margem em branco. Como o modo `contain`
encaixa a *imagem inteira* na caixa, a margem entrava junto e o logo saía pequeno por mais que a
faixa crescesse. Recortando a margem (`assets/06-educimat-trim.png`, gerado do próprio arquivo do
v4), **a altura útil dobrou** e o logo cresceu na mesma caixa. O v4 não foi alterado.

**Capa do carrossel criada.** Slide 1 para um carrossel cujos slides 2 a 7 são os cards.
- Arquivo: `2026-08-10_pre_capa-carrossel-eventos-paralelos.png`
- Fonte: [`_build_v1-com-imagem/build_capa.py`](_build_v1-com-imagem/build_capa.py) +
  `render_capa.py` — ⚠️ **arquivos separados de propósito.** Os cards estão aprovados: a capa
  apenas importa o CSS e os dados de `build_cards.py`. **Rodar a capa não regenera card nenhum.**
- Traz o título em Teko, a chamada, o badge de data, a **grade dos 6 numerada na ordem do
  carrossel** e o mesmo rodapé e selo dos cards.
- Duas colisões resolvidas no caminho, ambas causadas pelo selo em losango — que, girado 45°, tem
  o vértice superior em `y=1075` e se abre para os lados dali para baixo: o CTA "arraste" passava
  por baixo dele, e a miniatura 06 tinha o canto coberto. O CTA foi para a linha da data (e
  encurtou, porque a versão longa cobria o badge) e a grade fecha antes de `y=1075`.

### 👀 Três pontos para a sua avaliação

1. **Entre Dois Mundos:** a barra de marca cobre os títulos das capas Sofia Carter, que ficam no
   topo da imagem. Um `object-position` mais baixo resolveria — mas o dado vem do v4, que está
   sendo editado na outra sessão, então não toquei.
2. **Pros@tec:** o PNG enviado tem uma caixa clara própria, que forma um retângulo dentro do fundo
   escuro declarado (`#0b2d54`). Um fundo claro nessa faixa deixaria mais limpo.
3. **Contraste de bloco:** nos dois cards de fundo claro (Ciência delas e Educimat) a barra escura
   cria um contraste forte no topo. Funciona, mas é escolha estética — dá para clarear a barra e
   usar uma versão colorida do logo, se preferir.

## Por que é um card por evento, e não só o carrossel

Quem divulga aqui **não somos nós**: é cada coordenação, na rede dela. Um carrossel não serve para
isso, porque a pessoa precisaria mandar o post inteiro e pedir para o outro deslizar até o slide
certo. Card individual, com o texto do próprio evento, é o que uma coordenação consegue jogar no
grupo de WhatsApp dela sem editar nada.

## Especificação da arte

- **Template único, seis conteúdos.** Mesmo princípio já adotado nos banners institucionais: uma
  arte, o conteúdo muda. É o que cabe no prazo e o que faz os seis parecerem uma família quando
  chegarem juntos nos grupos.
- **Formato:** **1080 × 1350** (mesmo padrão da série de palestrantes, funciona bem no WhatsApp).
  Se sobrar tempo, versão **story 1080 × 1920**, porque coordenador divulga muito em status.
- **O que vai na arte:**
  - Faixa/etiqueta **"Evento paralelo"** (para não confundir com a programação principal)
  - **Nome do evento**
  - **20/08** + **horário** (Momento I, Momento II, ou os dois)
  - **Local** (sala, auditório, pátio ou laboratório)
  - **Coordenação**
  - Marca do Concefor + **selo 20 anos** + assinatura Cefor/Ifes
- **O que NÃO vai na arte:** o link de inscrição. Link em imagem não é clicável; ele vai no texto
  que acompanha o card, já escrito abaixo.
  - 💡 **Alternativa a avaliar:** um **QR code** do formulário no canto do card. Ajuda se a
    coordenação projetar ou imprimir o card, mas polui a peça. Decidir com quem produzir.

## Conteúdo, card a card

Fonte dos dados: [`contexto/07-eventos-paralelos.md`](../../../contexto/07-eventos-paralelos.md)
(que por sua vez vem do documento vivo da Coordenação).

### 1 · IA além do chat: da célula ao organismo baseado em IA
- **Tipo:** oficina prática · **máximo de 20 pessoas**
- **Quando:** 20/08, **9h–12h e 13h30–16h** (os dois momentos)
- **Onde:** **Laboratório de Informática**
- **Coordenação:** Marcos Accioly e Elton Vinícius (Cefor)
- **Na arte:** "Cansou de explicar tudo de novo à IA a cada conversa?"
- **Inscrição:** https://docs.google.com/forms/d/e/1FAIpQLScT0PBfPLGfWC3Dqn5DoLLr7z0VQvY1JG28dU4cgfiAY4151w/viewform
- ⚠️ **É o único com limite de vagas.** O texto precisa dizer isso, senão gera fila e frustração.

### 2 · "Ciência delas" no contexto do Projeto Rio Doce Escolar
- **Tipo:** mesa-redonda e alinhamento
- **Quando:** 20/08, **9h–12h**
- **Onde:** **Auditório**
- **Coordenação:** Manuella Villar Amado (Rio Doce Escolar / Ifes Vila Velha / Educimat)
- **Na arte:** "O trabalho das mulheres da Rede de Educadores Ambientais do Rio Doce Escolar"
- **Inscrição:** https://docs.google.com/forms/d/e/1FAIpQLSe74_bV7qvN0foFezBWmmeLT9J6N9Fdxh1iIUcfSrKP78eIrw/viewform

### 3 · Escola de Inovação: 6º ano de popularização de novas tecnologias digitais
- **Tipo:** cultura maker, fabricação digital, robótica e realidade virtual
- **Quando:** 20/08, **9h–12h e 13h30–16h** (os dois momentos)
- **Onde:** **Sala 2**
- **Coordenação:** Patrícia Piana de Andrade e Daniel Moreira dos Santos (CCEC-EI / SEME / PMV)
- **Na arte:** "Seis anos levando tecnologia digital para a educação de Vitória"
- **Inscrição:** https://docs.google.com/forms/d/e/1FAIpQLSeR3Qr9AMh79SbCtmvDA7UgsWRsvAQx2eevJlUtgm9sSVLYlg/viewform

### 4 · Entre Dois Mundos: uma aventura para aprender IA
- **Tipo:** oficina · alfabetização em IA com os livros-jogo Sofia Carter e abordagem STEAM
- **Quando:** 20/08, **13h30–16h**
- **Onde:** **Sala 4**
- **Coordenação:** Juliana Cristina dos Santos Waichert (Ifes)
- **Na arte:** "Alfabetização em IA na educação básica, com livro-jogo"
- **Inscrição:** https://docs.google.com/forms/d/e/1FAIpQLSdlGMQs3RPPoERWbk-N-MiiXO3gM8nrhoORqhlgObfSEHhb5g/viewform
- **Imagens de apoio:** capas Sofia Carter em [`_refs/`](_refs/) (`divulgacao-image1..3.png`)

### 5 · Workshop Pros@tec: Desafios da Educação em Computação e da Informática na Educação
- **Tipo:** workshop
- **Quando:** 20/08, **9h–12h e 13h30–16h** (os dois momentos)
- **Onde:** **Sala 1**
- **Coordenação:** Márcia Gonçalves de Oliveira e Rosane Muñoz (Cefor)
- **Na arte:** "Os desafios da Educação em Computação elencados pela SBC, em debate"
- **Inscrição:** https://docs.google.com/forms/d/e/1FAIpQLScwY-ubXyCmx7hA1CpxwDdTSVthgfVHWvWeY2pmFgnSdyN_CA/viewform
- **Logo:** [`_refs/divulgacao-image4.png`](_refs/divulgacao-image4.png)

### 6 · EDUCIMAT: 15 anos elaborando produtos, tecendo saberes e modificando vidas
- **Tipo:** celebração dos 15 anos do programa
- **Quando:** 20/08, **13h30–16h**
- **Onde:** **Pátio**
- **Coordenação:** Edmar Reis Thiengo e Ana Raquel Santos de Medeiros Garcia (Educimat / Ifes)
- **Na arte:** "15 anos elaborando produtos, tecendo saberes e modificando vidas"
- **Inscrição:** 🔴 **não tem formulário próprio.** O texto dele aponta para a inscrição do
  Concefor. `[confirmar com o Educimat]` se haverá formulário ou se a entrada é livre.
- ℹ️ Contato: coordenacao.educimat@ifes.edu.br · (27) 99968-2027

## Textos para cada coordenação enviar

Um por evento, prontos para copiar. Negrito do WhatsApp é `*asterisco*`. Sem travessão, conforme a
[diretriz de copy do repo](../../../templates/checklist-humanizer.md).

### 1 · IA além do chat
```
🤖 *IA além do chat: da célula ao organismo baseado em IA*
Oficina prática no VIII Concefor

Cansou de explicar tudo de novo à IA a cada conversa? Nesta oficina você monta um espaço de trabalho que guarda o seu contexto e produz junto com você. Não é preciso saber programar.

📅 20/08 (quinta), 9h às 12h e 13h30 às 16h
📍 Laboratório de Informática, Cefor/Ifes, Vitória
👥 *Vagas limitadas: 20 pessoas*

Inscreva-se aqui:
https://docs.google.com/forms/d/e/1FAIpQLScT0PBfPLGfWC3Dqn5DoLLr7z0VQvY1JG28dU4cgfiAY4151w/viewform
```

### 2 · Ciência delas
```
🔬 *"Ciência delas" no contexto do Projeto Rio Doce Escolar*
Mesa-redonda no VIII Concefor

Um encontro para dar visibilidade ao trabalho de mulheres gestoras, pesquisadoras, professoras e agentes comunitárias da Rede de Educadores Ambientais do Projeto Rio Doce Escolar.

📅 20/08 (quinta), 9h às 12h
📍 Auditório do Cefor/Ifes, Vitória

Inscreva-se aqui:
https://docs.google.com/forms/d/e/1FAIpQLSe74_bV7qvN0foFezBWmmeLT9J6N9Fdxh1iIUcfSrKP78eIrw/viewform
```

### 3 · Escola de Inovação
```
🛠️ *Escola de Inovação: 6º ano de popularização de novas tecnologias digitais*
No VIII Concefor

Cultura maker, impressão 3D, robótica e realidade virtual: seis anos levando tecnologia digital para a educação de Vitória.

📅 20/08 (quinta), 9h às 12h e 13h30 às 16h
📍 Sala 2, Cefor/Ifes, Vitória

Inscreva-se aqui:
https://docs.google.com/forms/d/e/1FAIpQLSeR3Qr9AMh79SbCtmvDA7UgsWRsvAQx2eevJlUtgm9sSVLYlg/viewform
```

### 4 · Entre Dois Mundos
```
📚 *Entre Dois Mundos: uma aventura para aprender IA*
Oficina no VIII Concefor

Alfabetização em Inteligência Artificial na educação básica, com a coleção de livros-jogo Sofia Carter e abordagem STEAM.

📅 20/08 (quinta), 13h30 às 16h
📍 Sala 4, Cefor/Ifes, Vitória

Inscreva-se aqui:
https://docs.google.com/forms/d/e/1FAIpQLSdlGMQs3RPPoERWbk-N-MiiXO3gM8nrhoORqhlgObfSEHhb5g/viewform
```

### 5 · Workshop Pros@tec
```
💻 *Workshop Pros@tec: Desafios da Educação em Computação e da Informática na Educação*
No VIII Concefor

Pesquisadores reunidos para discutir os desafios da Educação em Computação e da Informática na Educação elencados pela SBC.

📅 20/08 (quinta), 9h às 12h e 13h30 às 16h
📍 Sala 1, Cefor/Ifes, Vitória

Inscreva-se aqui:
https://docs.google.com/forms/d/e/1FAIpQLScwY-ubXyCmx7hA1CpxwDdTSVthgfVHWvWeY2pmFgnSdyN_CA/viewform
```

### 6 · Educimat 15 anos
```
🎉 *EDUCIMAT: 15 anos elaborando produtos, tecendo saberes e modificando vidas*
Celebração no VIII Concefor

O Educimat completa 15 anos e a comemoração acontece dentro do Concefor, aberta a quem quiser participar.

📅 20/08 (quinta), 13h30 às 16h
📍 Pátio do Cefor/Ifes, Vitória

Inscreva-se no Concefor até 15/08:
https://concefor.cefor.ifes.edu.br/inscricoes/
```

## Texto de entrega para os coordenadores

Mensagem única que acompanha o envio dos cards, uma para cada coordenação:

```
Olá! Aqui é a equipe de comunicação do VIII Concefor.

Preparamos um card do seu evento paralelo para você divulgar na sua rede: grupos, redes sociais, listas de e-mail, onde fizer sentido para o seu público.

Vai junto um texto pronto, com data, horário, local e o link de inscrição. É só copiar e enviar com a imagem, ou adaptar do jeito que preferir.

Quanto mais cedo a divulgação começar, mais gente consegue se organizar para estar lá no dia 20/08.

Qualquer ajuste no card ou no texto, é só falar.
```

## Pendências

| # | Pendência | Quem decide |
|---|---|---|
| 1 | ✅ **Quem produz as artes** — Elton, via pipeline de código. ✅ **Coordenações e textos revisados em 10/08.** Falta **regerar os PNGs** e **enviar**. | Elton |
| 6 | ⚠️ **A arte manda para o site do Concefor, mas a inscrição de cada evento é por formulário próprio.** O rodapé leva a `concefor.cefor.ifes.edu.br`, enquanto o link real é um Google Forms que vai só no texto que acompanha. **O uso previsto é exatamente o que expõe isso:** a coordenação joga a peça num grupo de WhatsApp e ela é repassada adiante **sem o texto**. Quem receber assim vai ao site e não encontra o formulário daquele evento. 👉 Duas saídas: **QR code do formulário na arte** (é a pendência 4) ou aceitar o risco, contando que quem se interessar chegue à inscrição do Concefor de todo modo. Nota: para o **Educimat** não há divergência, porque ele não tem formulário próprio e o site é o destino certo. | Elton / quem produzir |
| 2 | ❓ **Participar de um evento paralelo exige inscrição no Concefor**, além do formulário próprio? Os textos acima levam só ao formulário do evento. Se exigir, é preciso dizer nos seis. | Coordenação |
| 3 | ❓ **Educimat sem formulário.** Confirmar se terá inscrição própria ou entrada livre. | Educimat |
| 4 | ❓ **QR code do formulário na arte**, sim ou não. | quem produzir |
| 5 | ❓ **O carrossel dos 6 no feed do Cefor continua de pé?** A recomendação é sim, montado a partir dos mesmos cards, respeitando a cadência de um card por dia. | Elton / Coordenação |

## Checklist final
- [x] Definido quem produz as artes — Elton, 07/08
- [x] Template aprovado (um dos seis serve de piloto) — template único gerado por código, ver acima
- [x] Os 6 cards exportados em 1080 × 1350
- [x] **Coordenações completas, sem abreviação** — entraram resolvidas no v4 *(10/08)*
- [x] **Textos revisados** — 2 trechos retirados e os 6 reescritos com informação da fonte *(10/08)*
- [ ] 🔴 **Regerar os PNGs com os textos novos** *(pendente: v5 em edição)*
- [ ] **Links de inscrição testados um a um** — 5 formulários + o caso do Educimat, que não tem
- [x] Selo 20 anos e assinaturas aplicados
- [ ] 🔴 **Kits enviados às 6 coordenações (card + texto)** — é o que falta, e os eventos são 20/08
- [x] Registrado no board de produção

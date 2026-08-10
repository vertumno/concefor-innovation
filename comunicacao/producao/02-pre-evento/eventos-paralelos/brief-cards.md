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
- **Responsável pela arte:** Elton (produzida em 07/08 com Claude Code, ver abaixo)
- **Status:** 🟡 Artes produzidas, aguardando revisão antes de enviar às coordenações

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

- ⚠️ **Revisar antes de enviar:** para caber no espaço do card, a coordenação saiu abreviada em
  3 dos 6 (nome ou instituição cortados). Conferir linha a linha:
  - **Ciência delas:** título sem "no contexto do"; coordenação sem "Ifes Vila Velha"
    (ficou só "Rio Doce Escolar / Educimat")
  - **Escola de Inovação:** coordenação sem a instituição entre parênteses (era
    "CCEC-EI / SEME / PMV")
  - **Educimat:** "Ana Raquel Santos de Medeiros Garcia" abreviado para "Ana Raquel S. de M. Garcia"

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
| 1 | ✅ **Quem produz as 6 artes** — resolvido em 07/08: Elton, via pipeline de código (ver acima). Falta revisar as abreviações de coordenação antes de enviar. | Elton |
| 2 | ❓ **Participar de um evento paralelo exige inscrição no Concefor**, além do formulário próprio? Os textos acima levam só ao formulário do evento. Se exigir, é preciso dizer nos seis. | Coordenação |
| 3 | ❓ **Educimat sem formulário.** Confirmar se terá inscrição própria ou entrada livre. | Educimat |
| 4 | ❓ **QR code do formulário na arte**, sim ou não. | quem produzir |
| 5 | ❓ **O carrossel dos 6 no feed do Cefor continua de pé?** A recomendação é sim, montado a partir dos mesmos cards, respeitando a cadência de um card por dia. | Elton / Coordenação |

## Checklist final
- [x] Definido quem produz as artes — Elton, 07/08
- [x] Template aprovado (um dos seis serve de piloto) — template único gerado por código, ver acima
- [x] Os 6 cards exportados em 1080 × 1350
- [ ] Conferência de nome, horário, local e coordenação, evento por evento — **3 abreviações a confirmar** (ver acima)
- [ ] Links de inscrição testados um a um
- [x] Selo 20 anos e assinaturas aplicados
- [ ] Kits enviados às 6 coordenações (card + texto)
- [x] Registrado no board de produção

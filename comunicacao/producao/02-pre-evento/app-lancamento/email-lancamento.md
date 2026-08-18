# E-mail de lançamento do app — envio pelo Even3

> Peça da frente "Divulgação do lançamento do app" ([board](../../../planejamento/board-producao.md)).
> Redigida em 14/08/2026. Canal: ferramenta de e-mail do Even3
> (Pessoas → Notificar pessoas → Envio de e-mail).
> Passou pela régua do [checklist-humanizer](../../../templates/checklist-humanizer.md).
>
> ✅ **ENVIADA em 14/08/2026.** As seções abaixo ficam como registro e como guia para um
> eventual próximo envio (lembrete na véspera, aviso durante o evento).
> 📊 Resultados do disparo na seção no fim deste arquivo (planilha em `_refs/`).

## ⚠️ Antes de enviar

1. ✅ **App no ar confirmado em 14/08**: a contingência de deploy (GitHub privado → TI)
   se concretizou e https://app.cefor.ifes.edu.br responde. Se o envio ficar para outro
   dia, reconferir antes do disparo: e-mail com o app fora do ar queima a peça.
2. **Testar antes do disparo geral.** As ferramentas nativas não ajudam sem o Alex
   ("Pré-visualizar" e "Envio de exemplo" vão para a conta do organizador logado), e o
   envio para pessoas selecionadas uma a uma não é possível (constatado em 14/08).
   Alternativas, em ordem de preferência:
   - **Situação "Organizadores" (3 pessoas):** disparar o e-mail real para esse grupo,
     que é o time interno (conferir quem são clicando no filtro "Organizador" do painel
     lateral). Se o Marquito estiver entre eles, valida na própria caixa; se não, pedir
     print a quem recebeu. Conferir tag `{participante.primeiro.nome}`, imagem, link e
     formatação **no celular**.
   - **"Envio de exemplo" + Alex remoto:** ele não precisa estar presente, só de sinal;
     recebe o exemplo e manda print pelo WhatsApp.
   - **Sem teste (aceitável no limite):** as tags são documentadas pela própria tela, a
     formatação da copy é simples e nada essencial depende da imagem. O risco residual é
     estético; se for por esse caminho, vale simplificar ou até omitir a imagem.
3. Conferir se o **sync do Even3 rodou** (roda sozinho a cada 10 min em produção): quem é
   confirmado lá precisa conseguir logar no app na hora em que o e-mail chegar.

## Configuração do envio (tela do Even3)

| Campo | Valor | Por quê |
|---|---|---|
| Conteúdo | Criar do zero | — |
| Situação | **Inscritos** (grupo "Evento") | O dropdown de envio não tem "Inscrição confirmada"; "Inscritos" é o equivalente: quem concluiu a inscrição (≈254). Os 146 "inscrição não realizada" caem em "Não inscritos" e ficam de fora, o que é o certo: só inscrito confirmado consegue logar no app (decisão de 04/08). **Não usar** "Inscrito e credenciado / não credenciado": credenciamento é o check-in no evento, que só começa em 17/08. ✔️ Depois do disparo, conferir no "Histórico de envios" se o total de destinatários bate com ~254; se vier ~400, a opção pegou gente demais e vale registrar para a próxima. |
| Tipo de envio | **Notificação por texto** | Permite o editor com texto + imagem inline. "Notificação por imagem" manda só a arte, e cliente de e-mail bloqueia imagem por padrão: a informação essencial precisa estar em texto. |
| Assunto | `O app do VIII Concefor está no ar` | Variante com emoji, se quiser: `O app do VIII Concefor está no ar 📱` |

## Copy (colar no editor)

A imagem de abertura entra no topo do corpo, pelo botão de imagem da barra do editor.
Negrito só onde indicado.

---

Olá, {participante.primeiro.nome}!

O VIII Concefor começa na segunda-feira (17/08) e este ano o evento tem um app, feito aqui no Cefor:

**https://app.cefor.ifes.edu.br**

Nele você acompanha a programação dos quatro dias e vê, em destaque, o que está acontecendo agora e o que vem a seguir. Marcando as sessões que mais interessam, você monta a sua própria agenda do evento.

Durante as palestras vem a melhor parte: dá para reagir e mandar perguntas pelo celular, e tudo aparece ao vivo no telão do auditório. As perguntas mais votadas pela plateia sobem na lista.

No evento, o app ainda vira um cartão de visitas: aponte o leitor de QR para o crachá de outro participante e pronto, o contato fica salvo na sua lista.

**Como entrar**

Para ver a programação não precisa de login. Para reagir, perguntar e se conectar com as pessoas, use:

- o número do seu ingresso (8 dígitos, impresso no seu ingresso do Even3 e no crachá que você recebe no credenciamento);
- e os 4 primeiros dígitos do seu CPF, ou o e-mail da inscrição.

O app abre direto no navegador, sem loja de aplicativos. Se quiser, adicione à tela inicial do celular e use como um aplicativo comum.

Até segunda!

Equipe do VIII Concefor
Cefor / Ifes

---

## Imagem de abertura (spec)

- **Formato:** 1200×628 px (aparece com ~600 px de largura nos clientes de e-mail),
  PNG ou JPG, abaixo de 1 MB.
- **Conteúdo:** identidade dos cards (gradiente turquesa→azul, selo 20 anos, Teko/Montserrat),
  um celular com uma tela real do app (Início ou Ao Vivo) e uma linha de texto:
  "O app do VIII Concefor", com a URL `app.cefor.ifes.edu.br` legível.
- **Sem QR na imagem do e-mail:** a maioria lê no celular e não escaneia a própria tela;
  o link resolve. QR fica para as peças impressas e para o telão (`/projecao`).
- **Regra de ouro:** nada essencial só na imagem. Cliente de e-mail bloqueia imagem por
  padrão, então o texto sustenta a mensagem sozinho.
- ✳️ Alternativa sem designer: gerar pelo **pipeline de cards por código**
  (HTML/CSS → Chrome headless → PNG), o mesmo dos 6 cards dos eventos paralelos,
  trocando o formato para 1200×628.

## Fatos que a copy usa (fontes)

- URL oficial: https://app.cefor.ifes.edu.br (`links.md`).
- Login: nº do ingresso (8 dígitos, campo `checkin_code` do Even3, o mesmo do QR do
  crachá) + 4 primeiros dígitos do CPF **ou** e-mail (`spec/app-v1.md`, decisões de
  20/07 e 04/08).
- Navegar é aberto; reagir, perguntar e votar exigem login (decisão de 05/08).
- Só inscrito **confirmado** no Even3 entra (decisão de 04/08).
- Conexão por QR do crachá é bilateral, contato com nome e e-mail (decisões de 04–05/08).

## 📊 Resultados do disparo (foto de 14/08, 17h38)

Fonte: exportação "Histórico de envios" do Even3
([`_refs/ListaDetalhesEnvio_14-08-2026_17-38-31.xlsx`](_refs/ListaDetalhesEnvio_14-08-2026_17-38-31.xlsx)),
poucas horas após o envio. Abertura tende a crescer no fim de semana; para o número
maduro, re-exportar no domingo à noite.

**Alcance e entrega: perfeitos.**

- **254 destinatários únicos, 254 entregas, zero bounce.** O total bate exatamente com o
  filtro "Inscrição confirmada" do painel: o disparo foi para o público certo, só quem
  consegue logar no app. A pendência de conferência está fechada.
- Uma única participante tem 2 inscrições confirmadas e recebeu duas vezes; inofensivo.
- A 2ª inscrição do Marquito (Gmail) não está na lista, confirmando que só a do Ifes está
  com inscrição confirmada.

**Engajamento até as 17h38:**

| Métrica | Valor |
|---|---|
| Abriram | 44 de 254 (17%) |
| Clicaram | 11 (4,3% da base; **25% de quem abriu**) |
| Cliques no link do app | 7 |
| Cliques na página do evento no Even3 | 4 *(link que o Even3 acrescenta por conta própria; a copy não o tinha)* |

**🔴 O achado que importa: o e-mail institucional quase não registrou abertura.**

| Domínio | Base | Abriram |
|---|---|---|
| gmail.com | 140 (55%) | 37 (26%) |
| **ifes.edu.br** | **75 (30%)** | **1 (1%)** |
| hotmail.com | 17 | 3 (18%) |
| yahoo.com.br | 9 | 1 (11%) |

Duas hipóteses, com ações diferentes:

1. **O webmail do Ifes bloqueia o pixel de rastreio** → as aberturas existem mas não são
   contadas. Nada a fazer, só desconfiar do número.
2. **O e-mail caiu em spam/quarentena institucional** → 30% da base efetivamente não viu.

**✅ Hipótese 2 CONFIRMADA na noite de 14/08: quarentena institucional.** O Marquito tem
Delivery registrado no próprio @ifes.edu.br e **a mensagem não está na caixa dele, nem no
spam**. Ou seja: o gateway do Ifes aceitou (por isso o Even3 marca "Delivery") e segurou a
mensagem antes da caixa. Na prática, **os 75 participantes @ifes.edu.br (30% da base) não
receberam**. Lição para o repo: **"Delivery" do Even3 significa "aceito pelo servidor de
destino", não "chegou à caixa"** — quarentena é invisível para a plataforma.

## 📨 Reenvio interno para @ifes.edu.br (plano de contorno)

A quarentena barra remetente externo; **e-mail interno, de conta @ifes.edu.br para
@ifes.edu.br, não passa por ela**. O contorno:

1. **Remetente:** uma conta institucional (a do Marquito ou submissoes.concefor@ifes.edu.br).
2. **Destinatários: os 75 endereços @ifes.edu.br em Cco (cópia oculta)**, nunca no Para.
   A lista se extrai da planilha em `_refs/` filtrando o domínio. ⚠️ **Não commitar lista
   de e-mails nem a planilha: o repo é público** (a planilha já está no `.gitignore`).
3. **Texto simples, sem imagem** (menos atrito com filtro; a copy sustenta sozinha).
4. Complementos: pedir à TI a liberação da mensagem em quarentena e a whitelist do
   remetente do Even3 (útil para envios futuros); reforços presenciais seguem valendo.

**Assunto:** `O app do VIII Concefor está no ar`

---

Olá!

Estamos reenviando este convite por aqui porque o envio feito pela plataforma de inscrições pode não ter chegado às caixas do Ifes.

O VIII Concefor começa na segunda-feira (17/08) e este ano o evento tem um app, feito aqui no Cefor:

https://app.cefor.ifes.edu.br

Nele você acompanha a programação dos quatro dias e vê, em destaque, o que está acontecendo agora e o que vem a seguir. Marcando as sessões que mais interessam, você monta a sua própria agenda do evento.

Durante as palestras vem a melhor parte: dá para reagir e mandar perguntas pelo celular, e tudo aparece ao vivo no telão do auditório. As perguntas mais votadas pela plateia sobem na lista.

No evento, o app ainda vira um cartão de visitas: aponte o leitor de QR para o crachá de outro participante e pronto, o contato fica salvo na sua lista.

Como entrar: para ver a programação não precisa de login. Para reagir, perguntar e se conectar com as pessoas, use o número do seu ingresso (8 dígitos, impresso no seu ingresso do Even3 e no crachá que você recebe no credenciamento) e os 4 primeiros dígitos do seu CPF, ou o e-mail da inscrição.

O app abre direto no navegador, sem loja de aplicativos. Se quiser, adicione à tela inicial do celular e use como um aplicativo comum.

Até segunda!

Equipe do VIII Concefor
Cefor / Ifes

---

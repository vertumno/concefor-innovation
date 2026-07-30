# Validação com a comissão — 30/07/2026, 9h às 10h (R6)

Preparação feita em 29/07. O app roda no servidor da CGTI — endereço oficial (30/07):
**https://app.cefor.ifes.edu.br** (TLS válido, SSE ok; **usar sempre o DNS nos links** —
o IP interno http://172.17.159.15:3000 é só fallback). Deploy é **manual**: Sérgio puxa
o espelho do GitLab no servidor e rebuilda (integração automática em estudo, com o
Eduardo).

## O que aconteceu (diagnóstico de 29/07)

O app que o Sérgio colocou no ar estava **sem tudo de 20/07 (R1–R9)**: o espelho do
GitLab de 23/07 foi gerado de uma linha do histórico que ainda não continha esses
commits (eles entraram no `main` por merge *depois* do push). Além disso, o banco do
servidor foi semeado com o `seed.mjs` aposentado (23 sessões da programação manual
antiga) — o README de deploy ainda mandava isso. Corrigido em 29/07: espelho
atualizado, README reescrito (sync Even3 como fonte, aviso de migração da base) e
scripts de teste novos.

## Preparado em 29/07

- **`npm run seed:validacao`** (`scripts/seed-validacao.mjs`): grade de 7 sessões
  fictícias em 30/07, das 9h às 17h30 (validação às 9h; blocos de teste o dia todo,
  com vão no almoço pra mostrar a contagem regressiva do Ao Vivo). Ids
  `demo-validacao-*`: sobrevivem ao re-sync do Even3, horários ajustáveis ao vivo
  pelo `/admin`, remoção com `--limpar`, outra data com `--data=AAAA-MM-DD`.
- **`/projecao`**: tela para o telão com QR de acesso + endereço. O QR aponta pro
  endereço em que a página foi aberta — funciona com o IP hoje e com o DNS depois.
- **README do app** (= instruções de deploy no GitLab) corrigido: `sync:even3` no
  lugar do seed aposentado, passo de migração da base antiga, sessões de teste.

## Checklist até amanhã 9h

**Marquito (hoje):**
- [x] Atualizar o espelho GitLab com tudo (R1–R9 + preparação da validação)
- [ ] Mandar ao Sérgio a mensagem de atualização (abaixo) + `EVEN3_API_TOKEN` por
  canal seguro (não deixar o token no histórico do chat, se possível)
- [x] Depois do deploy: smoke test no IP — feito 29/07 à tarde (`/agenda`,
  `/projecao`, `/api/speakers` 200; composição do banco conferida)
- [ ] Testar **do celular no Wi-Fi do IFES** (o IP é interno — se o Wi-Fi dos
  visitantes não alcançar a VLAN do servidor, a demo com a plateia não funciona;
  plano B abaixo)
- [ ] Conferir com a Márcia se haverá gente remota na validação → se sim,
  compartilhar a tela (o IP não abre de fora da rede)
- [ ] Levar notebook com o repo atualizado (plano B) + carregador; testar
  `npm run dev` + `seed:validacao` local antes de sair

**Sérgio (no servidor):** ✅ **tudo feito na tarde de 29/07** — conferido remotamente:
rotas novas no ar (`/agenda`, `/projecao`), banco com **15 sessões Even3 + 7 da
validação e zero sobras** do seed antigo (logo o sync rodou → `EVEN3_API_TOKEN` está
lá). Falta só **confirmar com ele o `ADMIN_TOKEN`** para o Marquito abrir o `/admin`
na demo.
- [x] Atualizar o repo do GitLab + rebuild + recriar container
- [x] `EVEN3_API_TOKEN` configurado (sync rodou); ⚠️ confirmar `ADMIN_TOKEN` com o Marquito
- [x] Base antiga zerada + sync do Even3 (15 sessões, 4 dias)
- [x] `scripts/seed-validacao.mjs` rodado (7 sessões de 30/07)

**Plano B (se o servidor falhar amanhã):** notebook do Marquito na mesma rede,
`npm run build && npm run start` + `sync:even3` + `seed:validacao`; projetar
`/projecao` com o IP do notebook.

## Roteiro da demo (~10 min, começa às 9h)

1. **Entrada (2 min)** — telão em `/projecao`; cada pessoa escaneia o QR e cai no
   Início: saudação, "acontecendo agora: Validação do app", avisos da organização.
2. **Navegação** — barra inferior: Início → **Agenda** (4 dias, programação oficial
   vinda do Even3) → favoritar uma sessão ("minha programação").
3. **Ao Vivo** — botão central: cai na sessão da validação (está no ar). Todo mundo
   reage 👍❤️.
4. **Telão** — trocar a projeção para `/telao`: o batimento cardíaco pulsa com as
   reações da sala em tempo real (<2s).
5. **Perguntas** — plateia envia perguntas (≤140, anônimas) e vota; mostrar a
   moderação (ocultar/fechar janela) pelo `/admin`.
6. **Pessoas** — palestrantes reais + mosaico de conexões: conectar dois celulares
   ao vivo (digitar o nº — a câmera do QR fica pro HTTPS) e ver os quadradinhos
   acenderem.
7. **Identidade (30s)** — `/entrar`: nº do ingresso + 4 primeiros dígitos do CPF,
   consentimento LGPD; hoje é opcional, exigência pós-validação.
8. **Bastidor** — `/admin` no notebook: dispositivos ativos, reações por minuto,
   relatório (`/admin/relatorio`) — o embrião do relatório institucional.
9. **Fechamento** — linha do tempo dos 20 anos como espinha do app; próximos
   marcos: DNS + HTTPS (PWA instalável, câmera do QR), lançamento por e-mail em
   **07/08**, evento em **17/08**.

**Dizer com franqueza (limitações de hoje):** endereço por IP e só na rede do IFES
(DNS/HTTPS em andamento com CGTI/DRTI); sem instalação como app até o HTTPS; a
programação espelha o Even3 — que a organização ainda precisa terminar de atualizar
(mesa "Tecnologia Delas" etc., ver pendências em `proximos-passos.md`).

**Coletar (objetivo do R6):** quantos entraram sem ajuda? Reação ao telão e às
perguntas? Ideias novas? → registrar em `../decisoes.md` + síntese em
`../contexto/reunioes/`, e recortar o escopo do lançamento de 07/08.

## Perguntas para a comissão (levar impresso/aberto na reunião)

### Decisões que precisamos sair da reunião com resposta

1. **Interagir vai exigir login?** Hoje reagir/perguntar são anônimos (decisão de 06/07:
   anônimo é o piso até a validação). Liga a exigência pro evento ou mantém aberto?
2. **Inscritos "não confirmados": o que são?** Dos 298 registros da API, **151 não estão
   confirmados — e todos os 151 estão sem categoria** (parecem inscrições incompletas).
   O número oficial de inscritos do evento é ~147 ou ~298? O app deve considerar **só
   confirmados** no login, no mosaico de conexões e nos números do dashboard?
   *(Checar no painel do Even3 com a Márcia como esses 151 aparecem lá.)*
3. **Segundo fator do login:** a premissa de 20/07 ("CPF existe para todos") quebrou —
   67/298 sem CPF utilizável. Ok aceitar o **e-mail da inscrição** como confirmação
   alternativa no mesmo campo? *(confirmar com o Elton)*
4. **Programação divergente:** o Even3 ainda não espelha o site (mesa "Tecnologia Delas"
   de 18/08 etc.) — **quem** corrige o Even3 e **até quando**? O app mostra o que está lá.
5. **Lançamento 07/08:** quem fecha o texto do e-mail com a Márcia na semana de 03/08?
   Envio pelo Even3 ou e-mail comum?
6. **DNS + HTTPS:** chamado na DRTI a caminho (Sérgio). Sem HTTPS não há app instalável
   nem câmera de QR no lançamento — alguém da comissão pode ajudar a priorizar?

### Logística do evento (rápidas)

7. **Telão:** haverá projetor/tela dedicados ao telão nas palestras do Auditório? Podemos
   ensaiar na sala real antes de 17/08 (R9)?
8. **Operação durante o evento:** quem além do Marquito terá o token do `/admin`
   (moderar perguntas, ajustar horários, abrir/fechar janelas)?
9. **Transmissão × gravação por sessão** (checklist da Márcia desde 16/07) — como ficou?
   Impacta os "momentos quentes" e o relatório final.
10. **"Dica do dia"** (alimentação/arredores): a Márcia ainda topa mandar o conteúdo?
    Até quando?

### Para observar durante a demo (não perguntar — anotar)

- Quantos entraram **sem ajuda** só com o QR do telão? Onde travou quem travou?
- Alguém achou sozinho o "o que está acontecendo agora"? E o botão Ao Vivo?
- O telão pulsando mudou o clima da sala? Alguém sugeriu que **distrairia** o palestrante?
- As perguntas com upvote geraram uso real ou só curiosidade?
- O que pediram que **não** existe (anotar pra fase 2 — não prometer na hora)?

## Mensagem pronta pro Sérgio (WhatsApp)

> Serginho, atualizei o GitLab agora — pode puxar. Aquela versão que estava no ar
> era antiga mesmo (problema no nosso espelho, já corrigido; a nova tem navegação
> nova, admin, perguntas, networking).
>
> Pra atualizar, o README do repo tá com o passo a passo certinho (seção Deploy),
> mas o resumo é:
>
> 1. `git pull` no repo do servidor + rebuild (docker build + recriar o container,
>    ou `npm install && npm run build` se estiver rodando sem Docker).
> 2. No `.env.local` do servidor: `ADMIN_TOKEN` (define um segredo e me passa) e
>    `EVEN3_API_TOKEN` (te mando em separado). `NEXT_PUBLIC_DEMO=0`.
> 3. **Importante:** apaga o arquivo `concefor.db` do volume de dados — a base foi
>    criada com um seed antigo — e roda
>    `node scripts/sync-even3.mjs` (puxa a programação oficial do Even3).
> 4. Roda `node scripts/seed-validacao.mjs` — cria as sessões de teste de amanhã
>    (a demonstração é 9h–10h, com testes ao longo do dia).
>
> Aí me avisa que eu confiro tudo daqui. Valeu demais!

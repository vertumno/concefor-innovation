# Spec — App do VIII Concefor (v1)

Especificação do app do evento. Serve de handoff para o build em `app/`.
**Reformulada em 16/07/2026**: navegação por barra inferior com "Ao Vivo" no centro
(benchmark EDEN — `contexto/benchmark-app-eden/`), integração Even3 somente-leitura
(`contexto/even3/api.md`) e datas duras acordadas com a Márcia (validação 30/07,
lançamento 07/08 — `decisoes.md`).

- **Evento:** VIII Concefor, 17–20/08/2026, Cefor/IFES, Vitória-ES (ver `contexto/evento.md`)
- **Objetivo:** causar no evento com simplicidade — poucas coisas, muito efetivas
- **Janela:** ~7,5 semanas a partir de 25/06/2026

---

## 1. Conceito-espinha: a linha do tempo

Tudo que acontece no evento é um **registro com timestamp e tipo**, gravado numa única linha do
tempo. A programação é a espinha (sessões posicionadas no tempo); reações, check-ins e (na fase 2)
perguntas/fotos/anotações são eventos pendurados nessa linha. **App, telão e relatório derivam do
mesmo modelo de dados.** Esse conceito também é a alusão aos 20 anos (passado→presente→futuro) e o
que o participante leva pra casa (linha do tempo pessoal).

## 2. Stack

- **Frontend:** Next.js (App Router) como **PWA** (`next-pwa`), instalável via "adicionar à tela
  inicial". Mobile-first.
- **Backend/dados:** **SQLite local** (`better-sqlite3`) atrás de uma interface única
  (`lib/db`) + **API routes do Next** + **SSE** (Server-Sent Events) para o tempo real das
  reações/telão. Supabase saiu do v1 (ver `decisoes.md` 2026-07-06); o schema conceitual é o
  mesmo e a volta é barata se precisar.
- **Deploy:** **self-host no Cefor (Docker)** ou notebook na rede do evento — SQLite + SSE
  pedem processo sempre-ligado com disco (Vercel serverless não serve). App auto-contido
  (`output: standalone`). Para o lançamento público precisa de **endereço estável com
  HTTPS** (PWA instalável e câmera do QR scanner exigem secure context).
- **Integração Even3 — somente leitura:** um sync **no servidor** puxa programação,
  palestrantes e inscritos da API (`Authorization-Token`) para o SQLite; o app nunca chama
  o Even3 do navegador. Chave em `app/.env.local` (`EVEN3_API_TOKEN`), **gitignored** —
  jamais no repo ou no cliente. Endpoints e achados em `contexto/even3/api.md`.
  Escrita (check-in/credenciamento) fica para decisão futura.
- **Sem app store.** Sem dependência de IA externa no v1.

## 3. Modelo de dados

```sql
-- sessões da programação (a espinha)
sessions(
  id, titulo, descricao, sala, eixo,
  palestrante, inicio timestamptz, fim timestamptz
)

-- todo evento da linha do tempo (reações no v1; perguntas/fotos/anotações na fase 2)
timeline_events(
  id, tipo text,            -- 'reaction' | 'checkin' | ... (extensível)
  session_id references sessions(id) null,
  ts timestamptz default now(),
  payload jsonb,            -- ex.: { "emoji": "❤️" } ou { "reaction": "like" }
  client_id text            -- id anônimo do dispositivo (sem PII no v1)
)
```

Tudo que for feature nova entra como novo `tipo` em `timeline_events`, sem mudar o esquema. Esse é
o ponto que mantém o app simples enquanto cresce.

## 4. Features v1

### 4.0 Navegação: barra inferior com "Ao Vivo" no centro (reformulação de 16/07)

O menu sai do topo e vira **barra inferior fixa de 5 itens** (padrão de app de evento,
alcançável com o polegar — benchmark `contexto/benchmark-app-eden/`). O slot central é a
nossa torção: um **botão "Ao Vivo"** em destaque (círculo elevado, gold `--accent`) — a
linha do tempo virando interface.

| Slot | Item | O que abre |
|---|---|---|
| 1 | **Início** | "Agora no Concefor": agora / a seguir, banner "não perca", avisos da organização, dica do dia |
| 2 | **Agenda** | Programação completa (timeline com zoom), filtros por dia/eixo/sala, busca, "minha agenda" (favoritos) |
| 3 | **● Ao Vivo** | A sessão acontecendo agora: reações (e perguntas, quando existirem). Sem sessão ao vivo → próxima sessão com contagem regressiva |
| 4 | **Pessoas** | v1: palestrantes (bio/foto). Com login: participantes com busca, **meu QR** (cartão de visita) e contatos salvos |
| 5 | **Mais** | Informações (local + mapa, alimentação, o que fazer ao redor), sobre os 20 anos, certificados (link Even3), fale com a organização |

Regras de interface (tokens do design system, nada de cor solta):

- Item ativo = **pílula preenchida com label sempre visível** (`--surface-2` + `--cyan`),
  como no EDEN. O "Ao Vivo" pulsa discretamente quando há sessão `live`
  (respeitar `prefers-reduced-motion`).
- Topbar continua: selo branco + borda gradiente do selo; quando o login existir, o
  **avatar/inicial do participante** entra no canto direito.
- Se há **mais de uma sessão simultânea** ao vivo, o "Ao Vivo" abre um seletor simples
  (lista das salas) — resolve a questão de design em aberto do §8 sem teorizar.
- O **Telão** segue fora da navegação (`/telao`, URL própria).
- `/admin` também fora da navegação, protegido por token.

### 4.1 Programação viva + "agora / depois"

- Telas: **Agora** (sessões em andamento), **A seguir**, e **grade/linha do tempo** completa.
- Filtro por **eixo** e **sala**. Busca por título/palestrante.
- Detalhe da sessão (descrição, sala, horário, palestrante).
- **Navegação por timeline com zoom** (interação tipo componente de calendário): rola pra cima/baixo,
  marcador "você está aqui / presente" (passado pra trás, próximo chegando), e zoom in/out por nível
  de tempo (dia → hora → ~10 min). No zoom-out dá pra ver a linha inteira dos 4 dias e saltar pro
  ponto que importa. Layout espinha-dorsal: a linha oficial (sessões/sistema) de um lado, e (quando
  houver reações na fase de telão) o engajamento do público do outro — uma curva ajuda a achar os picos.
- **Favoritar sessões / "minha programação"**: a programação oficial vem por padrão; o participante
  marca favoritos e o app monta a linha do tempo pessoal dele. **Banner "não perca"**: avisa quando
  uma sessão favoritada está chegando (ex.: falta ~1h). Tudo **anônimo, no dispositivo** (localStorage
  por `client_id`) — sem login, sem PII. É o "o que ele leva pra casa".
- Fonte dos dados: tabela `sessions`, **sincronizada da API do Even3** (`session/getschedule`
  — a programação oficial já está lá, 4 dias; deduplicar por `id_session`, ver
  `contexto/even3/api.md`). A planilha manual morreu.
- **Sem login** para navegar.

### 4.2 Reações ao vivo no telão

- Na tela da sessão em andamento, botões de **reação pré-definida** (ex.: ❤️ 👏 👍 — sem
  texto livre). Toque grava um `timeline_events(tipo='reaction')` e publica no canal de
  tempo real (SSE) da sessão.
- **No piloto e por padrão: anônimo** (`client_id`). O login pelo crachá (barreira só para
  interagir) entra pós-piloto — ver §8 e `decisoes.md` 2026-07-06.
- **Modo telão** (`/telao` ou `/telao/[sessionId]`): tela grande projetada que **agrega e anima**
  as reações em tempo real. Direção visual: um **"batimento cardíaco"** — uma linha que corre e dá
  um pulso a cada reação (inspiração nas reações ao vivo do LinkedIn). Roda em navegador num PC
  ligado ao projetor; pode haver **mais de uma tela** (palco + TVs laterais). O telão **sai da
  navegação do app** (URL própria, não listada).
- **Identidade anônima consistente:** cada `client_id` ganha um avatar/cor estável (estilo "animal"
  anônimo do Google Docs) — dá personalidade às reações sem coletar PII.
- Anti-flood simples: throttle por `client_id` (ex.: máx N reações/segundo).
- **Fallback físico:** se a rede do evento falhar, plaquinhas (joinha/coração) impressas garantem
  o momento "festa" sem depender do app. Registrar o fallback no roteiro do evento.

## 5. Requisito fixo: dashboard / relatório

- **Dashboard ao vivo (admin):** reações por sessão, reações por minuto (picos de engajamento),
  total de dispositivos ativos, check-ins (se houver).
- **Admin da programação:** editar sessões (horário, sala, ordem) para absorver **atrasos e
  trocas de última hora** — necessidade levantada em 02/07. Proteção simples (senha/token de
  admin); não precisa de gestão de usuários.
- **Relatório pós-evento:** gerado a partir de `timeline_events` — ranking de sessões por
  engajamento, linha do tempo do evento, destaques escolhidos pelo próprio público (as sessões/
  momentos com mais reação). Exportável (PDF/print). Sem trabalho manual: é só ler a tabela.
- Visualizações simples (barras/linha). Não precisa de BI; um punhado de gráficos resolve.

## 6. Infra & deploy

- App `output: standalone` + `Dockerfile` → roda em servidor do Cefor (ou notebook na rede
  do evento, para piloto/fallback).
- Dados em **SQLite** (arquivo local + volume no Docker). Backup = copiar o arquivo.
  Supabase/Postgres é opção futura via interface `lib/db`.
- **IA local do Cefor:** documentada como recurso disponível (endpoint interno em `.env`), **não
  usada no v1**. Habilita fase 2 sem custo por token. Qualquer IA externa entra com hard-cap.
- `.env.example` lista: `DATABASE_PATH` (arquivo SQLite), `ADMIN_TOKEN` (área admin),
  `LOCAL_AI_ENDPOINT` (comentado). Variáveis do Supabase saem quando a migração completar.

## 7. Identidade

Selo dos 20 anos como base visual (malha de quadradinhos → boa para a linha do tempo como rede).
Assets ainda chegando — ver `contexto/identidade-selo.md`. Não bloqueia o build (começar com
placeholder e trocar depois).

## 8. Pós-piloto (dentro do v1) e backlog fase 2

**Pós-piloto, antes do evento** (decisões de 06/07, atualizadas em 16/07 — ver `decisoes.md`):

- **Login pelo crachá para interagir:** navegar segue aberto; reagir/perguntar passa a exigir
  identificação — QR do crachá Even3 ou digitação do nº do ingresso. **Confirmado pela API em
  16/07:** o nº do ingresso é o campo `checkin_code` (8 dígitos) dos inscritos, então o login
  casa direto com o sync do Even3, sem export manual. Segundo fator: **data de nascimento caiu**
  (o cadastro não coleta) — restam **CPF parcial** ou e-mail (decidir; ver
  `contexto/even3/README.md`). Exige tela de **consentimento LGPD** clara na entrada; quem não
  aceita continua na parte pública. Associa o `client_id` ao inscrito.
- **Perguntas com upvote:** texto curto com limite de caracteres, janela de tempo controlada
  pelo admin (abre/fecha), visíveis a todos, mais votadas no topo, autor oculto no app. A Márcia
  validou a ideia com entusiasmo em 16/07 — sobe de stretch para **planejada**, mas continua
  sendo a primeira coisa a cortar se o caminho crítico apertar.
- **Candidatas para a semana do evento** (só com login + lançamento sólidos; nesta ordem):
  **avisos da organização** no Início (mão única, sem chat) · **dica do dia** (alimentação/
  arredores — conteúdo da Márcia) · **networking por QR do crachá** (aponta o scanner do app
  pro crachá do outro → salva contato; sem chat interno — ver benchmark EDEN, o que NÃO
  levamos) · **gamificação leve** (QR codes espalhados → badges, contextuais ao conteúdo).

**Backlog fase 2:** anotação colaborativa → resumo automático · transcrição em tempo
real (mic da mesa de som → IA local) · **motor de vídeo-destaques** (casar transcrição com picos
de reação → resumos/nuvem de palavras/melhores momentos; alimenta notícias pós-evento) ·
networking por QR do crachá (benchmark: app do evento EDEN — contatos, envio de arquivos,
disponível 1 ano; ver `contexto/reunioes/sintese-2026-07-02.md`) · **material do palestrante
por sessão** (slides/links + resumo de IA) · fórum por palestra (exige moderação) · avatar
IA a partir de foto · gamificação (QR codes escondidos → figurinhas) · AR/Easter eggs ·
espaço instagramável · animações Remotion em tempo real (tela lateral com frases + reações
na identidade dos 20 anos) · mosaico/grafo nos quadradinhos do selo. Justificativas em
`contexto/brainstorm/sintese-ideias.md`. Vários são destravados pela IA local.

Ainda da conversa de 25/06 (Marquito + Elton):

- **Parede de insights via IA local:** mais que transcrição crua — a IA gera frases/insights do que
  está rolando na palestra (fala + reações + comentários) numa tela secundária. Posts público/
  privado (começar só público); moderação de palavrão pela IA local (block). Pode casar com as
  animações Remotion na TV (animação + frase que "entrou" na plataforma).
- **QR codes físicos como reações:** QR espalhados pelo evento que já *são* uma reação ("todo meu
  amor", "meu respeito") e caem na mesma timeline — reagir fora do app. Vizinho dos **Easter eggs**
  (achar QR → emblema).
- **Questão de design em aberto:** como representar **sessões simultâneas** (várias salas no mesmo
  instante) na timeline — várias "raias" no mesmo tempo. Decisão adiada de propósito: começar simples
  e entender com o **primeiro protótipo** rodando, em vez de teorizar agora.

## 9. Cronograma macro (revisado em 16/07 — datas duras acordadas com a Márcia; plano detalhado em `proximos-passos.md`)

| Semana | Marco |
|---|---|
| ✅ 25/06–05/07 | Scaffold, identidade visual, linha do tempo viva, favoritos, demo |
| ✅ 06–15/07 | Migração p/ SQLite + reações + SSE + telão v0 · primeira demo pra Márcia (16/07) |
| 16–19/07 | **Reformulação da interface (barra inferior + Ao Vivo)** · sync Even3 (programação real) |
| 20–26/07 | Dashboard admin mínimo · perguntas com upvote · **deploy em endereço estável (TI)** |
| 27/07–02/08 | **30/07, 10h: validação com a comissão** · ajustes do feedback |
| 03–09/08 | Login pelo crachá + consentimento LGPD · PWA/offline · **07/08: lançamento por e-mail aos inscritos** |
| 10–16/08 | Congelamento: admin de horários, relatório, ensaio de telão, fallback físico impresso |
| 17–20/08 | Evento (começa 17/08 à noite) — operação + candidatas do §8 se couberem; relatório fechado logo após |

## 10. Riscos

- **Rede do evento instável** → fallback físico das reações; PWA com cache offline da programação;
  com self-host na rede local do Cefor, o app sobrevive a queda de internet (só precisa da LAN).
- **Fricção do login pelo crachá** (achar o nº do ingresso é difícil fora do crachá físico) →
  QR scanner no app + liberar o app antes do evento; segundo fator a validar no Even3.
- **Programação muda em cima da hora** → `sessions` editável; importação simples (planilha → seed).
- **Escopo inflar** → a régua: só entra no v1 o que está na seção 4–5. O resto é fase 2, por escrito.

# Spec — App do VIII Concefor (v1)

Especificação do app do evento. Serve de handoff para o build em `app/`.

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
  (`output: standalone`).
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
- Fonte dos dados: tabela `sessions` (importada da programação oficial — ver `links.md`).
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

**Pós-piloto, antes do evento** (decisões de 06/07 — ver `decisoes.md`):

- **Login pelo crachá para interagir:** navegar segue aberto; reagir/perguntar passa a exigir
  identificação — QR do crachá Even3 (que codifica o **nº do ingresso**, 8 dígitos) ou digitação
  do número, + um segundo fator do cadastro (data de nascimento? CPF? **a confirmar** — ver
  `contexto/even3/README.md`). Exige tela de **consentimento LGPD** clara na entrada; quem não
  aceita continua na parte pública. Associa o `client_id` ao inscrito.
- **Perguntas com upvote (stretch goal):** texto curto com limite de caracteres, janela de
  tempo controlada pelo admin (abre/fecha), visíveis a todos, mais votadas no topo, autor
  oculto no app. Só entra se reações + telão + dashboard estiverem sólidos.

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

## 9. Cronograma macro (revisado em 06/07 — plano detalhado em `proximos-passos.md`)

| Semana | Marco |
|---|---|
| ✅ 25/06–05/07 | Scaffold, identidade visual, linha do tempo viva, favoritos, demo |
| 06–12/07 | **Migração p/ SQLite + reações + SSE + telão v0** (núcleo do piloto) |
| 13–19/07 | Dashboard admin mínimo · **piloto na reunião da comissão** (data a confirmar) |
| 20–26/07 | Ajustes do piloto · perguntas com upvote (stretch) · programação oficial importada |
| 27/07–02/08 | Login pelo crachá + consentimento LGPD · admin de horários |
| 03–09/08 | PWA/offline · relatório final · polimento visual · deploy no Cefor definido |
| 10–16/08 | Congelamento: conteúdo final, ensaio de telão, fallback físico impresso |
| 17–20/08 | Evento (começa 17/08 à noite) — operação + coleta; relatório fechado logo após |

## 10. Riscos

- **Rede do evento instável** → fallback físico das reações; PWA com cache offline da programação;
  com self-host na rede local do Cefor, o app sobrevive a queda de internet (só precisa da LAN).
- **Fricção do login pelo crachá** (achar o nº do ingresso é difícil fora do crachá físico) →
  QR scanner no app + liberar o app antes do evento; segundo fator a validar no Even3.
- **Programação muda em cima da hora** → `sessions` editável; importação simples (planilha → seed).
- **Escopo inflar** → a régua: só entra no v1 o que está na seção 4–5. O resto é fase 2, por escrito.

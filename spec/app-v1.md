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
- **Backend/dados:** **Supabase** — Postgres + **Realtime** (canal das reações e do telão) +
  (opcional v1) Auth anônima.
- **Deploy:** Vercel (Root Directory = `app/`) **ou** self-host no Cefor (Docker). App
  auto-contido (`output: standalone`).
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

- Na tela da sessão em andamento, botões de **reação** (ex.: ❤️ 👏 👍). Toque grava um
  `timeline_events(tipo='reaction')` e publica no canal Realtime da sessão.
- **Modo telão** (`/telao` ou `/telao/[sessionId]`): tela grande projetada que **agrega e anima**
  as reações em tempo real. Direção visual: um **"batimento cardíaco"** — uma linha que corre e dá
  um pulso a cada reação (inspiração nas reações ao vivo do LinkedIn). Roda em navegador num PC
  ligado ao projetor; pode haver **mais de uma tela** (palco + TVs laterais).
- **Identidade anônima consistente:** cada `client_id` ganha um avatar/cor estável (estilo "animal"
  anônimo do Google Docs) — dá personalidade às reações sem coletar PII.
- Anti-flood simples: throttle por `client_id` (ex.: máx N reações/segundo).
- **Fallback físico:** se a rede do evento falhar, plaquinhas (joinha/coração) impressas garantem
  o momento "festa" sem depender do app. Registrar o fallback no roteiro do evento.

## 5. Requisito fixo: dashboard / relatório

- **Dashboard ao vivo (admin):** reações por sessão, reações por minuto (picos de engajamento),
  total de dispositivos ativos, check-ins (se houver).
- **Relatório pós-evento:** gerado a partir de `timeline_events` — ranking de sessões por
  engajamento, linha do tempo do evento, destaques escolhidos pelo próprio público (as sessões/
  momentos com mais reação). Exportável (PDF/print). Sem trabalho manual: é só ler a tabela.
- Visualizações simples (barras/linha). Não precisa de BI; um punhado de gráficos resolve.

## 6. Infra & deploy

- App `output: standalone` + `Dockerfile` → roda no Vercel ou em servidor do Cefor.
- Supabase cloud no v1 (self-host é opção futura).
- **IA local do Cefor:** documentada como recurso disponível (endpoint interno em `.env`), **não
  usada no v1**. Habilita fase 2 sem custo por token. Qualquer IA externa entra com hard-cap.
- `.env.example` lista: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `LOCAL_AI_ENDPOINT` (comentado).

## 7. Identidade

Selo dos 20 anos como base visual (malha de quadradinhos → boa para a linha do tempo como rede).
Assets ainda chegando — ver `contexto/identidade-selo.md`. Não bloqueia o build (começar com
placeholder e trocar depois).

## 8. Backlog fase 2

Perguntas com upvote + filtro · anotação colaborativa → resumo automático · transcrição em tempo
real · networking por QR do crachá · gamificação (pontos/emblemas) · AR/Easter eggs · espaço
instagramável (foto na timeline) · animações Remotion em tempo real · mosaico/grafo nos
quadradinhos do selo. Justificativas em `contexto/brainstorm/sintese-ideias.md`. Vários são
destravados pela IA local.

Novidades da conversa de 25/06 (Marquito + Elton):

- **Identidade via plataforma de inscrição** (**Even3** — ver `links.md`): puxar a lista de inscritos
  pela API do Even3 e permitir associar o `client_id` ao ID do inscrito via **QR do crachá + e-mail**
  (login/check-in). Destrava "quem está no evento", timeline pessoal identificada e o networking.
  **Fica fase 2** — v1 segue 100% anônimo (ver `decisoes.md` 25/06). Envolve LGPD.
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

## 9. Cronograma macro (até 17/08)

| Semana | Marco |
|---|---|
| 1 (jun/jul) | Scaffold pronto, Supabase criado, esquema aplicado |
| 2 | Programação importada + telas Agora/A seguir/grade |
| 3 | Reações + canal Realtime + modo telão |
| 4 | Dashboard ao vivo + esqueleto do relatório |
| 5 | **Piloto interno** no conselho de gestão do Cefor (testar reações e, se der, perguntas) |
| 6 | Ajustes do piloto, identidade do selo, fallback físico definido |
| 7 | Polimento, conteúdo da programação final, ensaio de telão |
| Evento | 17–20/08 — operação + coleta; relatório fechado logo após |

## 10. Riscos

- **Rede do evento instável** → fallback físico das reações; PWA com cache offline da programação.
- **Programação muda em cima da hora** → `sessions` editável; importação simples (planilha → seed).
- **Escopo inflar** → a régua: só entra no v1 o que está na seção 4–5. O resto é fase 2, por escrito.

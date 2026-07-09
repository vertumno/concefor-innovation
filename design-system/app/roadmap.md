# Roadmap visual — linha do tempo & reações

Ideias levantadas pelo Marquito (26/06/2026) para evoluir a linha do tempo e plugar as
reações ao vivo. Quase tudo é **semana 3** (junto com a feature de reações). Anotado aqui
pra não perder.

## Reações na linha do tempo (semana 3 / E3) — parcialmente feito

**Feito:**
- **Telão "batimento cardíaco"** (`/telao`): linha ECG em canvas que pulsa a cada reação
  (cyan → vermelho nos picos), contadores por tipo e emojis subindo com a cor do avatar
  anônimo de cada dispositivo. Alimentado por SSE (`/api/live/[sessionId]`).
- **Na tela da sessão**: as reações (suas e as de outras pessoas, detectadas no polling)
  fazem o emoji "voar" — a mesma energia do telão, na palma da mão.
- Reações fecharam em **5**, com emoji **+ rótulo em texto**: Adorei ❤️, Parabéns 👏,
  Uau! 🤩, Nossa! 😮, Que triste 😢 (fonte única em `app/src/lib/reactions.ts`).

**Ainda em aberto** (a decidir depois do piloto — liga com o "zoom-out" abaixo):
- **Bolinha que cresce / anéis** no nó da sessão na *lista* da timeline (exige contagem
  por sessão na lista — mais polling; adiar).
- **Onda lateral** de intensidade ao longo do tempo (é a "onda de interações" da visão macro).

## Transição "fenda temporal"

Sensação de "entrar no evento" ao abrir uma sessão.

- **Entrada (feito, sutil)** — o conteúdo da sessão afunila/zoom-in (`.sessao-enter`).
- **A fazer** — a volta (zoom-out) e uma transição de elemento compartilhado (o nó → hero).
  Avaliar a View Transitions API quando estável no Next.

## Visão "zoom-out" da timeline (semana 3+)

- Botão para ver a **linha do tempo inteira** num nível em que cada evento vira um ponto.
- Sobre ela, uma **onda de interações** ao longo do tempo (liga com as reações).
- Espaço para outras informações na visão macro da linha do tempo.

## Palestrantes

- Modelo já estruturado (`Speaker`, com `bio`/`foto` prontos). Enriquecer com bio/foto reais
  quando o conteúdo chegar e desenhar um card de palestrante mais rico.

## Navegação

- O **Telão** sai da navegação do app (responde em **outra URL** própria). Mantido na nav só
  por ora. A aba **Informações** (local, hospedagem, alimentação) já entrou no lugar previsto.

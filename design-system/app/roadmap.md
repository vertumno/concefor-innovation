# Roadmap visual — linha do tempo & reações

Ideias levantadas pelo Marquito (26/06/2026) para evoluir a linha do tempo e plugar as
reações ao vivo. Quase tudo é **semana 3** (junto com a feature de reações). Anotado aqui
pra não perder.

## Reações na linha do tempo (semana 3)

Como as reações ao vivo aparecem na própria timeline — opções a explorar:

- **Bolinha que cresce** — o nó da sessão aumenta de tamanho conforme recebe reações.
- **Anéis / camadas** — anéis concêntricos em volta do nó; mais reações, mais anéis.
- **Onda lateral** — um gráfico de onda ao lado da linha do tempo, com a intensidade de
  interações ao longo do tempo (picos nos momentos quentes).

Decidir qual (ou combinação) quando a feature de reações (spec §4.2) entrar.

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

# Síntese do brainstorm — passando a régua nas ideias

Curadoria do brainstorm de **13/05/2026** (Marquito, Elton, Andréia) — transcrição em
`brainstorm-13-05-2026.txt`. Aqui as ~15 ideias estão classificadas em **v1**, **fase 2** ou
**descartado/repensar**, com o motivo. A régua é o princípio do projeto: *simples que causa*.

## O conceito que amarra tudo

Várias ideias convergiram para uma só espinha, levantada pelo próprio Marquito: a **linha do
tempo / passagem do tempo**. Combina com o tema dos 20 anos (passado→presente→futuro) e dá uma
arquitetura técnica elegante: **tudo que acontece tem timestamp e se conecta**. Programação,
reações, fotos, perguntas — tudo é registro datado na mesma linha. App, telão e relatório saem
do mesmo lugar. É também o que o participante leva pra casa (a linha do tempo pessoal dele).

## v1 — entra agora

| Ideia | Por que entra |
|---|---|
| **Programação viva + "agora/depois"** | Resolve a dor universal de evento (que horas são, onde estou, o que vem). Baixo esforço, alto valor. É a própria espinha da timeline. |
| **Reações ao vivo no telão** (joinha/coração) | O momento "festa". As pessoas se veem participando (estilo MIT/Instagram/estádio). Simples via Realtime; cada reação é um ponto na linha do tempo. |
| **Dashboard / relatório final** | Requisito fixo do projeto. Cai de graça do modelo de dados: engajamento por sessão, picos, presença. Vira o entregável que justifica o app para a comissão. |

## Fase 2 — boas ideias, depois (várias destravadas pela IA local do Cefor)

| Ideia | Por que esperar |
|---|---|
| **Perguntas às palestras com upvote anônimo + filtro** | Ótima (mata pergunta redundante, estilo Slido), mas pede curadoria/filtro de má-intenção. Vale testar antes no conselho de gestão do Cefor. Filtro pode usar a IA local. |
| **Anotação colaborativa → resumo/PDF automático** | É o diferencial (já fizeram no e-Saúde), mas depende de moderação e de geração de resumo. Forte candidata a usar a IA local. |
| **Transcrição em tempo real das palestras** | Rico, mas precisa de áudio limpo e processamento. IA local viabiliza sem custo por token. |
| **Networking por QR do crachá** (trocar contato com autorização; "vocês interagiram nos mesmos momentos") | Muito desejado em evento, mas envolve LGPD e consentimento. Merece desenho próprio. |
| **Gamificação** (pontos, emblemas) | Camada por cima da timeline (tudo que entra é pontuável). Adia-se sem perder nada do v1. |
| **AR / Easter eggs / mini-games** (marcadores físicos → interação no app) | Alto encanto, alto esforço. Depois. |
| **Espaço instagramável com câmera própria** (foto entra na timeline) | Bom, mas é hardware + curadoria. Pode começar como hashtag puxando do Instagram. |
| **Animações Remotion em tempo real** (interações do público entram na animação) | Track paralelo já em prototipagem (ver `contexto/identidade-selo.md`). Integra no app em fase 2. |
| **Mosaico/grafo de assuntos e fotos nos quadradinhos do selo** | Visualização linda da timeline como rede 3D. Depois do básico funcionando. |

## Descartado / repensar

| Ideia | Motivo |
|---|---|
| **Interfaces tangíveis** (Makey Makey, "piano de banana", parede interativa hackeada) | Nostálgico e divertido, mas é instalação física à parte — não é app. Se rolar, é estande, não software. |
| **Livro do Cefor interativo na TV** (palavra-chave → trecho) | Legal como instalação no estande (e temos o `livro-completo.md`), mas fora do escopo do app. |
| **Óculos VR / experiência de meditação (qualidade de vida)** | Track totalmente separado (a "travessa" da Rute). Não é o app do evento. |
| **Puxar Stories do Instagram para um "story gigante" no telão** | Curadoria do que entra é arriscada. Versão segura = hashtag puxando do perfil de cada pessoa, e mesmo assim é fase 2. |

## Dores operacionais registradas (não são features, mas pautas)

- **"Onde está o cérebro?"** → resolvido por este repo + `links.md`.
- **Sincronizar trabalho da equipe** (máquina ↔ GitHub ↔ Drive) → definir fluxo; o cérebro aponta, não hospeda tudo.

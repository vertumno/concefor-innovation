# Spec: Enquete ao Vivo com Nuvem de Palavras

**Para:** Marquito (Desenvolvedor e Coordenador da CGTE)
**De:** Elton Vinicius Silva
**Data:** 06/08/2026
**Status:** Escopo definido, pendências listadas na seção 9

---

## 1. Resumo executivo

Nova funcionalidade no app: enquete ao vivo com **perguntas exclusivamente abertas**. O público responde pelo celular, em campo de texto livre, e o resultado agregado é projetado no telão em dois modos alternáveis: **nuvem de palavras** ou **lista de respostas**.

**Valor:** transforma plateia em participante durante sessões presenciais e híbridas, gerando insumo qualitativo imediato para a condução da fala e, depois do evento, material de relatório.

**Complexidade estimada:** média. O núcleo (coleta + agregação + projeção) é simples. O custo real está na atualização em tempo real e na moderação.

---

## 2. Fluxo geral

```
[ADMIN]                    [PÚBLICO / CELULAR]              [TELÃO]
   │                              │                            │
   ├─ cria a pergunta             │                            │
   ├─ ativa a enquete ───────────►│                            │
   │                        lê a pergunta                      │
   │                        digita (máx. 150 caract.)          │
   │                        envia ──────────┐                  │
   │                        pode enviar     │                  │
   │                        de novo ────────┤                  │
   │                                        ▼                  │
   │                                [respostas agregadas]      │
   │                                        └────────────────► │
   │                                              pergunta +   │
   ├─ alterna visualização ──────────────────────────────────► │
   │   (nuvem  ⇄  lista)                    atualização ao vivo │
   ├─ encerra a enquete ─────────────────────────────────────► │
   │                                          resultado final  │
```

---

## 3. Componentes

| Componente | Onde roda | Responsabilidade |
|---|---|---|
| **Painel de controle** | App, perfil admin | Criar pergunta, ativar, encerrar, alternar modo de exibição |
| **Tela de resposta** | Celular do participante | Exibir enunciado, campo de texto livre, contador de caracteres, envio |
| **Projeção** | Telão (view dedicada) | Exibir pergunta e resultado em nuvem ou lista |

---

## 4. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | A enquete aceita **somente perguntas abertas**. Nenhuma alternativa fechada, múltipla escolha, escala ou sim/não. | Obrigatório |
| RF02 | O participante responde por campo de **texto livre**. | Obrigatório |
| RF03 | O telão oferece **dois modos de visualização**: nuvem de palavras e lista de respostas, alternáveis pelo admin. | Obrigatório |
| RF04 | A pergunta aparece **nos dois lados**: no celular (para responder) e no telão (para contextualizar). | Obrigatório |
| RF05 | Cada participante pode enviar **várias respostas** à mesma pergunta, sem limite fixo. | Obrigatório |
| RF06 | O campo aceita no máximo **150 caracteres**, com bloqueio na digitação e contador visível. | Obrigatório |
| RF07 | O telão **atualiza automaticamente** conforme chegam respostas. | Desejável |
| RF08 | O admin pode **encerrar** a enquete, congelando o resultado no telão. | Obrigatório |

---

## 5. Detalhamento das telas

### 5.1 Celular do participante

```
┌──────────────────────────────┐
│  ENQUETE                     │
│                              │
│  O que a IA não deve         │
│  substituir na evangelização?│
│                              │
│  ┌────────────────────────┐  │
│  │ o afeto e a escuta_    │  │
│  │                        │  │
│  └────────────────────────┘  │
│                     18/150   │
│                              │
│  [        ENVIAR         ]   │
│                              │
│  Você já enviou 2 respostas  │
└──────────────────────────────┘
```

Comportamento:
- Contador em tempo real, formato `18/150`.
- Bloqueio na digitação ao atingir 150. **Não** validar só no envio.
- Após enviar, o campo limpa e continua disponível para nova resposta (RF05).
- Feedback visual de confirmação do envio.
- Se a enquete estiver encerrada, o campo fica desabilitado com aviso claro.

### 5.2 Telão

```
┌─────────────────────────────┐   ┌─────────────────────────────┐
│  MODO NUVEM                 │   │  MODO LISTA                 │
│                             │   │                             │
│      afeto                  │   │  "o afeto não se automatiza"│
│   tecnologia   ESCUTA       │   │  "escuta ativa é insubst."  │
│      medo   futuro          │   │  "tenho medo do futuro"     │
│         cuidado             │   │  "cuidado com as crianças"  │
│                             │   │           ⋮ (rolagem)       │
│  Palavras repetidas         │   │  Respostas na íntegra,      │
│  aparecem maiores           │   │  mais recentes no topo      │
└─────────────────────────────┘   └─────────────────────────────┘
```

**Modo nuvem**
- Agrega por frequência de palavra.
- Ignora *stopwords* do português (de, a, o, que, para, com, em, um, uma, os, as, do, da, no, na, e, é, etc.). Lista de stopwords deve ser configurável, não hardcoded.
- Normalização: minúsculas e remoção de pontuação antes da contagem. **Manter acentuação.**
- Tamanho da fonte proporcional à frequência, com teto e piso definidos para não quebrar o layout.

**Modo lista**
- Mostra a resposta completa, sem cortar.
- Ordenação padrão: mais recentes no topo.
- Rolagem automática ou paginação quando o volume passar da tela.

**Regras comuns aos dois modos**
- Mesma base de respostas. A troca de modo é apenas de renderização, **não** recoleta nem reprocessa nada no servidor.
- Alternância manual pelo admin, por botão.
- A pergunta permanece fixa no topo do telão nos dois modos.
- Layout pensado para projeção: alto contraste, tipografia grande, legível do fundo da sala.

### 5.3 Painel do admin

| Ação | Efeito |
|---|---|
| Criar pergunta | Cadastra o enunciado da enquete |
| Ativar | Libera o campo de resposta nos celulares |
| Alternar modo | Troca a projeção entre nuvem e lista |
| Encerrar | Bloqueia novos envios e congela o resultado |

---

## 6. Atualização em tempo real (RF07)

Implementar por níveis. O nível 1 já entrega a experiência esperada.

| Nível | Comportamento | Técnica | Custo |
|---|---|---|---|
| **1. Mínimo aceitável** | Telão atualiza a cada N segundos | Polling | Baixo |
| **2. Desejável** | Resposta entra na tela assim que chega | WebSocket / SSE | Médio |
| **3. Extra** | Animação de entrada da palavra nova | Front-end | Alto |

**Recomendação:** entregar o nível 1 na primeira versão e evoluir para o nível 2 se houver folga. O nível 3 é enfeite, não requisito. A ausência de tempo real **não** bloqueia o uso da funcionalidade.

---

## 7. Regras de negócio consolidadas

1. Pergunta sempre aberta. Não existe caminho no sistema que gere alternativa fechada.
2. Limite rígido de 150 caracteres por resposta.
3. Múltiplas respostas por participante são permitidas e esperadas.
4. Resposta vazia ou só com espaços é rejeitada.
5. Encerrar a enquete é irreversível dentro da sessão.
6. As duas visualizações consomem exatamente a mesma base de dados.

---

## 8. Requisitos não funcionais

| Área | Requisito |
|---|---|
| **Desempenho** | Suportar o volume de uma plateia de evento respondendo simultaneamente, com envios múltiplos por pessoa |
| **Legibilidade** | Telão legível a distância, contraste adequado para projeção em sala com luz |
| **Resiliência** | Queda de conexão do celular não pode perder a resposta já digitada |
| **Acessibilidade** | Contraste e tamanho de fonte adequados no celular; campo com rótulo semântico |
| **Institucional** | Seguir o design system institucional em uso na CGTE |

---

## 9. Pendências a decidir

Estas decisões precisam ser fechadas antes do início do desenvolvimento. A primeira é a mais crítica.

| # | Pendência | Por que importa | Quem decide |
|---|---|---|---|
| 1 | **Moderação antes da palavra subir no telão?** | Enquete aberta, com múltiplos envios por pessoa e sem alternativa fechada, tem risco real de conteúdo impróprio projetado em evento institucional. Opções: sem moderação, filtro automático de palavrão, ou fila de aprovação do admin. | Coordenação + Elton |
| 2 | **Como o público entra na enquete** | Define o atrito de entrada. QR Code, código da sessão ou usuário já logado no app. Impacta se dá para participar sem instalar nada. | Marquito + Elton |
| 3 | **Histórico salvo após o evento?** | Se sim, é preciso prever exportação das respostas como insumo de relatório. | Coordenação |
| 4 | **Uma enquete por vez ou várias na mesma sessão?** | Impacta a modelagem de dados e a navegação do painel do admin. | Marquito + Elton |
| 5 | **Identificação do respondente** | Anônimo ou vinculado ao usuário do app. Conversa direta com a pendência 1 e com a LGPD. | Coordenação |

---

## 10. Sugestão de entrega faseada

```
FASE 1 (MVP)                FASE 2                    FASE 3
├─ pergunta aberta          ├─ tempo real por         ├─ moderação com
├─ campo 150 caract.        │  websocket              │  fila de aprovação
├─ múltiplos envios         ├─ animação de entrada    ├─ exportação de
├─ nuvem de palavras        └─ múltiplas enquetes     │  resultados
├─ lista de respostas          por sessão             └─ histórico
├─ alternância de modo
└─ atualização por polling
```

A Fase 1 já é usável em evento real.

---

## 11. Créditos das definições

Requisitos revisados e complementados por **Rutinelli**, que trouxe: a necessidade do modo lista além da nuvem (RF03), a permissão de múltiplas respostas por participante (RF05), o limite de 150 caracteres (RF06) e a priorização flexível do tempo real (RF07).

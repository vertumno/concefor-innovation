# Painel de produção · status visual de todas as peças

Página HTML servida via **GitHub Pages** que mostra, num lugar só, a situação de cada peça de
comunicação do VIII Concefor. É a versão visual do
[board de produção](../planejamento/board-producao.md) — feita para abrir no celular numa reunião
e responder rápido "como estamos?".

## URL pública

https://vertumno.github.io/concefor-innovation/comunicacao/painel/

## O que o painel mostra

| Bloco | O que responde |
|---|---|
| Contagem regressiva | Quantos dias faltam para a abertura (calculada ao vivo, sozinha) |
| Barra de progresso + números | Quantas peças estão entregues, em aprovação, em produção, a fazer, bloqueadas |
| **Foco agora** | O que está atrasado, bloqueado ou vence nos próximos 7 dias |
| Próximos marcos | Envio à gráfica, amostras, prazos do Even3, lançamento do app, evento |
| Todas as peças | Cada peça com status, responsável, prazo, nota e link para a arte/brief |
| Aguardando de terceiros | O que está travado esperando Márcia, gráfica, Educimat, coordenação |

Filtros: clicar num número do resumo filtra por status; os chips filtram por fase; a busca varre
nome, nota e responsável. O botão **Por prazo** troca o agrupamento por fase para uma lista
cronológica (útil para enxergar a fila de trabalho).

## Como atualizar

Toda a informação vive num único lugar: a lista `PECAS` no início do `<script>` de
[`index.html`](index.html), entre os comentários `DADOS` e `FIM DOS DADOS`. Não há build nem
dependência: edite, faça commit, e o Pages republica em cerca de 1 minuto.

```js
{ nome:'Card palestrante · Fulano', fase:'pre', status:'aprovacao', resp:'Elton',
  prazo:'2026-08-04', prazoTx:'antes de 07/08',   // prazoTx é opcional (texto exibido)
  nota:'O que está pegando ou o que falta.',
  links:[{t:'Arte',u:'../producao/02-pre-evento/palestrantes/cards/arquivo.png'}] }
```

| Campo | Valores |
|---|---|
| `fase` | `impressao` · `pre` · `durante` · `pos` · `ideias` |
| `status` | `feito` · `aprovacao` · `producao` · `todo` · `bloqueado` · `pausado` |
| `prazo` | `'AAAA-MM-DD'` (alimenta o cálculo de atraso) ou `null` |
| `links[].u` | caminho começando com `../` abre o arquivo direto; caminho relativo a `comunicacao/` abre no GitHub (bom para `.md`) |

Também há as listas `MARCOS` (linha do tempo) e `AGUARDANDO` (pendências de terceiros), e a
constante `ATUALIZADO` com a data exibida no rodapé — atualize junto.

> O status de atraso é calculado pela data real de quem abre a página, então uma peça vencida
> aparece em vermelho no **Foco agora** sozinha, sem ninguém precisar marcar nada.

## Relação com os outros arquivos

- [`planejamento/board-producao.md`](../planejamento/board-producao.md) — fonte de verdade em
  texto, com o detalhamento e o histórico das decisões. O painel é o espelho visual dela.
- [`aprovacao/`](../aprovacao/) — páginas para o **cliente aprovar** artes. O painel é para a
  **equipe acompanhar** a produção. Coisas diferentes, públicos diferentes.

> ⚠️ O repositório é público, então o painel também é. Não colocar aqui nada que não possa ser
> visto por qualquer pessoa com o link.

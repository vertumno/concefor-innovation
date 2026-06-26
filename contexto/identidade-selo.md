# Identidade visual — selo 20 anos

> **Atualizado (26/06/2026).** Paleta, tipografia e regras oficiais já estão incorporadas como
> **design system** em [`design-system/`](../design-system/) — dois sistemas: **Concefor** (base do
> evento) e **selo 20 anos** (acento comemorativo). Este arquivo guarda o contexto/raciocínio; os
> tokens e specs visuais vivem lá. Falta ainda baixar o vetor do selo (ver `links.md`).

## Resumo da identidade (fonte oficial)

- **Selo 20 anos** — cores exatas do manual: magenta `#FF66CC`, azul `#3399CC`, verde `#3C9035`,
  cinza `#595C5A`; gradiente 45° (magenta 0% → azul 86% → verde 99%); tipografia Futura
  (substituta web: Jost). Conceito: diversidade, conexão, unicidade, tecnologia, crescimento.
  Slogan: *"20 anos de conexões que ampliam horizontes."*
- **Concefor** — gradiente oceano navy `#173B79` → teal `#0E8FA8` → ciano `#00C9C9`, acento âmbar
  `#F5B82E`; títulos em sans condensada (Oswald, inferido). É a base sóbria; o selo é o acento festivo.

Detalhes completos, tokens (`tokens.css`/`.json`) e preview visual: [`design-system/`](../design-system/).

## Selo dos 20 anos

O selo comemorativo dos 20 anos do Cefor é o elemento visual central da edição. No brainstorm
apareceu a ideia de que o selo é formado por **quadradinhos / retângulos** (uma malha/grade) — o
que abre espaço para usos generativos: nomes de pessoas, fotos e interações ocupando os
quadradinhos; mosaicos; rede de pontos (grafo) conectando assuntos.

O selo está sendo **destrinchado com o Claude** para entender sua estrutura e gerar **animações**.

## Animações (track paralelo, Remotion)

Marquito está prototipando um fluxo de **geração de animações a partir de texto/roteiro** usando
**Remotion** (software que roda no navegador; animações são código, dá para fazer em tempo real).
Fluxo testado:

1. Claude Code gera o roteiro/narração a partir de contexto (ex.: site do Cefor).
2. Remotion gera a animação a partir do roteiro (design system embutido, ajustável no código).
3. Grava-se o áudio por cima e renderiza — protótipo feito em ~10–15 min.

Potencial: vídeos para Instagram/YouTube, animações do selo passando no telão, e — como as
animações são código — **animações em tempo real** que reagem a interações do público
(palavras, comentários entrando na tela). Isso é **fase 2** do app, mas o track de animação roda
em paralelo desde já.

## A definir

- [ ] Receber e arquivar os arquivos do selo (vetor + variações)
- [ ] Paleta de cores e tipografia oficiais da edição
- [ ] Especificar a malha/grade do selo para uso generativo no app
- [ ] Banner do evento (dimensões mencionadas no brainstorm: ~90x12)

# Design System — VIII Concefor

Identidade visual deste projeto, com tokens prontos para o código.

| Sistema | Papel | Fonte |
|---|---|---|
| [**Concefor**](concefor/) | **Base** — governa o app | Banner oficial (cores amostradas) |
| [**Selo 20 anos**](selo-20-anos/) | **Acento** comemorativo | Manual de Identidade Visual (oficial) |
| [**App**](app/) | **Aplicação** — deriva das duas em tokens | `app/src/app/tokens.css` |

As duas primeiras são as **marcas** (referência). A terceira é como o **app** as traduz em tokens
reutilizáveis (tema escuro navy). Para remarcar o app, mexe-se só em `app/src/app/tokens.css`.

## A relação entre os dois

O app é do **evento**, então a marca **Concefor** (gradiente oceano navy→teal→ciano) é a base:
fundos, títulos, navegação, hierarquia. O **selo 20 anos** (gradiente vibrante magenta→azul→verde,
malha de pixels) entra como **acento** nos momentos comemorativos — abertura, marcos, o telão dos
20 anos. Concefor é a estrutura sóbria; o selo é a celebração pontual.

> Regra prática: se a tela é "trabalho do evento" → Concefor. Se é "celebração dos 20 anos" → selo.
> Evitar misturar os dois gradientes na mesma superfície (brigam por atenção).

## O que tem em cada pasta

- `README.md` — documentação (conceito, cores, tipografia, elementos, regras de uso)
- `tokens.css` — CSS custom properties prontas para `@import`
- `tokens.json` — os mesmos tokens em JSON, para consumo programático
- `preview.html` — demonstração visual self-contained (abrir no navegador)
- `assets/` — arquivos de origem (banner, manual)

## Como o app consome (já aplicado)

O app **não** importa estes tokens direto (precisa ser self-contained p/ deploy). Em vez disso,
ele os **espelha** em [`app/src/app/tokens.css`](../app/src/app/tokens.css) — ver [app/](app/).
O tema escuro navy já está no ar no código; foi aplicado em 26/06/2026.

## Pendências / a confirmar

- [ ] **Tipografia do Concefor**: títulos do banner são inferência (Oswald como substituta web).
      Confirmar com o arquivo-fonte do banner, se aparecer.
- [ ] **Verde-claro do selo** (`#A8D5A2`): amostrado, sem código oficial no manual.
- [x] ~~Baixar o vetor/PNG do selo~~ — recebido em `selo-20-anos/assets/logo-png/` (15 variações).
      Selo branco/colorido já em uso no app (`app/public/`).

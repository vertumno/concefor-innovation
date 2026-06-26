# Design System — App (PWA)

Como o app **traduz** as duas marcas em tokens reutilizáveis. Não é uma terceira marca: é a
camada de aplicação que deriva de [Concefor](../concefor/) (base) + [selo 20 anos](../selo-20-anos/)
(acento) e vira o tema concreto do PWA.

## Onde vivem os tokens

| Arquivo | Papel |
|---|---|
| [`app/src/app/tokens.css`](../../app/src/app/tokens.css) | **Fonte única do tema.** Para remarcar o app, mude aqui. |
| [`app/src/app/globals.css`](../../app/src/app/globals.css) | Só componentes — consomem tokens, sem cor/medida solta. |
| [`app/src/app/layout.tsx`](../../app/src/app/layout.tsx) | Carrega Oswald/Inter (`next/font`) → `--font-oswald` / `--font-inter`. |

> **Por que dentro de `app/` e não aqui?** O app precisa ser self-contained para build/deploy na
> Vercel. Os tokens espelham as marcas deste hub; este README é a ponte documental.

## Tema: escuro (navy)

O app roda no celular **durante palestras** e no telão. Fundo navy (`--bg`) cansa menos no escuro,
dá contraste pro gold de "agora" e é continuidade direta da base Concefor. O brilho teal no topo
(`--top-glow`) evoca horizonte/oceano.

## Camadas do `tokens.css`

1. **Referência** (`--brand-*`): valores brutos das marcas (navy, teal, gold, gradiente do selo).
2. **Semântico** (`--bg`, `--surface`, `--ink`, `--accent`…): o papel no app. **Componentes só usam estes.**
3. **Tipografia**: `--font-title` (Oswald) / `--font-text` (Inter) + escala `--text-*`.
4. **Forma/elevação/motion**: `--radius-*`, `--shadow-*`, `--transition-*`.

### Mapa token → origem

| Token semântico | Valor | Origem | Uso no app |
|---|---|---|---|
| `--bg` / `--bg-2` | `#102A5C` / `#173B79` | Concefor navy | Fundo da página |
| `--surface` / `--surface-2` | `#173F73` / `#1D4D86` | Concefor navy (elevado) | Cards, inputs, chips |
| `--ink` / `--ink-dim` | `#F4F8FF` / `#9FB6D6` | Neutros sobre navy | Texto |
| `--cyan` / `--cyan-300` | `#00C9C9` / `#00DDCA` | Concefor ciano | Foco, hover, links, marcador de dia |
| `--accent` | `#F5B82E` | Concefor gold | "O que importa agora": data, favorito, banner |
| `--selo-gradient` | magenta→azul→verde 45° | **Selo 20 anos** | Acento comemorativo (borda da topbar) |
| `--font-title` | Oswald | Concefor (inferido) | Títulos, nav, labels |
| `--font-text` | Inter | Concefor | Corpo, conteúdo |

## Como remarcar no futuro

- **Trocar o tema todo:** reaponte os tokens da camada *semântica* para outras referências.
- **Ajustar uma cor:** mude o `--brand-*` correspondente (propaga por herança).
- **Tema claro:** duplique a camada semântica sob `@media (prefers-color-scheme: light)` ou um
  `[data-theme="light"]`. A camada de referência e os componentes não mudam.

## O selo no app (regra do manual)

- **Topbar:** selo **branco** (`/public/selo-20-anos-branco.png`) — o manual manda versão
  monocromática sobre fundo colorido. Não distorcer: proporção real 1.367.
- **Ícone do PWA:** selo **colorido** sobre fundo branco (`/public/icon-512.png`) — versão colorida
  é restrita a fundo branco.
- **Borda superior da topbar:** o gradiente exato do selo (3px) — única superfície com o gradiente
  comemorativo, pra não brigar com a base Concefor.

## Componentes cobertos

Topbar/brand · nav · `page-title` · `section-label` (eyebrow) · `card` · `chip` · `star`
(favorito) · `banner` (CTA gold) · `filter-row` · `day-head` (marcador da linha do tempo) ·
`empty` · `notice`. Foco visível e `prefers-reduced-motion` respeitados.

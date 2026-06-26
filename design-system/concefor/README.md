# Design System — Marca Concefor

> Identidade **base** do evento. Governa o visual do app. O [selo 20 anos](../selo-20-anos/)
> entra como **acento** comemorativo sobre esta base.

**Fonte:** banner oficial do site ([`assets/banner.png`](assets/banner.png)), cores amostradas
por pixel. A tipografia é **inferida** do banner (ver ressalva abaixo) — a página do Concefor
não publica um manual de identidade.

![Banner Concefor](assets/banner.png)

## Conceito

O evento é o **VIII Concefor** — *"Tecnologia, Transformação e Educação a Distância: 20 anos
construindo novos cenários educacionais"* (17–20 de agosto de 2026, Cefor/Ifes, Vitória-ES).
A marca traduz isso num **gradiente oceano**: do navy profundo ao ciano luminoso — profundidade
institucional que abre para horizonte e tecnologia. É sóbria onde o selo é festivo.

## Cores

| Token | Hex | Papel |
|---|---|---|
| `--cf-navy-900` | `#102A5C` | Fundo mais profundo |
| `--cf-navy-800` | `#173B79` | **Navy primário** — base, títulos |
| `--cf-blue-600` | `#1E5A8C` | Azul de transição |
| `--cf-teal-500` | `#0E8FA8` | Teal |
| `--cf-cyan-400` | `#00C9C9` | Ciano |
| `--cf-cyan-300` | `#00DDCA` | Ponta luminosa do gradiente |
| `--cf-gold` | `#F5B82E` | **Acento** — datas, CTA |
| `--cf-white` | `#FFFFFF` | Texto sobre fundo escuro |
| `--cf-ink` | `#0E2240` | Texto sobre fundo claro |
| `--cf-paper` | `#F4F7FB` | Superfície clara |

**Mosaico festivo** (cubos do logo, uso pontual): lime `#7AB51D` · magenta `#D6004B` ·
ciano `#0AB4C4` · chartreuse `#C9D400`.

### Gradiente assinatura

```css
background: linear-gradient(135deg, #102A5C 0%, #173B79 28%, #1E5A8C 52%, #0E8FA8 78%, #00C9C9 100%);
```

Sempre escuro → claro quando houver texto branco por cima (garante contraste no canto navy).

## Tipografia

> **Ressalva:** a fonte exata dos títulos do banner não está documentada. Por análise visual é
> uma sans **bold, caixa-alta, levemente condensada** → adotamos **Oswald** (Google Fonts) como
> substituta web. Se o arquivo-fonte do banner aparecer, confirmamos e ajustamos.

- **Display / títulos:** `Oswald` — bold, UPPERCASE, `letter-spacing: 0.01em`
- **Corpo:** `Inter` — neutra, legível em telas

Escala: 12 · 14 · 16 · 20 · 28 · 40 · 56 px.

## Elementos-assinatura

1. **Gradiente oceano** como fundo de hero/telão.
2. **Destaque âmbar** para a informação que importa agora (data, "ao vivo").
3. **Mosaico de cubos** multicolor — só em momentos celebrativos, nunca como ruído.
4. **Linha de horizonte** (alusão a "ampliar horizontes" / 20 anos).

## Como usar no código

```css
@import "../design-system/concefor/tokens.css";

.hero { background: var(--cf-gradient); color: var(--cf-white); }
.hero h1 { font-family: var(--cf-font-display); text-transform: uppercase; }
.live-badge { background: var(--cf-gold); color: var(--cf-navy-900); }
```

Tokens também em [`tokens.json`](tokens.json) para consumo programático.
Veja [`preview.html`](preview.html) para a demonstração visual completa.

# -*- coding: utf-8 -*-
"""
Cards dos eventos paralelos — VIII Concefor (20/08/2026).
Proposta "v1 com imagem" — card INDIVIDUAL, nao carrossel.

⚠️ NOME DESTA PASTA: deliberadamente fora da sequencia _build_v4/_v5/_v6.
Esta proposta nasceu como "_build_v6" e foi sobrescrita por outra sessao que
usava o mesmo numero para a variacao "respiro" do carrossel. O nome descritivo
evita a colisao: as duas linhas de trabalho convivem sem disputar numero.

O QUE E: o layout do v1 (_build/) — card 1080x1350, gradiente turquesa->azul,
Teko + Montserrat, selo 20 anos em losango, a familia visual dos 8 cards de
palestrante ja publicados — AGORA COM A IMAGEM QUE CADA COORDENACAO ENVIOU,
que era o ganho das propostas v4/v5.

DIFERENCAS EM RELACAO AO v1:
  1. Faixa de imagem sangrada no topo (440px).
  2. Barra de marca SOLIDA sobre a faixa, com a logo horizontal branca. Um
     scrim em degrade nao resolvia: tres imagens vieram como logo em fundo
     branco (Rio Doce Escolar, Pros@tec, Educimat) e a logo branca do Concefor
     sumia sobre elas.
  3. Corte reto no fim da faixa + regua turquesa, em vez de tentar fundir a
     imagem com o gradiente — que e diagonal, entao nenhuma cor fixa casaria.
  4. Etiqueta do tipo de evento ao lado de "Evento paralelo" (o campo `tipo` ja
     existia no v4 e nao era aproveitado no v1).
  5. Dia da semana no bloco "Quando".
  6. LAYOUT EM FLUXO (flexbox), nao mais posicionamento absoluto calculado a
     partir de titulo_lines/sobre_lines/coord_lines declarados a mao. Aqueles
     contadores eram a fonte dos defeitos do v1: uma linha a mais do que o
     declarado sobrepunha o bloco seguinte, e cada mudanca de texto exigia
     recontar linha por linha.

CONTEUDO: importado de _build_v4/build_cards_v4.py (lista EVENTOS), a mesma
fonte que o _build_v5 le. Nao duplicar texto aqui — corrigir la vale para
todos os pipelines de uma vez.

ASSETS: referenciados nas pastas que ja existem, para nao copiar binario novo.

Render: HTML -> Chrome headless (2x) -> downscale Lanczos -> PNG 1080x1350.
"""
import pathlib
import runpy
import sys
from html import escape

ROOT = pathlib.Path(__file__).resolve().parent
PAI = ROOT.parent

# Fonte unica de conteudo: a lista EVENTOS do v4.
EVENTOS = runpy.run_path(str(PAI / "_build_v4" / "build_cards_v4.py"))["EVENTOS"]

A_V1 = "../_build/assets"
A_V4 = "../_build_v4/assets"
A_EVENTOS = "../_build_v4/assets/events"

# Imagens proprias desta proposta, quando o arquivo original nao serve.
# Educimat: o PNG enviado tem 400x300 mas o logo ocupa so 45% da altura — o
# resto e margem em branco. Como o modo "contain" encaixa a IMAGEM inteira na
# caixa, a margem entrava junto e o logo saia pequeno por mais que a faixa
# crescesse. O recorte (assets/06-educimat-trim.png, gerado do proprio arquivo
# do v4) dobra a altura util sem mexer no layout nem no v4.
IMAGEM_PROPRIA = {
    "educimat-15-anos": "assets/06-educimat-trim.png",
}

HERO_H = 440          # altura padrao da faixa de imagem
BRAND_H = 168         # altura da barra de marca sobre a faixa
FOOTER_RESERVA = 196  # espaco preservado embaixo para rodape + selo
LOGO_H = 104          # altura da logo do Concefor dentro da barra

# Ajustes por evento, so onde a imagem pedia (revisao de 10/08).
#
# Rio Doce Escolar e Educimat sao logos em modo "contain": ficam limitados pela
# ALTURA disponivel, entao mexer so no padding lateral nao os aumentaria. Estes
# dois ganham faixa mais alta E menos padding. Sobra espaco no corpo dos dois
# (texto curto), entao a faixa pode crescer sem apertar nada.
#
# Pros@tec tambem e "contain", mas fica no padrao: o arquivo enviado ja tem uma
# caixa clara propria em volta da marca, e ampliar so aumentaria essa caixa.
# A altura da faixa e limitada pelo corpo: quanto mais alta, menos sobra para o
# texto. Por isso os dois nao levam o mesmo valor — o Educimat tem titulo de 3
# linhas e o Ciencia delas, de 2. Calibrado ate o "Quando" parar de encostar no
# rodape. O ganho maior de tamanho vem do padding lateral (96 -> 28), nao da
# altura.
HERO_H_EVENTO = {
    "ciencia-delas": 484,
    "educimat-15-anos": 452,
}
# (topo alem da barra, lateral, baixo) para o modo contain
PAD_CONTAIN = {
    "ciencia-delas": (6, 28, 10),
    "educimat-15-anos": (6, 28, 10),
}
PAD_CONTAIN_PADRAO = (16, 96, 26)

# Os titulo_size vem do v4 sem bonus: a caixa aqui e mais larga (888px), mas
# subir o corpo jogava "IA" sozinho na 3a linha nos titulos terminados em IA.
BONUS_TITULO = 0

CSS = f"""
@font-face{{font-family:'Teko';src:url('{A_V1}/fonts/Teko.ttf') format('truetype');font-weight:300 700;}}
@font-face{{font-family:'Montserrat';src:url('{A_V1}/fonts/Montserrat.ttf') format('truetype');font-weight:100 900;}}

:root{{--turquesa:#00DCC9;--azul:#1F4AA1;}}
*{{margin:0;padding:0;box-sizing:border-box;}}
html,body{{width:1080px;height:1350px;overflow:hidden;background:#000;}}

.stage{{position:relative;width:1080px;height:1350px;overflow:hidden;
  font-family:'Montserrat',sans-serif;-webkit-font-smoothing:antialiased;
  text-rendering:geometricPrecision;
  background:linear-gradient(135deg,var(--turquesa) 0%,var(--azul) 68%);}}

/* textura organica sutil, herdada do v1 */
.blob{{position:absolute;border-radius:50%;filter:blur(2px);pointer-events:none;}}

/* ---------- faixa de imagem ---------- */
/* a altura vem de --hero-h (varia por evento), nao de um valor fixo */
.hero{{position:absolute;top:0;left:0;width:1080px;height:var(--hero-h);
  overflow:hidden;background:var(--hero-bg);}}
/* ">" e obrigatorio: a logo da barra de marca tambem e descendente de .hero, e
   um seletor solto (.hero img) a atingia — o padding do modo contain vazava
   para a logo e a empurrava fora da barra, alem de vencer .brandbar img por
   especificidade (2 classes contra 1). */
.hero > img{{width:100%;height:100%;object-fit:var(--hero-fit);object-position:center;
  display:block;}}
/* contain: a imagem nao preenche a faixa, entao respira para dentro — e desce
   o que a barra de marca ocupa, para nao ficar com o topo cortado */
.hero.is-contain > img{{padding:var(--pad-t) var(--pad-x) var(--pad-b);}}
.hero-rule{{position:absolute;top:var(--hero-h);left:0;width:1080px;height:6px;
  background:var(--turquesa);}}

.brandbar{{position:absolute;top:0;left:0;width:1080px;height:{BRAND_H}px;
  background:rgba(5,22,47,.88);display:flex;align-items:center;
  padding-left:96px;}}
.brandbar img{{display:block;height:{LOGO_H}px;width:auto;}}

/* ---------- corpo ---------- */
.body{{position:absolute;left:96px;width:888px;
  top:calc(var(--hero-h) + 52px);
  height:calc({1350 - FOOTER_RESERVA - 52}px - var(--hero-h));
  display:flex;flex-direction:column;align-items:flex-start;}}

.tags{{display:flex;align-items:center;gap:18px;flex-wrap:wrap;}}
.tag{{padding:15px 34px;border-radius:999px;background:var(--turquesa);
  font-weight:800;font-size:27px;color:var(--azul);
  text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;}}
.tipo{{font-weight:700;font-size:24px;color:rgba(255,255,255,.9);
  text-transform:uppercase;letter-spacing:.1em;white-space:nowrap;}}

.titulo{{margin-top:26px;color:#fff;font-family:'Teko',sans-serif;font-weight:700;
  text-transform:uppercase;letter-spacing:.002em;
  font-size:var(--titulo-size);line-height:.94;}}

.sobre{{margin-top:22px;width:846px;color:rgba(255,255,255,.94);
  font-weight:500;font-size:30px;line-height:1.36;}}

.rule-acc{{margin-top:30px;width:110px;height:4px;background:var(--turquesa);
  flex:none;}}

.info{{margin-top:22px;width:846px;}}
.info .lbl{{font-weight:700;font-size:16px;letter-spacing:.14em;
  text-transform:uppercase;color:rgba(0,220,201,.95);margin-bottom:5px;}}
.info .val{{font-weight:600;font-size:31px;line-height:1.22;color:#fff;}}

.vagas{{margin-top:14px;display:inline-block;padding:9px 20px;border-radius:999px;
  background:#fff;color:var(--azul);font-weight:800;font-size:18px;
  letter-spacing:.05em;text-transform:uppercase;}}

/* ---------- rodape ---------- */
.footer-label{{position:absolute;left:96px;bottom:96px;font-weight:700;font-size:17px;
  letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.78);}}
.footer-url{{position:absolute;left:96px;bottom:54px;font-weight:800;font-size:34px;
  color:#fff;}}

.selo-wrap{{position:absolute;right:56px;bottom:34px;width:200px;height:200px;
  background:#fff;border-radius:20px;transform:rotate(45deg);
  box-shadow:0 12px 30px rgba(16,42,92,.28);
  display:flex;align-items:center;justify-content:center;}}
.selo-wrap img{{width:150px;height:auto;transform:rotate(-45deg);display:block;}}
"""


def card(evento):
    slug = evento["slug"]
    fit = evento.get("fit", "cover")
    titulo_size = evento["titulo_size"] + BONUS_TITULO
    vagas = evento.get("vagas")

    hero_h = HERO_H_EVENTO.get(slug, HERO_H)
    pad_t_extra, pad_x, pad_b = PAD_CONTAIN.get(slug, PAD_CONTAIN_PADRAO)
    src = IMAGEM_PROPRIA.get(slug, f"{A_EVENTOS}/{escape(evento['imagem'])}")

    estilo = (f"--titulo-size:{titulo_size}px;--hero-h:{hero_h}px;"
              f"--pad-t:{BRAND_H + pad_t_extra}px;--pad-x:{pad_x}px;--pad-b:{pad_b}px")

    return f"""<div class="stage" style="{estilo}">
  <div class="blob" style="width:560px;height:560px;left:-220px;top:820px;
    background:radial-gradient(circle,rgba(255,255,255,.07) 0%,rgba(255,255,255,0) 68%);"></div>

  <div class="hero {'is-contain' if fit == 'contain' else ''}"
       style="--hero-bg:{evento['fundo_imagem']};--hero-fit:{fit}">
    <img src="{src}"
         alt="Imagem de divulgacao enviada para o evento {escape(evento['titulo'])}">
    <div class="brandbar">
      <img src="{A_V4}/logo-concefor-horizontal-branco.png" alt="VIII Concefor">
    </div>
  </div>
  <div class="hero-rule"></div>

  <div class="body">
    <div class="tags">
      <span class="tag">Evento paralelo</span>
      <span class="tipo">{escape(evento['tipo'])}</span>
    </div>
    <div class="titulo">{escape(evento['titulo'])}</div>
    <div class="sobre">{escape(evento['sobre'])}</div>
    <div class="rule-acc"></div>
    <div class="info">
      <div class="lbl">Coordenação</div>
      <div class="val">{escape(evento['coordenacao'])}</div>
      {f'<div class="vagas">{escape(vagas)}</div>' if vagas else ''}
    </div>
    <div class="info">
      <div class="lbl">Quando</div>
      <div class="val">{escape(evento['quando'])} &middot; quinta-feira</div>
    </div>
  </div>

  <div class="footer-label">Inscreva-se em</div>
  <div class="footer-url">concefor.cefor.ifes.edu.br</div>
  <div class="selo-wrap"><img src="{A_V1}/selo-20-anos-colorido.png" alt="20 anos do Cefor"></div>
</div>"""


def html(body):
    return ("<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'>"
            f"<style>{CSS}</style></head><body>{body}</body></html>")


def main():
    quais = sys.argv[1:] or [str(i) for i in range(1, len(EVENTOS) + 1)]
    for i, evento in enumerate(EVENTOS, 1):
        if str(i) not in quais:
            continue
        destino = ROOT / f"card_{i}_{evento['slug']}.html"
        destino.write_text(html(card(evento)), encoding="utf-8")
        print("html:", destino.name, "-", evento["slug"])


if __name__ == "__main__":
    main()

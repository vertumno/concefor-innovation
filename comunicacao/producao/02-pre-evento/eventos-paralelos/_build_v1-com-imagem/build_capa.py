# -*- coding: utf-8 -*-
"""
Capa do carrossel dos eventos paralelos — VIII Concefor.

Slide 1 de um carrossel cujos slides 2 a 7 sao os cards ja aprovados.

⚠️ ARQUIVO SEPARADO DE PROPOSITO. Os cards estao aprovados e nao podem mudar:
este script apenas IMPORTA o CSS e os dados de build_cards.py e acrescenta o
que so a capa usa. Rodar a capa nao regenera card nenhum.

Mantem a mesma linguagem dos cards: barra de marca no topo com a logo
horizontal, gradiente turquesa->azul, Teko + Montserrat, selo 20 anos em
losango e o mesmo rodape.

Render: HTML -> Chrome headless (2x) -> PNG 1080x1350 (ver render_capa.py).
"""
import pathlib
import runpy
from html import escape

ROOT = pathlib.Path(__file__).resolve().parent
_base = runpy.run_path(str(ROOT / "build_cards.py"))

EVENTOS = _base["EVENTOS"]
A_V1 = _base["A_V1"]
A_V4 = _base["A_V4"]
A_EVENTOS = _base["A_EVENTOS"]
IMAGEM_PROPRIA = _base["IMAGEM_PROPRIA"]
BRAND_H = _base["BRAND_H"]
LOGO_H = _base["LOGO_H"]

TITULO = "Eventos<br>paralelos"
# A chamada anterior ("seis encontros [...] cada um com inscricao propria")
# falava de formato e de processo, que nao interessam a quem le. Esta diz o que
# a pessoa vai encontrar la, com as coisas mais concretas dos seis.
CHAMADA = ("Inteligência artificial, robótica, impressão 3D e livros-jogo. "
           "Escolha por onde começar.")  # 2 linhas: a caixa comporta ~50 caracteres por linha
DATA = "20 de agosto &middot; quinta-feira"
# curto de proposito: na linha da data, "Arraste para ver os seis" passava por
# cima do badge "20 de agosto · quinta-feira". A seta dupla ja diz o gesto.
ARRASTE = "Arraste"

CSS_CAPA = f"""
*{{margin:0;padding:0;box-sizing:border-box;}}
html,body{{width:1080px;height:1350px;overflow:hidden;background:#000;}}
:root{{--turquesa:#00DCC9;--azul:#1F4AA1;}}

@font-face{{font-family:'Teko';src:url('{A_V1}/fonts/Teko.ttf') format('truetype');font-weight:300 700;}}
@font-face{{font-family:'Montserrat';src:url('{A_V1}/fonts/Montserrat.ttf') format('truetype');font-weight:100 900;}}

.stage{{position:relative;width:1080px;height:1350px;overflow:hidden;
  font-family:'Montserrat',sans-serif;-webkit-font-smoothing:antialiased;
  text-rendering:geometricPrecision;
  background:linear-gradient(135deg,var(--turquesa) 0%,var(--azul) 68%);}}

.blob{{position:absolute;border-radius:50%;filter:blur(2px);pointer-events:none;}}

/* mesma barra de marca dos cards, para o slide 1 nao destoar dos outros 6 */
.brandbar{{position:absolute;top:0;left:0;width:1080px;height:{BRAND_H}px;
  background:rgba(5,22,47,.88);display:flex;align-items:center;padding-left:96px;}}
.brandbar img{{display:block;height:{LOGO_H}px;width:auto;}}
.brand-rule{{position:absolute;top:{BRAND_H}px;left:0;width:1080px;height:6px;
  background:var(--turquesa);}}

.titulo{{position:absolute;left:96px;top:232px;width:888px;color:#fff;
  font-family:'Teko',sans-serif;font-weight:700;font-size:146px;line-height:.85;
  text-transform:uppercase;letter-spacing:.002em;}}
.titulo b{{color:#06213f;font-weight:700;}}

/* 500 a 636 = 136px, ou seja, tres linhas de folga para uma chamada de duas.
   Sem essa margem, uma linha a mais joga o texto por baixo do badge da data. */
.chamada{{position:absolute;left:96px;top:500px;width:790px;
  color:rgba(255,255,255,.95);font-weight:500;font-size:33px;line-height:1.34;}}

.data{{position:absolute;left:96px;top:636px;padding:15px 34px;border-radius:999px;
  background:var(--turquesa);color:var(--azul);font-weight:800;font-size:28px;
  text-transform:uppercase;letter-spacing:.05em;}}

/* Grade dos 6, na ordem em que aparecem no carrossel.
   Altura e topo calibrados para a grade FECHAR ANTES do selo: o losango tem
   200x200 girado 45 graus, entao seu vertice de cima chega a y=1075 e a partir
   dali ele se abre para os lados — com a grade terminando em 1140, o canto
   inferior direito da miniatura 06 ficava coberto. */
.grade{{position:absolute;left:96px;top:716px;width:888px;
  display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}}
.mini{{position:relative;height:170px;border-radius:14px;overflow:hidden;
  background:var(--mini-bg);box-shadow:0 8px 22px rgba(6,24,50,.22);}}
.mini > img{{width:100%;height:100%;object-fit:var(--mini-fit);object-position:center;
  display:block;}}
.mini.is-contain > img{{padding:22px;}}
.mini b{{position:absolute;left:0;bottom:0;min-width:52px;padding:6px 14px 4px;
  background:rgba(5,22,47,.9);color:#fff;font-family:'Teko',sans-serif;
  font-weight:700;font-size:34px;line-height:1;letter-spacing:.03em;}}

/* na LINHA DA DATA, nao no rodape: o selo em losango tem 200x200 gpirado 45
   graus, entao seu bounding box invade a faixa de baixo a direita e cortava o
   fim da frase. Aqui ele fica livre e ainda equilibra o badge da esquerda. */
.arraste{{position:absolute;right:96px;top:648px;font-weight:700;font-size:24px;
  letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.92);
  display:flex;align-items:center;gap:12px;}}
.arraste span{{font-size:30px;line-height:1;}}

.footer-label{{position:absolute;left:96px;bottom:96px;font-weight:700;font-size:17px;
  letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.78);}}
.footer-url{{position:absolute;left:96px;bottom:54px;font-weight:800;font-size:34px;color:#fff;}}

.selo-wrap{{position:absolute;right:56px;bottom:34px;width:200px;height:200px;
  background:#fff;border-radius:20px;transform:rotate(45deg);
  box-shadow:0 12px 30px rgba(16,42,92,.28);
  display:flex;align-items:center;justify-content:center;}}
.selo-wrap img{{width:150px;height:auto;transform:rotate(-45deg);display:block;}}
"""


def mini(evento, i):
    fit = evento.get("fit", "cover")
    src = IMAGEM_PROPRIA.get(evento["slug"], f"{A_EVENTOS}/{escape(evento['imagem'])}")
    return (f'<div class="mini {"is-contain" if fit == "contain" else ""}" '
            f'style="--mini-bg:{evento["fundo_imagem"]};--mini-fit:{fit}">'
            f'<img src="{src}" alt="{escape(evento["titulo"])}">'
            f'<b>{i:02d}</b></div>')


def capa():
    minis = "".join(mini(e, i) for i, e in enumerate(EVENTOS, 1))
    return f"""<div class="stage">
  <div class="blob" style="width:620px;height:620px;left:640px;top:560px;
    background:radial-gradient(circle,rgba(255,255,255,.09) 0%,rgba(255,255,255,0) 68%);"></div>

  <div class="brandbar">
    <img src="{A_V4}/logo-concefor-horizontal-branco.png" alt="VIII Concefor">
  </div>
  <div class="brand-rule"></div>

  <div class="titulo">{TITULO}</div>
  <div class="chamada">{CHAMADA}</div>
  <div class="data">{DATA}</div>

  <div class="grade">{minis}</div>

  <div class="arraste">{ARRASTE}<span>&rsaquo;&rsaquo;</span></div>
  <div class="footer-label">Inscreva-se em</div>
  <div class="footer-url">concefor.cefor.ifes.edu.br</div>
  <div class="selo-wrap"><img src="{A_V1}/selo-20-anos-colorido.png" alt="20 anos do Cefor"></div>
</div>"""


def main():
    destino = ROOT / "capa.html"
    destino.write_text(
        "<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'>"
        f"<style>{CSS_CAPA}</style></head><body>{capa()}</body></html>",
        encoding="utf-8")
    print("html:", destino.name)


if __name__ == "__main__":
    main()

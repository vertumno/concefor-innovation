# -*- coding: utf-8 -*-
"""Proposta v6 — numeração simples, capa com chamada e mais respiro."""

from __future__ import annotations

import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parent
V5_PATH = ROOT.parent / "_build_v5" / "build_cards_v5.py"

spec = importlib.util.spec_from_file_location("concefor_cards_v5", V5_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Não foi possível carregar {V5_PATH}")
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)


OVERRIDES = r"""
/* v6 — topo mais sutil, conteúdo mais aberto e URL com menos peso. */
.masthead:before{
  background:linear-gradient(90deg,
    rgba(6,29,69,.44) 0%,
    rgba(6,29,69,.16) 48%,
    rgba(6,29,69,0) 76%);
}
.concefor-horizontal{filter:drop-shadow(0 2px 8px rgba(4,22,52,.24));}
.masthead:after{background:rgba(255,255,255,.52);}

.visual{height:340px;}
.seal{top:430px;width:140px;height:140px;}
.seal img{width:102px;}
.content{top:498px;bottom:92px;padding-top:42px;}
.title{margin-top:16px;}
.summary{margin-top:16px;font-size:38px;line-height:1.22;}
.accent-rule{margin-top:17px;}
.info-list{margin-top:17px;gap:10px;}
.info-row{background:rgba(4,22,52,.23);border-left-color:rgba(255,255,255,.68);}

.event-marker{display:flex;align-items:center;gap:16px;padding:11px 12px 10px 18px;font-size:28px;letter-spacing:.045em;}
.event-marker strong{margin:0;padding:5px 11px 3px;background:var(--turquoise);color:var(--navy);font-family:'Teko',sans-serif;font-size:34px;line-height:.8;letter-spacing:.02em;}

.footer{height:92px;}
.footer .url{font-size:38px;font-weight:650;letter-spacing:-.02em;}

.cover-logo-field{background:linear-gradient(90deg,rgba(6,29,69,.38),rgba(6,29,69,.10) 74%,transparent);}
.cover-subtitle{top:425px;}
.cover-invite{position:absolute;left:62px;right:62px;top:1090px;padding:14px 24px 13px;background:rgba(4,22,52,.42);border-left:5px solid white;color:white;text-align:center;font-size:32px;line-height:1.15;font-weight:720;}
.cover-footer .site{font-size:38px;font-weight:650;letter-spacing:-.02em;}
"""

base.CSS += OVERRIDES


def footer() -> str:
    return """
      <footer class="footer">
        <div><div class="url">concefor.cefor.ifes.edu.br</div></div>
      </footer>"""


def event_card(evento: dict[str, str], index: int) -> str:
    limited = f'<div class="limited">{base.esc(evento["vagas"])}</div>' if evento.get("vagas") else ""
    body = f"""<main class="stage" style="--visual-bg:{evento['fundo_imagem']};--visual-fit:{evento['fit']};--title-size:{base.TITLE_SIZES[evento['slug']]}px">
      {base.masthead()}
      <section class="visual {'contain' if evento['fit'] == 'contain' else ''}">
        <img src="assets/events/{base.esc(evento['imagem'])}" alt="Imagem enviada para o evento {base.esc(evento['titulo'])}">
        <div class="event-marker"><span>Evento paralelo</span><strong>{index:02d}</strong></div>
      </section>
      <div class="seal"><img src="assets/selo-20-anos-colorido.png" alt="20 anos Cefor"></div>
      <section class="content">
        <div class="type">{base.esc(evento['tipo'])}</div>
        <h1 class="title">{base.esc(evento['titulo'])}</h1>
        <p class="summary">{base.esc(evento['sobre'])}</p>
        <div class="accent-rule"></div>
        <div class="info-list">
          <div class="info-row">
            <div class="info-label">Quando</div>
            <div class="info-value">{base.esc(evento['quando'])}{limited}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Coordenação</div>
            <div class="info-value">{base.esc(evento['coordenacao'])}</div>
          </div>
        </div>
      </section>
      {footer()}
    </main>"""
    return base.page(body)


def cover_card() -> str:
    tiles = []
    for index, evento in enumerate(base.EVENTOS, 1):
        contain = " contain" if evento["fit"] == "contain" else ""
        tiles.append(
            f"""<div class="cover-tile{contain}" style="--tile-bg:{evento['fundo_imagem']};--tile-fit:{evento['fit']}">
              <img src="assets/events/{base.esc(evento['imagem'])}" alt="{base.esc(evento['titulo'])}"><b>{index:02d}</b>
            </div>"""
        )
    body = f"""<main class="stage cover">
      <div class="cover-logo-field"></div>
      <img class="cover-logo" src="assets/logo-concefor-horizontal-branco.png" alt="VIII Concefor">
      <h1 class="cover-title">Eventos <span>paralelos</span></h1>
      <p class="cover-subtitle">Seis encontros para explorar ciência, tecnologia e educação em movimento.</p>
      <div class="cover-date">20 ago 2026<br>quinta-feira</div>
      <section class="cover-grid">{''.join(tiles)}</section>
      <div class="cover-invite">Faça sua inscrição em um dos encontros paralelos</div>
      <footer class="cover-footer"><div class="site">concefor.cefor.ifes.edu.br</div></footer>
    </main>"""
    return base.page(body)


def main() -> None:
    outputs = [("slide_01_capa.html", cover_card())]
    outputs.extend(
        (f"slide_{index + 1:02d}_{evento['slug']}.html", event_card(evento, index))
        for index, evento in enumerate(base.EVENTOS, 1)
    )
    for filename, contents in outputs:
        path = ROOT / filename
        path.write_text(contents, encoding="utf-8")
        print("html:", path)


if __name__ == "__main__":
    main()

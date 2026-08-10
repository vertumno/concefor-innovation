# -*- coding: utf-8 -*-
"""Gera a proposta v4 dos cards/carrossel de eventos paralelos do VIII Concefor.

Direção: imagem enviada por cada coordenação como protagonista, logo horizontal,
hierarquia editorial e uma capa que transforma o conjunto em carrossel de 7 slides.
"""

from __future__ import annotations

import html as html_lib
import os


ROOT = os.path.dirname(os.path.abspath(__file__))


EVENTOS = [
    {
        "slug": "ia-alem-do-chat",
        "imagem": "01-ia-alem-do-chat.png",
        "fit": "cover",
        "fundo_imagem": "#071a35",
        "tipo": "Oficina prática",
        "titulo": "IA além do chat: da célula ao organismo baseado em IA",
        "titulo_size": 72,
        "sobre": "Um professor levava uma semana para transformar aulas antigas. Passou a levar meia hora. Você sai com o seu próprio espaço de trabalho, pronto para usar.",
        "quando": "20/08 · 9h às 12h e 13h30 às 16h",
        "coordenacao": "Marcos Accioly e Elton Vinícius (Cefor)",
        "vagas": "Vagas limitadas · 20 pessoas",
    },
    {
        "slug": "ciencia-delas",
        "imagem": "02-ciencia-delas.png",
        "fit": "contain",
        "fundo_imagem": "#f7f8f3",
        "tipo": "Mesa-redonda",
        "titulo": "“Ciência delas” no Projeto Rio Doce Escolar",
        "titulo_size": 76,
        "sobre": "Gestoras, pesquisadoras, professoras e agentes comunitárias da bacia do Rio Doce contam a ciência que fazem na Rede de Educadores Ambientais.",
        "quando": "20/08 · 9h às 12h",
        "coordenacao": "Manuella Villar Amado (Rio Doce Escolar / Ifes Vila Velha / Educimat)",
    },
    {
        "slug": "escola-de-inovacao",
        "imagem": "03-escola-de-inovacao.png",
        "fit": "cover",
        "fundo_imagem": "#d9e6e2",
        "tipo": "Cultura maker e robótica",
        "titulo": "Escola de Inovação: 6º ano de popularização de novas tecnologias digitais",
        "titulo_size": 57,
        "sobre": "Impressão 3D, corte a laser, robótica e realidade virtual: seis anos da Escola de Inovação, com visita às estações onde tudo acontece.",
        "quando": "20/08 · 9h às 12h e 13h30 às 16h",
        "coordenacao": "Patrícia Piana de Andrade e Daniel Moreira dos Santos (CCEC-EI / SEME / PMV)",
    },
    {
        "slug": "entre-dois-mundos",
        "imagem": "04-entre-dois-mundos.png",
        "fit": "cover",
        "fundo_imagem": "#071a35",
        "tipo": "Oficina",
        "titulo": "Entre Dois Mundos: uma aventura para aprender IA",
        "titulo_size": 74,
        "sobre": "Uma jornada em sete etapas com a coleção de livros-jogo Sofia Carter, para levar a alfabetização em IA à sua sala de aula.",
        "quando": "20/08 · 13h30 às 16h",
        "coordenacao": "Juliana Cristina dos Santos Waichert (Ifes)",
    },
    {
        "slug": "workshop-prostec",
        "imagem": "05-workshop-prostec.png",
        "fit": "contain",
        "fundo_imagem": "#0b2d54",
        "tipo": "Workshop",
        "titulo": "Workshop Pros@tec: Desafios da Educação em Computação e da Informática na Educação",
        "titulo_size": 55,
        "sobre": "Pesquisadores apresentam respostas aos desafios da Educação em Computação apontados pela SBC, em rodas de conversa nos dois turnos.",
        "quando": "20/08 · 9h às 12h e 13h30 às 16h",
        "coordenacao": "Márcia Gonçalves de Oliveira e Rosane Muñoz (Cefor)",
    },
    {
        "slug": "educimat-15-anos",
        "imagem": "06-educimat-15-anos.png",
        "fit": "contain",
        "fundo_imagem": "#f7f8f3",
        "tipo": "Celebração dos 15 anos",
        "titulo": "EDUCIMAT: 15 anos elaborando produtos, tecendo saberes e modificando vidas",
        "titulo_size": 59,
        "sobre": "Quinze anos do mestrado e doutorado profissional em Educação em Ciências e Matemática do Ifes, comemorados dentro do Concefor.",
        "quando": "20/08 · 13h30 às 16h",
        "coordenacao": "Edmar Reis Thiengo e Ana Raquel Santos de Medeiros Garcia (Educimat / Ifes)",
    },
]


CSS = r"""
@font-face{font-family:'Teko';src:url('assets/fonts/Teko.ttf') format('truetype');font-weight:300 700;font-style:normal;}
@font-face{font-family:'Montserrat';src:url('assets/fonts/Montserrat.ttf') format('truetype');font-weight:100 900;font-style:normal;}
:root{
  --navy:#061d45;
  --navy-2:#0b2f69;
  --turquoise:#00dcc9;
  --blue:#1f4aa1;
  --paper:#f4f5f0;
  --ink:#071b3b;
  --muted:#4e5d70;
}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{width:1080px;height:1350px;overflow:hidden;background:#071b3b;}
body{font-family:'Montserrat',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;}
.stage{position:relative;width:1080px;height:1350px;overflow:hidden;background:var(--paper);}

/* Cabeçalho institucional — versão horizontal solicitada. */
.masthead{position:absolute;inset:0 0 auto 0;height:150px;background:var(--navy);z-index:20;}
.masthead:after{content:'';position:absolute;left:0;right:0;bottom:0;height:6px;background:linear-gradient(90deg,var(--turquoise),#33b6dc 65%,#d7df23);}
.concefor-horizontal{position:absolute;left:56px;top:25px;width:422px;height:102px;object-fit:contain;object-position:left center;}
.date-lockup{position:absolute;right:58px;top:34px;display:flex;align-items:center;gap:18px;color:white;}
.date-lockup .day{font-family:'Teko',sans-serif;font-weight:700;font-size:78px;line-height:.8;color:var(--turquoise);}
.date-lockup .month{font-size:18px;line-height:1.28;font-weight:800;letter-spacing:.12em;text-transform:uppercase;}

/* Imagem enviada pela coordenação. */
.visual{position:absolute;left:0;right:0;top:150px;height:420px;overflow:hidden;background:var(--visual-bg);}
.visual img{width:100%;height:100%;display:block;object-fit:var(--visual-fit);object-position:center;}
.visual.contain img{padding:32px 90px;}
.visual:after{content:'';position:absolute;inset:auto 0 0;height:80px;background:linear-gradient(180deg,transparent,rgba(6,29,69,.26));pointer-events:none;}
.event-marker{position:absolute;left:56px;bottom:25px;z-index:3;background:rgba(6,29,69,.94);border-left:7px solid var(--turquoise);padding:12px 18px 11px;color:white;font-size:17px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;}
.event-marker strong{color:var(--turquoise);margin-left:10px;}

.seal{position:absolute;right:62px;top:505px;z-index:25;width:126px;height:126px;background:white;transform:rotate(45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 40px rgba(6,29,69,.22);}
.seal img{width:92px;height:auto;transform:rotate(-45deg);}

.content{position:absolute;left:0;right:0;top:570px;height:780px;padding:42px 66px 118px 66px;background:var(--paper);}
.type{display:inline-flex;align-items:center;min-height:36px;padding:7px 16px 6px;background:var(--turquoise);color:var(--navy);font-size:16px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;}
.title{max-width:910px;margin-top:17px;color:var(--ink);font-family:'Teko',sans-serif;font-weight:700;font-size:var(--title-size);line-height:.88;letter-spacing:-.012em;text-transform:uppercase;}
.summary{max-width:875px;margin-top:17px;color:var(--muted);font-size:23px;line-height:1.35;font-weight:550;}
.accent-rule{width:92px;height:6px;margin-top:23px;background:var(--turquoise);}
.info-grid{display:grid;grid-template-columns:38% 1fr;gap:42px;margin-top:21px;}
.info-label{margin-bottom:7px;color:var(--blue);font-size:14px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;}
.info-value{color:var(--ink);font-size:23px;line-height:1.27;font-weight:750;}
.limited{display:inline-block;margin-top:16px;padding:9px 14px 8px;border:2px solid var(--blue);color:var(--blue);font-size:15px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;}
.content-foot{position:absolute;left:66px;right:66px;bottom:116px;display:flex;align-items:center;justify-content:space-between;color:var(--muted);font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;}
.content-foot .dot{display:inline-block;width:8px;height:8px;margin:0 12px 1px;background:var(--turquoise);transform:rotate(45deg);}

.footer{position:absolute;left:0;right:0;bottom:0;height:96px;background:var(--navy);display:flex;align-items:center;padding:0 66px;color:white;z-index:30;}
.footer .url-label{font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--turquoise);}
.footer .url{margin-top:3px;font-size:24px;font-weight:850;letter-spacing:-.02em;}
.footer .slide-number{margin-left:auto;font-family:'Teko',sans-serif;font-size:34px;font-weight:600;letter-spacing:.04em;color:rgba(255,255,255,.78);}

/* Capa */
.cover{background:var(--navy);color:white;}
.cover-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.cover-wash{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,17,43,.12),rgba(3,17,43,.42) 46%,rgba(3,17,43,.84));}
.cover .cover-logo{position:absolute;left:62px;top:44px;width:454px;height:116px;object-fit:contain;object-position:left center;}
.cover-kicker{position:absolute;right:62px;top:67px;font-size:15px;font-weight:850;letter-spacing:.14em;text-transform:uppercase;color:var(--turquoise);}
.cover-title{position:absolute;left:62px;top:208px;width:900px;font-family:'Teko',sans-serif;font-size:122px;font-weight:700;line-height:.78;letter-spacing:-.01em;text-transform:uppercase;}
.cover-title span{display:block;color:var(--turquoise);}
.cover-subtitle{position:absolute;left:68px;top:414px;width:760px;font-size:24px;line-height:1.35;font-weight:650;color:rgba(255,255,255,.91);}
.cover-date{position:absolute;right:66px;top:398px;width:205px;border-left:5px solid var(--turquoise);padding:5px 0 3px 18px;font-size:16px;line-height:1.45;font-weight:900;letter-spacing:.1em;text-transform:uppercase;}
.cover-grid{position:absolute;left:62px;right:62px;top:545px;display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:246px;gap:16px;}
.cover-tile{position:relative;overflow:hidden;background:var(--tile-bg);border:1px solid rgba(255,255,255,.18);}
.cover-tile img{display:block;width:100%;height:100%;object-fit:var(--tile-fit);object-position:center;}
.cover-tile.contain img{padding:22px;}
.cover-tile:after{content:'';position:absolute;inset:auto 0 0;height:52px;background:linear-gradient(180deg,transparent,rgba(3,17,43,.72));}
.cover-tile b{position:absolute;left:14px;bottom:10px;z-index:2;width:31px;height:31px;display:flex;align-items:center;justify-content:center;background:var(--turquoise);color:var(--navy);font-size:13px;font-weight:950;}
.cover-footer{position:absolute;left:62px;right:62px;bottom:43px;height:72px;border-top:1px solid rgba(255,255,255,.28);display:flex;align-items:flex-end;}
.cover-footer .site{font-size:20px;font-weight:850;}
.cover-footer .swipe{margin-left:auto;color:var(--turquoise);font-size:15px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;}
"""


def esc(value: str) -> str:
    return html_lib.escape(value, quote=True)


def page(body: str, extra_style: str = "") -> str:
    return (
        "<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'>"
        f"<style>{CSS}{extra_style}</style></head><body>{body}</body></html>"
    )


def masthead() -> str:
    return """
      <header class="masthead">
        <img class="concefor-horizontal" src="assets/logo-concefor-horizontal-branco.png" alt="VIII Concefor">
        <div class="date-lockup"><div class="day">20</div><div class="month">AGO<br>2026</div></div>
      </header>"""


def footer(slide: int) -> str:
    return f"""
      <footer class="footer">
        <div><div class="url-label">Programação e inscrições</div><div class="url">concefor.cefor.ifes.edu.br</div></div>
        <div class="slide-number">{slide:02d} / 07</div>
      </footer>"""


def event_card(evento: dict[str, str], index: int) -> str:
    slide = index + 1
    limited = f'<div class="limited">{esc(evento["vagas"])}</div>' if evento.get("vagas") else ""
    body = f"""<main class="stage" style="--visual-bg:{evento['fundo_imagem']};--visual-fit:{evento['fit']};--title-size:{evento['titulo_size']}px">
      {masthead()}
      <section class="visual {'contain' if evento['fit'] == 'contain' else ''}">
        <img src="assets/events/{esc(evento['imagem'])}" alt="Imagem enviada para o evento {esc(evento['titulo'])}">
        <div class="event-marker">Evento paralelo <strong>{index:02d} / 06</strong></div>
      </section>
      <div class="seal"><img src="assets/selo-20-anos-colorido.png" alt="20 anos Cefor"></div>
      <section class="content">
        <div class="type">{esc(evento['tipo'])}</div>
        <h1 class="title">{esc(evento['titulo'])}</h1>
        <p class="summary">{esc(evento['sobre'])}</p>
        <div class="accent-rule"></div>
        <div class="info-grid">
          <div>
            <div class="info-label">Quando</div>
            <div class="info-value">{esc(evento['quando'])}</div>
            {limited}
          </div>
          <div>
            <div class="info-label">Coordenação</div>
            <div class="info-value">{esc(evento['coordenacao'])}</div>
          </div>
        </div>
        <div class="content-foot"><span>Quinta-feira</span><span><i class="dot"></i>VIII Concefor</span></div>
      </section>
      {footer(slide)}
    </main>"""
    return page(body)


def cover_card() -> str:
    tiles = []
    for i, evento in enumerate(EVENTOS, 1):
        contain = " contain" if evento["fit"] == "contain" else ""
        tiles.append(
            f"""<div class="cover-tile{contain}" style="--tile-bg:{evento['fundo_imagem']};--tile-fit:{evento['fit']}">
              <img src="assets/events/{esc(evento['imagem'])}" alt="{esc(evento['titulo'])}"><b>{i:02d}</b>
            </div>"""
        )
    body = f"""<main class="stage cover">
      <img class="cover-bg" src="assets/network-background.png" alt="">
      <div class="cover-wash"></div>
      <img class="cover-logo" src="assets/logo-concefor-horizontal-branco.png" alt="VIII Concefor">
      <div class="cover-kicker">Carrossel · 01 / 07</div>
      <h1 class="cover-title">Eventos <span>paralelos</span></h1>
      <p class="cover-subtitle">Seis encontros para explorar ciência, tecnologia e educação em movimento.</p>
      <div class="cover-date">20 ago 2026<br>quinta-feira</div>
      <section class="cover-grid">{''.join(tiles)}</section>
      <footer class="cover-footer"><div class="site">concefor.cefor.ifes.edu.br</div><div class="swipe">Deslize para conhecer →</div></footer>
    </main>"""
    return page(body)


def main() -> None:
    os.makedirs(ROOT, exist_ok=True)
    outputs = [("slide_01_capa.html", cover_card())]
    outputs.extend(
        (f"slide_{index + 1:02d}_{evento['slug']}.html", event_card(evento, index))
        for index, evento in enumerate(EVENTOS, 1)
    )
    for filename, contents in outputs:
        path = os.path.join(ROOT, filename)
        with open(path, "w", encoding="utf-8") as file:
            file.write(contents)
        print("html:", path)


if __name__ == "__main__":
    main()

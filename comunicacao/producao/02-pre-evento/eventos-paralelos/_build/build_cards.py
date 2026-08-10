# -*- coding: utf-8 -*-
"""
Cards dos eventos paralelos — VIII Concefor (20/08/2026).
Identidade oficial (comunicacao/contexto/05-identidade-visual.md), mesma familia
visual dos 8 cards de palestrante ja publicados: gradiente turquesa->azul,
logo VIII Concefor + selo 20 anos, tipografia Teko + Montserrat.

v2 (ajustes pedidos em revisao): sem local na arte, horario dentro do badge de
data (libera espaco embaixo), logo maior, tag e titulo maiores, descricao do
evento mais completa (fonte: fonte-eventos-satelites.md), coordenacao corrigida.

Render HTML -> Chrome headless -> PNG (ver render_cards.py).
"""
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
M = 96  # margem lateral segura

CSS = r"""
@font-face{font-family:'Teko';src:url('assets/fonts/Teko.ttf') format('truetype');font-weight:300 700;font-style:normal;}
@font-face{font-family:'Montserrat';src:url('assets/fonts/Montserrat.ttf') format('truetype');font-weight:100 900;font-style:normal;}

:root{
  --turquesa:#00DCC9; --azul:#1F4AA1; --branco:#FFFFFF;
}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1350px;overflow:hidden;background:#000;}
.stage{position:relative;width:1080px;height:1350px;overflow:hidden;
  font-family:'Montserrat',sans-serif;-webkit-font-smoothing:antialiased;
  text-rendering:geometricPrecision;
  background:linear-gradient(135deg,var(--turquesa) 0%,var(--azul) 68%);}

/* textura organica sutil, muito discreta */
.blob{position:absolute;border-radius:50%;filter:blur(2px);pointer-events:none;}

.logo{position:absolute;left:96px;top:86px;width:260px;}
.logo img{display:block;width:100%;height:auto;}

.rule-top{position:absolute;left:96px;height:2px;background:rgba(255,255,255,.5);}

.tag{position:absolute;left:96px;padding:16px 36px;border-radius:999px;
  background:var(--turquesa);
  font-family:'Montserrat',sans-serif;font-weight:800;font-size:29px;color:var(--azul);
  text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;}

.titulo{position:absolute;left:96px;width:888px;color:#fff;
  font-family:'Teko',sans-serif;font-weight:700;text-transform:uppercase;
  letter-spacing:.002em;}

.sobre{position:absolute;left:96px;width:840px;color:rgba(255,255,255,.94);
  font-family:'Montserrat',sans-serif;font-weight:500;font-size:30px;line-height:1.38;}

.rule-acc{position:absolute;left:96px;width:110px;height:4px;background:var(--turquesa);}

.info{position:absolute;left:96px;width:820px;}
.info .lbl{font-family:'Montserrat',sans-serif;font-weight:700;font-size:16px;
  letter-spacing:.14em;text-transform:uppercase;color:rgba(0,220,201,.95);margin-bottom:5px;}
.info .val{font-family:'Montserrat',sans-serif;font-weight:600;font-size:31px;
  line-height:1.22;color:#fff;}

.vagas{display:inline-block;margin-top:14px;padding:9px 20px;border-radius:999px;
  background:#fff;color:var(--azul);font-family:'Montserrat',sans-serif;font-weight:800;
  font-size:18px;letter-spacing:.05em;text-transform:uppercase;}

.footer-label{position:absolute;left:96px;bottom:96px;font-family:'Montserrat',sans-serif;
  font-weight:700;font-size:17px;letter-spacing:.12em;text-transform:uppercase;
  color:rgba(255,255,255,.78);}
.footer-url{position:absolute;left:96px;bottom:54px;font-family:'Montserrat',sans-serif;
  font-weight:800;font-size:34px;color:#fff;}

.selo-wrap{position:absolute;right:56px;bottom:34px;width:200px;height:200px;
  background:#fff;border-radius:20px;transform:rotate(45deg);
  box-shadow:0 12px 30px rgba(16,42,92,.28);
  display:flex;align-items:center;justify-content:center;}
.selo-wrap img{width:150px;height:auto;transform:rotate(-45deg);display:block;}
"""


def card(evento):
    tag_top = 496
    titulo_top = tag_top + 96  # respiro maior — a etiqueta nao pode colar no titulo

    titulo_size = evento["titulo_size"]
    titulo_lines = evento["titulo_lines"]
    titulo_lh = titulo_size * 0.94
    titulo_box_h = titulo_lh * titulo_lines + 20

    sobre_top = titulo_top + titulo_box_h + 16
    sobre_size = evento.get("sobre_size", 30)
    sobre_lines = evento["sobre_lines"]
    sobre_box_h = sobre_size * 1.38 * sobre_lines + 10

    rule_top = sobre_top + sobre_box_h + 22
    coord_top = rule_top + 24

    # bloco "Coordenacao" (label + valor, 1 ou 2 linhas + selo de vagas opcional)
    coord_lines = evento["coord_lines"]
    coord_block_h = 21 + 37.8 * coord_lines + (48 if evento.get("vagas") else 0)
    quando_top = coord_top + coord_block_h + 24

    return f"""<div class="stage">
  <div class="blob" style="width:640px;height:640px;left:620px;top:-220px;
    background:radial-gradient(circle,rgba(255,255,255,.10) 0%,rgba(255,255,255,0) 68%);"></div>
  <div class="blob" style="width:560px;height:560px;left:-220px;top:760px;
    background:radial-gradient(circle,rgba(255,255,255,.07) 0%,rgba(255,255,255,0) 68%);"></div>

  <div class="logo"><img src="assets/logo-concefor-branco.png"></div>
  <div class="rule-top" style="top:458px;width:700px"></div>

  <div class="tag" style="top:{tag_top}px">Evento paralelo</div>
  <div class="titulo" style="top:{titulo_top}px;font-size:{titulo_size}px;line-height:{titulo_lh}px">{evento["titulo"]}</div>
  <div class="sobre" style="top:{sobre_top}px;font-size:{sobre_size}px">{evento["sobre"]}</div>
  <div class="rule-acc" style="top:{rule_top}px"></div>

  <div class="info" style="top:{coord_top}px">
    <div class="lbl">Coordenação</div>
    <div class="val">{evento["coordenacao"]}</div>
    {'<div class="vagas">' + evento["vagas"] + '</div>' if evento.get("vagas") else ''}
  </div>
  <div class="info" style="top:{quando_top}px">
    <div class="lbl">Quando</div>
    <div class="val">{evento["quando"]}</div>
  </div>

  <div class="footer-label">Inscreva-se em</div>
  <div class="footer-url">concefor.cefor.ifes.edu.br</div>
  <div class="selo-wrap"><img src="assets/selo-20-anos-colorido.png"></div>
</div>"""


EVENTOS = [
    dict(
        slug="ia-alem-do-chat",
        tipo="Oficina prática",
        titulo="IA além do chat: da célula ao organismo baseado em IA",
        titulo_size=78, titulo_lines=3,
        sobre="Oficina prática: monte um espaço de trabalho que guarda seu contexto e "
              "produz com você. Não é preciso saber programar.",
        sobre_lines=3,
        quando="20/08 (quinta) &middot; 9h às 12h e 13h30 às 16h",
        coordenacao="Marcos Accioly e Elton Vinícius (Cefor)",
        coord_lines=1,
        vagas="Vagas limitadas &middot; 20 pessoas",
    ),
    dict(
        slug="ciencia-delas",
        tipo="Mesa-redonda",
        titulo="“Ciência delas” no Projeto Rio Doce Escolar",
        titulo_size=78, titulo_lines=2,
        sobre="Mesa-redonda sobre o trabalho das mulheres da Rede de Educadores "
              "Ambientais do Rio Doce Escolar.",
        sobre_lines=2,
        quando="20/08 (quinta) &middot; 9h às 12h",
        coordenacao="Manuella Villar Amado (Rio Doce Escolar / Educimat)",
        coord_lines=2,
    ),
    dict(
        slug="escola-de-inovacao",
        tipo="Cultura maker e robótica",
        titulo="Escola de Inovação: 6º ano de popularização de novas tecnologias digitais",
        titulo_size=62, titulo_lines=3,
        sobre="Cultura maker, impressão 3D, robótica e realidade virtual: seis anos de "
              "tecnologia digital na educação de Vitória.",
        sobre_lines=3,
        quando="20/08 (quinta) &middot; 9h às 12h e 13h30 às 16h",
        coordenacao="Patrícia Piana de Andrade e Daniel Moreira dos Santos",
        coord_lines=2,
    ),
    dict(
        slug="entre-dois-mundos",
        tipo="Oficina",
        titulo="Entre Dois Mundos: uma aventura para aprender IA",
        titulo_size=78, titulo_lines=3,
        sobre="Oficina com a coleção Sofia Carter: livros-jogo e projeto autoral para "
              "alfabetização em IA na educação básica, com abordagem STEAM.",
        sobre_lines=3,
        quando="20/08 (quinta) &middot; 13h30 às 16h",
        coordenacao="Juliana Cristina dos Santos Waichert (Ifes)",
        coord_lines=1,
    ),
    dict(
        slug="workshop-prostec",
        tipo="Workshop",
        titulo="Workshop Pros@tec: Desafios da Educação em Computação e da Informática na Educação",
        titulo_size=50, titulo_lines=3,
        sobre="Pesquisadores apresentam propostas de resposta aos desafios da Educação "
              "em Computação elencados pela SBC.",
        sobre_lines=3,
        quando="20/08 (quinta) &middot; 9h às 12h e 13h30 às 16h",
        coordenacao="Márcia Gonçalves de Oliveira e Rosane Muñoz (Cefor)",
        coord_lines=2,
    ),
    dict(
        slug="educimat-15-anos",
        tipo="Celebração dos 15 anos",
        titulo="EDUCIMAT: 15 anos elaborando produtos, tecendo saberes e modificando vidas",
        titulo_size=60, titulo_lines=3,
        sobre="Celebração dos 15 anos do Educimat, aberta a quem quiser participar.",
        sobre_lines=2,
        quando="20/08 (quinta) &middot; 13h30 às 16h",
        coordenacao="Edmar Reis Thiengo e Ana Raquel S. de M. Garcia (Educimat)",
        coord_lines=2,
    ),
]


def html(body):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{body}</body></html>"


def main():
    which = sys.argv[1:] if len(sys.argv) > 1 else [str(i) for i in range(1, 7)]
    for i, evento in enumerate(EVENTOS, 1):
        if str(i) not in which:
            continue
        p = os.path.join(ROOT, f"card_{i}.html")
        with open(p, "w", encoding="utf-8") as f:
            f.write(html(card(evento)))
        print("html:", p, "-", evento["slug"])


if __name__ == "__main__":
    main()

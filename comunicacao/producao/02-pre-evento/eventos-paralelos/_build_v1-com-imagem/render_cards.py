# -*- coding: utf-8 -*-
"""Renderiza a proposta "v1 com imagem": HTML -> Chrome headless (2x) -> PNG 1080x1350.

Saida: ../cards/proposta-v1-com-imagem/
Grava tambem um preview a 360px de largura, que e o tamanho real em que a arte
aparece no feed de um celular — mesmo criterio da auditoria do _build_v5.
"""
import pathlib
import runpy
import subprocess
import sys

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent
CHROME = pathlib.Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")

EVENTOS = runpy.run_path(str(ROOT / "build_cards.py"))["EVENTOS"]

DESTINO = ROOT.parent / "cards" / "proposta-v1-com-imagem"
PREVIEW = DESTINO / "preview-celular-360px"
BRUTO = ROOT / "_raw"
PREFIXO = "2026-08-10_pre_card_evento-paralelo"
VERSAO = "v1-com-imagem"


def render(i, evento):
    html = ROOT / f"card_{i}_{evento['slug']}.html"
    if not html.exists():
        sys.exit(f"falta {html.name} — rode build_cards.py primeiro")

    bruto = BRUTO / f"_raw_{i}.png"
    final = DESTINO / f"{PREFIXO}-{evento['slug']}_{VERSAO}.png"

    subprocess.run(
        [str(CHROME), "--headless=new", "--disable-gpu", "--hide-scrollbars",
         "--force-device-scale-factor=2", "--window-size=1080,1350",
         "--default-background-color=00000000", "--virtual-time-budget=6000",
         f"--screenshot={bruto}",
         # as_uri() faz o percent-encoding: o repo mora sob "#PROJETOS-CODE-IA",
         # e um "#" cru na URL viraria inicio de fragmento — o Chrome abriria a
         # pasta do usuario e fotografaria o indice do diretorio.
         html.as_uri()],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )

    im = Image.open(bruto).convert("RGB")
    if im.size != (1080, 1350):
        im = im.crop((0, 0, min(im.width, 2160), min(im.height, 2700)))
        im = im.resize((1080, 1350), Image.LANCZOS)
    im.save(final)
    im.resize((360, 450), Image.LANCZOS).save(PREVIEW / f"{evento['slug']}_360.png")
    bruto.unlink()
    print("png:", final.name)
    return final


def contact_sheet(arquivos):
    """Grade dos 6 num arquivo so, para avaliar a familia de uma vez."""
    COL, W, H, PAD, LEG = 3, 340, 425, 16, 22
    lin = (len(arquivos) + COL - 1) // COL
    folha = Image.new("RGB",
                      (COL * W + PAD * (COL + 1), lin * (H + LEG) + PAD * (lin + 1)),
                      "#eceff1")
    desenho = ImageDraw.Draw(folha)
    for i, caminho in enumerate(arquivos):
        c, l = i % COL, i // COL
        x, y = PAD + c * (W + PAD), PAD + l * (H + LEG + PAD)
        folha.paste(Image.open(caminho).resize((W, H), Image.LANCZOS), (x, y))
        rotulo = caminho.name.split("evento-paralelo-")[1].replace(f"_{VERSAO}.png", "")
        desenho.text((x, y + H + 6), rotulo, fill="#37474f")
    saida = DESTINO / "00-preview.png"
    folha.save(saida)
    print("preview:", saida.name, folha.size)


def main():
    for pasta in (DESTINO, PREVIEW, BRUTO):
        pasta.mkdir(parents=True, exist_ok=True)
    quais = sys.argv[1:] or [str(i) for i in range(1, len(EVENTOS) + 1)]
    feitos = [render(i, e) for i, e in enumerate(EVENTOS, 1) if str(i) in quais]
    if len(feitos) == len(EVENTOS):
        contact_sheet(feitos)
    if BRUTO.exists() and not any(BRUTO.iterdir()):
        BRUTO.rmdir()


if __name__ == "__main__":
    main()

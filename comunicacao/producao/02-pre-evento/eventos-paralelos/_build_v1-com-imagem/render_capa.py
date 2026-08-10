# -*- coding: utf-8 -*-
"""Renderiza so a capa do carrossel -> PNG 1080x1350.

Separado do render dos cards de proposito: os cards estao aprovados e este
script nao toca em nenhum deles.
"""
import pathlib
import subprocess
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent
CHROME = pathlib.Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")

DESTINO = ROOT.parent / "cards" / "proposta-v1-com-imagem"
PREVIEW = DESTINO / "preview-celular-360px"
BRUTO = ROOT / "_raw"
SAIDA = "2026-08-10_pre_capa-carrossel-eventos-paralelos.png"


def main():
    html = ROOT / "capa.html"
    if not html.exists():
        sys.exit("falta capa.html — rode build_capa.py primeiro")
    for pasta in (DESTINO, PREVIEW, BRUTO):
        pasta.mkdir(parents=True, exist_ok=True)

    bruto = BRUTO / "_raw_capa.png"
    subprocess.run(
        [str(CHROME), "--headless=new", "--disable-gpu", "--hide-scrollbars",
         "--force-device-scale-factor=2", "--window-size=1080,1350",
         "--default-background-color=00000000", "--virtual-time-budget=6000",
         f"--screenshot={bruto}",
         html.as_uri()],  # as_uri(): o "#" do caminho do repo precisa ir escapado
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )

    im = Image.open(bruto).convert("RGB")
    if im.size != (1080, 1350):
        im = im.crop((0, 0, min(im.width, 2160), min(im.height, 2700)))
        im = im.resize((1080, 1350), Image.LANCZOS)
    im.save(DESTINO / SAIDA)
    im.resize((360, 450), Image.LANCZOS).save(PREVIEW / "00-capa_360.png")
    bruto.unlink()
    if not any(BRUTO.iterdir()):
        BRUTO.rmdir()
    print("png:", SAIDA)


if __name__ == "__main__":
    main()

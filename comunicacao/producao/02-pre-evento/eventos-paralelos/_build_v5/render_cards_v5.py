# -*- coding: utf-8 -*-
"""Renderiza os 7 slides v5 e prévias em escala de celular."""

from __future__ import annotations

import pathlib
import subprocess

from PIL import Image, ImageDraw


ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT.parent / "cards" / "proposta-v5-gradiente"
RAW = ROOT / "_raw"
CHROME = pathlib.Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")

SLIDES = [
    ("slide_01_capa.html", "01-capa-eventos-paralelos.png"),
    ("slide_02_ia-alem-do-chat.html", "02-ia-alem-do-chat.png"),
    ("slide_03_ciencia-delas.html", "03-ciencia-delas.png"),
    ("slide_04_escola-de-inovacao.html", "04-escola-de-inovacao.png"),
    ("slide_05_entre-dois-mundos.html", "05-entre-dois-mundos.png"),
    ("slide_06_workshop-prostec.html", "06-workshop-prostec.png"),
    ("slide_07_educimat-15-anos.html", "07-educimat-15-anos.png"),
]


def render(html_name: str, png_name: str) -> pathlib.Path:
    html_path = ROOT / html_name
    raw_path = RAW / f"raw-{png_name}"
    final_path = OUT / png_name
    subprocess.run(
        [
            str(CHROME), "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--force-device-scale-factor=2", "--window-size=1080,1350",
            "--default-background-color=1f4aa1", "--virtual-time-budget=4000",
            f"--screenshot={raw_path}", html_path.as_uri(),
        ],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    with Image.open(raw_path) as source:
        image = source.convert("RGB")
        if image.size != (1080, 1350):
            image = image.crop((0, 0, min(image.width, 2160), min(image.height, 2700)))
            image = image.resize((1080, 1350), Image.Resampling.LANCZOS)
        image.save(final_path, quality=96)
    raw_path.unlink()
    print("png:", final_path)
    return final_path


def contact_sheet(paths: list[pathlib.Path]) -> pathlib.Path:
    thumb_w, thumb_h = 250, 312
    gap, outer, label_h = 14, 18, 28
    sheet = Image.new("RGB", (1078, 730), "#dce8e7")
    draw = ImageDraw.Draw(sheet)
    for index, path in enumerate(paths):
        with Image.open(path) as source:
            thumb = source.convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        col, row = index % 4, index // 4
        x = outer + col * (thumb_w + gap)
        y = outer + row * (thumb_h + label_h + gap)
        sheet.paste(thumb, (x, y))
        draw.text((x, y + thumb_h + 6), path.stem, fill="#061d45")
    output = OUT / "00-preview-carrossel-v5.png"
    sheet.save(output)
    return output


def mobile_previews(paths: list[pathlib.Path]) -> None:
    # Simula o card a 360 px de largura — escala típica no feed de um celular.
    mobile_dir = OUT / "preview-celular-360px"
    mobile_dir.mkdir(parents=True, exist_ok=True)
    for path in paths:
        with Image.open(path) as source:
            mobile = source.convert("RGB").resize((360, 450), Image.Resampling.LANCZOS)
        mobile.save(mobile_dir / path.name)


def main() -> None:
    if not CHROME.exists():
        raise FileNotFoundError(f"Chrome não encontrado em {CHROME}")
    OUT.mkdir(parents=True, exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    rendered = [render(html_name, png_name) for html_name, png_name in SLIDES]
    contact_sheet(rendered)
    mobile_previews(rendered)
    try:
        RAW.rmdir()
    except OSError:
        pass


if __name__ == "__main__":
    main()

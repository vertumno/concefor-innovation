# -*- coding: utf-8 -*-
"""Renderiza card_N.html -> PNG 1080x1350 via Chrome headless (2x) + downscale Lanczos."""
import os
import subprocess
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUT = os.path.join(ROOT, "_raw")
os.makedirs(OUT, exist_ok=True)

SLUGS = {
    1: "ia-alem-do-chat",
    2: "ciencia-delas",
    3: "escola-de-inovacao",
    4: "entre-dois-mundos",
    5: "workshop-prostec",
    6: "educimat-15-anos",
}

DATA_PREFIX = "2026-08-07_pre_card_evento-paralelo"


def render(i, final_dir):
    html = os.path.join(ROOT, f"card_{i}.html")
    raw = os.path.join(OUT, f"_raw_{i}.png")
    final = os.path.join(final_dir, f"{DATA_PREFIX}-{SLUGS[i]}_v1.png")
    url = "file:///" + html.replace("\\", "/")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                     "--force-device-scale-factor=2", "--window-size=1080,1350",
                     "--default-background-color=00000000",
                     "--virtual-time-budget=4000",
                     f"--screenshot={raw}", url], check=True,
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    im = Image.open(raw).convert("RGB")
    if im.size != (1080, 1350):
        im = im.crop((0, 0, min(im.width, 2160), min(im.height, 2700)))
        im = im.resize((1080, 1350), Image.LANCZOS)
    im.save(final)
    os.remove(raw)
    print("png:", final, im.size)


if __name__ == "__main__":
    final_dir = os.path.join(ROOT, "..", "cards")
    os.makedirs(final_dir, exist_ok=True)
    which = sys.argv[1:] if len(sys.argv) > 1 else [str(i) for i in range(1, 7)]
    for i in range(1, 7):
        if str(i) in which:
            render(i, final_dir)

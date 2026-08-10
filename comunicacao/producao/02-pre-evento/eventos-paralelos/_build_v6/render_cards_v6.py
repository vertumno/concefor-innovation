# -*- coding: utf-8 -*-
"""Reutiliza o render v5 para exportar a proposta v6 em pasta própria."""

from __future__ import annotations

import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parent
V5_RENDER = ROOT.parent / "_build_v5" / "render_cards_v5.py"

spec = importlib.util.spec_from_file_location("concefor_render_v5", V5_RENDER)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Não foi possível carregar {V5_RENDER}")
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)


def main() -> None:
    renderer.ROOT = ROOT
    renderer.OUT = ROOT.parent / "cards" / "proposta-v6-respiro"
    renderer.RAW = ROOT / "_raw"
    renderer.main()
    preview_original = renderer.OUT / "00-preview-carrossel-v5.png"
    preview_v6 = renderer.OUT / "00-preview-eventos-paralelos-v6.png"
    if preview_original.exists():
        preview_original.replace(preview_v6)


if __name__ == "__main__":
    main()

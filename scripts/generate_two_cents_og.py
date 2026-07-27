#!/usr/bin/env python3
"""Generate 2-Cents Open Graph cards (1200×627) from a fixed brand grammar.

Usage:
  .venv-og/bin/python scripts/generate_two_cents_og.py
  .venv-og/bin/python scripts/generate_two_cents_og.py --title "My Title" --out assets/img/two-cents/og-my-slug.png
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "assets" / "img" / "logo_color_clear.png"
OUT_DIR = ROOT / "assets" / "img" / "two-cents"

# Dark-theme tokens (match site CSS)
BG = (15, 23, 42)  # #0f172a
FG = (232, 238, 248)  # #e8eef8
MUTED = (148, 163, 184)  # #94a3b8
ACCENT = (77, 184, 232)  # #4db8e8
RULE = (77, 184, 232)

WIDTH, HEIGHT = 1200, 627
PAD = 64

DEFAULTS = [
    ("Building an Org Monorepo", "og-building-an-org-monorepo.png"),
    ("MLOps Deployment Strategies", "og-mlops-deployment-strategies.png"),
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def logo_for_dark_theme(src: Path, height: int = 88) -> Image.Image:
    """Place color logo on dark backgrounds (preserve navy/red brand mark)."""
    im = Image.open(src).convert("RGBA")
    ratio = height / im.height
    return im.resize((max(1, int(im.width * ratio)), height), Image.Resampling.LANCZOS)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=font) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [text]


def render_card(title: str, out_path: Path) -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)

    # Left accent bar (brand rail)
    draw.rectangle((0, 0, 10, HEIGHT), fill=ACCENT)

    # Logo (top-left)
    logo = logo_for_dark_theme(LOGO_PATH, height=92)
    img.paste(logo, (PAD, PAD - 8), logo)

    # Series label (top-right)
    series_font = load_font(28, bold=True)
    series = "2-Cents"
    series_w = draw.textlength(series, font=series_font)
    draw.text((WIDTH - PAD - series_w, PAD + 18), series, font=series_font, fill=ACCENT)

    # Title (centered block)
    title_font = load_font(64, bold=True)
    max_title_w = WIDTH - PAD * 2
    lines = wrap_text(draw, title, title_font, max_title_w)
    line_h = 74
    block_h = len(lines) * line_h
    y = (HEIGHT - block_h) // 2 - 10
    for line in lines:
        w = draw.textlength(line, font=title_font)
        draw.text(((WIDTH - w) / 2, y), line, font=title_font, fill=FG)
        y += line_h

    # Accent rule under title
    rule_w = 120
    rule_y = y + 8
    draw.rectangle(
        ((WIDTH - rule_w) / 2, rule_y, (WIDTH + rule_w) / 2, rule_y + 4),
        fill=RULE,
    )

    # Footer: author + site
    footer_font = load_font(26, bold=False)
    author = "Amirhessam Tahmassebi"
    site = "amirhessam.com"
    draw.text((PAD, HEIGHT - PAD - 10), author, font=footer_font, fill=MUTED)
    site_w = draw.textlength(site, font=footer_font)
    draw.text((WIDTH - PAD - site_w, HEIGHT - PAD - 10), site, font=footer_font, fill=MUTED)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, format="PNG", optimize=True)
    print(f"wrote {out_path.relative_to(ROOT)} ({WIDTH}x{HEIGHT})")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--title", help="Article title for a single card")
    parser.add_argument("--out", type=Path, help="Output PNG path")
    args = parser.parse_args()

    if args.title:
        out = args.out or (OUT_DIR / "og-custom.png")
        render_card(args.title, out if out.is_absolute() else ROOT / out)
        return

    for title, filename in DEFAULTS:
        render_card(title, OUT_DIR / filename)


if __name__ == "__main__":
    main()

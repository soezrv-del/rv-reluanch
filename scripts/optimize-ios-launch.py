#!/usr/bin/env python3
"""Optimize iOS launch screen + App Icon assets for RVFAX publish."""
from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "ios/App/App/Assets.xcassets"
SPLASH_DIR = ASSETS / "Splash.imageset"
LOGO_DIR = ASSETS / "SplashLogo.imageset"
ICON_DIR = ASSETS / "AppIcon.appiconset"
BRAND = ROOT / "public/assets/brand/icon-rvfax.png"
BG = (5, 5, 8)
SAPPHIRE = (77, 166, 255)


def make_logo_canvas(size: int, pad_ratio: float = 0.18) -> Image.Image:
    src = Image.open(BRAND).convert("RGBA")
    inner = int(size * (1 - 2 * pad_ratio))
    src.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(src, ((size - src.width) // 2, (size - src.height) // 2), src)
    return canvas


def make_launch_frame(w: int, h: int) -> Image.Image:
    """Soft dark field + sapphire glow only. Logo is a separate storyboard layer."""
    im = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(im, "RGBA")
    cx, cy = w // 2, int(h * 0.42)
    max_r = int(max(w, h) * 0.52)
    for i in range(12, 0, -1):
        r = int(max_r * i / 12)
        alpha = int(26 * (i / 12) ** 1.6)
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(SAPPHIRE[0], SAPPHIRE[1], SAPPHIRE[2], alpha),
        )
    for y in range(h - h // 4, h):
        t = (y - (h - h // 4)) / max(1, h // 4)
        draw.line([(0, y), (w, y)], fill=(0, 0, 0, int(40 * t)))
    return im.convert("RGB")


def save_png(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG", optimize=True, compress_level=9)
    print(f"  {path.name}: {path.stat().st_size // 1024}KB {im.size}")


def main() -> None:
    print("== Splash.imageset ==")
    SPLASH_DIR.mkdir(parents=True, exist_ok=True)
    for f in SPLASH_DIR.glob("*"):
        if f.name != "Contents.json":
            f.unlink()

    sizes = {"1x": (428, 926), "2x": (856, 1852), "3x": (1284, 2778)}
    names: dict[str, str] = {}
    for scale, (w, h) in sizes.items():
        name = f"splash@{scale}.png"
        save_png(make_launch_frame(w, h), SPLASH_DIR / name)
        names[scale] = name
    (SPLASH_DIR / "Contents.json").write_text(
        json.dumps(
            {
                "images": [
                    {"idiom": "universal", "filename": names["1x"], "scale": "1x"},
                    {"idiom": "universal", "filename": names["2x"], "scale": "2x"},
                    {"idiom": "universal", "filename": names["3x"], "scale": "3x"},
                ],
                "info": {"version": 1, "author": "xcode"},
            },
            indent=2,
        )
        + "\n"
    )

    print("== SplashLogo.imageset ==")
    if LOGO_DIR.exists():
        shutil.rmtree(LOGO_DIR)
    LOGO_DIR.mkdir(parents=True)
    logo_names: dict[str, str] = {}
    for scale, px in {"1x": 120, "2x": 240, "3x": 360}.items():
        name = f"logo@{scale}.png"
        save_png(make_logo_canvas(px, pad_ratio=0.08), LOGO_DIR / name)
        logo_names[scale] = name
    (LOGO_DIR / "Contents.json").write_text(
        json.dumps(
            {
                "images": [
                    {"idiom": "universal", "filename": logo_names["1x"], "scale": "1x"},
                    {"idiom": "universal", "filename": logo_names["2x"], "scale": "2x"},
                    {"idiom": "universal", "filename": logo_names["3x"], "scale": "3x"},
                ],
                "info": {"version": 1, "author": "xcode"},
            },
            indent=2,
        )
        + "\n"
    )

    print("== AppIcon.appiconset ==")
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    existing = list(ICON_DIR.glob("AppIcon*.png"))
    if existing:
        src = Image.open(existing[0]).convert("RGBA")
    else:
        src = Image.open(BRAND).convert("RGBA")
    src = src.resize((1024, 1024), Image.Resampling.LANCZOS)
    # App Store 1024 icon must not have transparency
    flat = Image.new("RGB", (1024, 1024), BG)
    flat.paste(src, mask=src.split()[-1] if src.mode == "RGBA" else None)
    for f in ICON_DIR.glob("*"):
        if f.name != "Contents.json":
            f.unlink()
    out = ICON_DIR / "AppIcon-1024.png"
    flat.save(out, "PNG", optimize=True, compress_level=9)
    print(f"  AppIcon-1024.png: {out.stat().st_size // 1024}KB")
    (ICON_DIR / "Contents.json").write_text(
        json.dumps(
            {
                "images": [
                    {
                        "filename": "AppIcon-1024.png",
                        "idiom": "universal",
                        "platform": "ios",
                        "size": "1024x1024",
                    }
                ],
                "info": {"author": "xcode", "version": 1},
            },
            indent=2,
        )
        + "\n"
    )

    print("\nTotals:")
    for d in sorted(ASSETS.iterdir()):
        if d.is_dir():
            total = sum(f.stat().st_size for f in d.rglob("*") if f.is_file())
            print(f"  {d.name}: {total // 1024}KB")


if __name__ == "__main__":
    main()

"""Renders store.html into Chrome Web Store images (24-bit PNG, no alpha).

    python store/render.py

Needs Google Chrome (or Edge) and Pillow. Output goes to store/out/.
"""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"
SHOTS = {
    "screenshot-1-type-a-word": ("shot1", 1280, 800),
    "screenshot-2-pick-one": ("shot2", 1280, 800),
    "screenshot-3-colon-search": ("shot3", 1280, 800),
    "screenshot-4-every-emoji": ("shot4", 1280, 800),
    "screenshot-5-features": ("shot5", 1280, 800),
    "small-promo-440x280": ("small", 440, 280),
    "marquee-promo-1400x560": ("marquee", 1400, 560),
}
BROWSERS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "google-chrome",
]


def browser():
    for b in BROWSERS:
        if os.path.exists(b):
            return b
    return BROWSERS[-1]


def main():
    OUT.mkdir(exist_ok=True)
    page = (HERE / "store.html").as_uri()
    only = sys.argv[1:]
    for name, (anchor, w, h) in SHOTS.items():
        if only and anchor not in only:
            continue
        with tempfile.TemporaryDirectory() as profile:
            raw = Path(profile) / "raw.png"
            subprocess.run([
                browser(), "--headless=new", "--disable-gpu", "--hide-scrollbars",
                "--force-device-scale-factor=1", f"--user-data-dir={profile}",
                "--allow-file-access-from-files", "--virtual-time-budget=15000",
                f"--window-size={w},{h}", f"--screenshot={raw}", f"{page}#{anchor}",
            ], check=True, capture_output=True)
            img = Image.open(raw).convert("RGB")  # drop alpha: the store wants 24-bit
            if img.size != (w, h):
                img = img.crop((0, 0, w, h))
            dest = OUT / f"{name}.png"
            img.save(dest, optimize=True)
            print(f"{dest.relative_to(HERE.parent)}  {img.size[0]}x{img.size[1]} {img.mode}")


if __name__ == "__main__":
    main()

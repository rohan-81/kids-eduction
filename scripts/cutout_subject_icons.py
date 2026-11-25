"""
Cuts the 3D subject renders in assets/images/3d_style/new_icon_*.jpg out of their
plain studio backgrounds into transparent PNGs (assets/images/subjects/<name>.png),
so they sit cleanly on the tinted home-screen subject cards.

Background removal: flood fill from the image border through pixels close to the
local background colour, then a 1-2px feather on the cut edge.

Usage (from the project root):
    backend\\venv\\Scripts\\python.exe scripts\\cutout_subject_icons.py .
"""
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path('.').resolve()
SRC = ROOT / 'assets' / 'images' / '3d_style'
OUT = ROOT / 'assets' / 'images' / 'subjects'

SOURCES = {
    'math': 'new_icon_math.jpg',
    'science': 'new_icon_science.jpg',
    'english': 'new_icon_words.jpg',
    'gk': 'new_icon_globe.jpg',
    'logic': 'new_icon_bulb.jpg',
    'brain': 'new_icon_brain.jpg',
}

WORK = 512  # flood-fill resolution
OUT_SIZE = 256


def cutout(path: Path, tol: int = 26) -> Image.Image:
    im = Image.open(path).convert('RGB')
    work = im.resize((WORK, WORK), Image.LANCZOS)
    px = work.load()
    w, h = work.size
    bg = Image.new('L', (w, h), 0)
    bpx = bg.load()

    def close(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2]) <= tol * 3

    q = deque()
    for x in range(w):
        q.append((x, 0, px[x, 0]))
        q.append((x, h - 1, px[x, h - 1]))
    for y in range(h):
        q.append((0, y, px[0, y]))
        q.append((w - 1, y, px[w - 1, y]))
    while q:
        x, y, ref = q.popleft()
        if bpx[x, y]:
            continue
        c = px[x, y]
        # neutral light background only (never eat coloured artwork)
        if not close(c, ref) or max(c) - min(c) > 22 or min(c) < 170:
            continue
        bpx[x, y] = 255
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not bpx[nx, ny]:
                q.append((nx, ny, c))

    alpha = bg.point(lambda v: 255 - v)
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    alpha = alpha.resize(im.size, Image.LANCZOS)
    rgba = im.convert('RGBA')
    rgba.putalpha(alpha)
    bbox = alpha.point(lambda v: 255 if v > 40 else 0).getbbox()
    rgba = rgba.crop(bbox)
    # pad to a square with a little breathing room
    side = int(max(rgba.size) * 1.06)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(rgba, ((side - rgba.width) // 2, (side - rgba.height) // 2))
    return canvas.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for name, file in SOURCES.items():
        cutout(SRC / file).save(OUT / f'{name}.png', 'PNG', optimize=True)
        print('cut out', name)

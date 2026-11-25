"""
Generates the 8 KidsZone storybook covers (640x420 PNG).

Each cover is a painted, soft-shaded scene environment specific to the story
(vineyard pergola, blossom branch + nest, savanna rock + acacia, desert pitcher,
racetrack + finish flag, mango tree + river, crystal stream, enchanted lake +
golden axe) with the project's 3D character PNGs composited in, with contact
shadows, depth-of-field blur on far layers, light bloom and a soft vignette.

Characters and main scene action are centered in the vertical sweet spot (y=70..280)
so that wide book cards, square cards, and readers show the full characters
without any cut-off.

Usage (from the project root):
    python scripts/generate_story_covers.py . [story_xxx_cover.png ...]
Writes to assets/images/stories/ and backend/media/stories/.
"""
import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(sys.argv[1]).resolve()
CHARS = ROOT / 'assets' / 'images' / 'characters'
OUT_DIRS = [ROOT / 'assets' / 'images' / 'stories', ROOT / 'backend' / 'media' / 'stories']

BW, BH = 640, 420
S = 2  # supersampling
W, H = BW * S, BH * S


def P(v):
    return int(round(v * S))


def hexc(h, a=255):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def lerp(c1, c2, t):
    return tuple(int(round(c1[i] + (c2[i] - c1[i]) * t)) for i in range(len(c1)))


def new_layer():
    return Image.new('RGBA', (W, H), (0, 0, 0, 0))


def vgrad(stops, size=(W, H)):
    """Vertical gradient from list of (pos 0..1, '#hex')."""
    w, h = size
    img = Image.new('RGBA', size)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                k = (t - p0) / max(1e-6, p1 - p0)
                d.line([(0, y), (w, y)], fill=lerp(hexc(c0), hexc(c1), k))
                break
    return img


def glow(canvas, cx, cy, r, color, strength=1.0):
    layer = Image.new('L', (W, H), 0)
    ImageDraw.Draw(layer).ellipse([P(cx - r), P(cy - r), P(cx + r), P(cy + r)], fill=int(255 * strength))
    layer = layer.filter(ImageFilter.GaussianBlur(P(r * 0.6)))
    col = Image.new('RGBA', (W, H), hexc(color))
    col.putalpha(layer)
    canvas.alpha_composite(col)


def shadow(canvas, cx, cy, rx, ry, opacity=0.35, blur=6):
    layer = Image.new('L', (W, H), 0)
    ImageDraw.Draw(layer).ellipse([P(cx - rx), P(cy - ry), P(cx + rx), P(cy + ry)], fill=int(255 * opacity))
    layer = layer.filter(ImageFilter.GaussianBlur(P(blur)))
    col = Image.new('RGBA', (W, H), (40, 24, 10, 255))
    col.putalpha(layer)
    canvas.alpha_composite(col)


def ball(w, h, base, light=None, dark=None, steps=16):
    """Soft-shaded 3D ball/ellipsoid sprite (light from upper-left)."""
    base_c = hexc(base)
    light_c = hexc(light) if light else lerp(base_c, (255, 255, 255, 255), 0.55)
    dark_c = hexc(dark) if dark else lerp(base_c, (0, 0, 0, 255), 0.35)
    pw, ph = max(2, P(w)), max(2, P(h))
    img = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i in range(steps):
        t = i / (steps - 1)
        sx = 1 - t * 0.82
        ox = -t * pw * 0.16
        oy = -t * ph * 0.18
        rw, rh = pw / 2 * sx, ph / 2 * sx
        cx, cy = pw / 2 + ox, ph / 2 + oy
        col = lerp(dark_c, base_c, t * 2) if t < 0.5 else lerp(base_c, light_c, (t - 0.5) * 2)
        d.ellipse([cx - rw, cy - rh, cx + rw, cy + rh], fill=col)
    img = img.filter(ImageFilter.GaussianBlur(max(1, min(pw, ph) * 0.05)))
    mask = Image.new('L', (pw, ph), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, pw - 1, ph - 1], fill=255)
    img.putalpha(mask)
    # specular highlight
    spec = Image.new('L', (pw, ph), 0)
    ImageDraw.Draw(spec).ellipse([pw * 0.22, ph * 0.14, pw * 0.42, ph * 0.3], fill=150)
    spec = spec.filter(ImageFilter.GaussianBlur(max(1, min(pw, ph) * 0.05)))
    spec = ImageChops.multiply(spec, mask)
    white = Image.new('RGBA', (pw, ph), (255, 255, 255, 255))
    white.putalpha(spec)
    img.alpha_composite(white)
    return img


def put(canvas, sprite, cx, cy):
    canvas.alpha_composite(sprite, (int(P(cx) - sprite.width / 2), int(P(cy) - sprite.height / 2)))


def put_ball(canvas, cx, cy, w, h, base, light=None, dark=None):
    put(canvas, ball(w, h, base, light, dark), cx, cy)


def bezier(p0, p1, p2, n=60):
    pts = []
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]
        pts.append((x, y))
    return pts


def tube(canvas, pts, width, base, light=None, dark=None, taper=0.0):
    """Rounded 3D-ish tube along points (branches, vines, trunks)."""
    base_c = hexc(base)
    dark_c = hexc(dark) if dark else lerp(base_c, (0, 0, 0, 255), 0.35)
    light_c = hexc(light) if light else lerp(base_c, (255, 255, 255, 255), 0.35)
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    n = len(pts)
    for pass_i, (col, scale, dy) in enumerate([(dark_c, 1.0, 0.12), (base_c, 0.78, 0.0), (light_c, 0.32, -0.22)]):
        for i, (x, y) in enumerate(pts):
            wv = width * (1 - taper * i / max(1, n - 1)) * scale
            r = wv / 2
            yy = y + dy * width
            d.ellipse([P(x - r), P(yy - r), P(x + r), P(yy + r)], fill=col)
    layer = layer.filter(ImageFilter.GaussianBlur(P(0.6)))
    canvas.alpha_composite(layer)


def hills(canvas, base_y, amp, color, phase=0.0, freq=1.0, light=None):
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    pts = [(0, H)]
    for x in range(0, BW + 4, 4):
        y = base_y + amp * math.sin((x / BW) * math.pi * 2 * freq + phase) + amp * 0.4 * math.sin((x / BW) * math.pi * 5 * freq + phase * 2)
        pts.append((P(x), P(y)))
    pts.append((W, H))
    d.polygon(pts, fill=hexc(color))
    if light:
        rim = new_layer()
        ImageDraw.Draw(rim).line(pts[1:-1], fill=hexc(light, 200), width=P(3))
        rim = rim.filter(ImageFilter.GaussianBlur(P(2)))
        layer.alpha_composite(rim)
        mask = layer.split()[3]
        layer.putalpha(mask)
    canvas.alpha_composite(layer)


def cloud(canvas, cx, cy, s=1.0):
    for dx, dy, r in [(-34, 6, 22), (-10, -6, 28), (18, -2, 24), (40, 8, 18), (0, 10, 24)]:
        put_ball(canvas, cx + dx * s, cy + dy * s, r * 2 * s, r * 1.8 * s, '#F8FBFF', '#FFFFFF', '#D6E4F5')


def sparkle(canvas, cx, cy, r, color='#FFFFFF', alpha=230):
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    c = hexc(color, alpha)
    pts = [(cx, cy - r), (cx + r * 0.22, cy - r * 0.22), (cx + r, cy), (cx + r * 0.22, cy + r * 0.22),
           (cx, cy + r), (cx - r * 0.22, cy + r * 0.22), (cx - r, cy), (cx - r * 0.22, cy - r * 0.22)]
    d.polygon([(P(x), P(y)) for x, y in pts], fill=c)
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(P(0.4))))
    glow(canvas, cx, cy, r * 0.9, color, 0.35)


def grass_tufts(canvas, y0, y1, colors, count=60, seed=1):
    rnd = random.Random(seed)
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        x = rnd.uniform(0, BW)
        y = rnd.uniform(y0, y1)
        h = rnd.uniform(6, 14) * (0.6 + (y - y0) / max(1, y1 - y0))
        col = hexc(rnd.choice(colors))
        for k in (-1, 0, 1):
            d.polygon([(P(x + k * 3 - 1.5), P(y)), (P(x + k * 3 + 1.5), P(y)), (P(x + k * 5), P(y - h))], fill=col)
    canvas.alpha_composite(layer)


def flowers(canvas, y0, y1, colors, count=14, seed=3):
    rnd = random.Random(seed)
    for _ in range(count):
        x = rnd.uniform(10, BW - 10)
        y = rnd.uniform(y0, y1)
        col = rnd.choice(colors)
        for a in range(5):
            ang = a / 5 * math.pi * 2
            put_ball(canvas, x + math.cos(ang) * 4, y + math.sin(ang) * 4, 6, 6, col)
        put_ball(canvas, x, y, 5, 5, '#FDE047')


def strip_ground_plate(im, band=0.14):
    """Removes the baked-in white 'floor' under a character."""
    w, h = im.size
    px = im.load()
    y_min = int(h * (1 - band))

    def whiteish(p):
        r, g, b, a = p
        return a > 0 and min(r, g, b) > 205 and max(r, g, b) - min(r, g, b) < 28

    stack = []
    for y in range(y_min, h):
        for x in range(w):
            if px[x, y][3] <= 24:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and y_min <= ny < h and whiteish(px[nx, ny]):
                        stack.append((nx, ny))
    seen = set()
    while stack:
        x, y = stack.pop()
        if (x, y) in seen:
            continue
        seen.add((x, y))
        if not whiteish(px[x, y]):
            continue
        r, g, b, a = px[x, y]
        px[x, y] = (r, g, b, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and y_min <= ny < h and (nx, ny) not in seen:
                stack.append((nx, ny))
    alpha = im.split()[3].filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))
    im.putalpha(alpha)
    return im


_char_cache = {}


def character(name, height, flip=False):
    key = (name, height, flip)
    if key in _char_cache:
        return _char_cache[key]
    im = Image.open(CHARS / f'3d_{name}.png').convert('RGBA')
    bbox = im.split()[3].point(lambda a: 255 if a > 24 else 0).getbbox()
    im = im.crop(bbox)
    im = strip_ground_plate(im)
    bbox = im.split()[3].point(lambda a: 255 if a > 24 else 0).getbbox()
    im = im.crop(bbox)
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    ph = P(height)
    pw = int(im.width * ph / im.height)
    im = im.resize((pw, ph), Image.LANCZOS)
    _char_cache[key] = im
    return im


def place(canvas, name, cx, ground_y, height, flip=False, shadow_w=None, shadow_op=0.38):
    im = character(name, height, flip)
    w = im.width / S
    shadow(canvas, cx, ground_y - 2, (shadow_w or w * 0.42), max(4, height * 0.045), shadow_op, blur=5)
    canvas.alpha_composite(im, (int(P(cx) - im.width / 2), int(P(ground_y) - im.height)))
    return w


def finish(canvas, warm='#FFF3D6'):
    blurred = canvas.filter(ImageFilter.GaussianBlur(P(10)))
    bloom = Image.blend(canvas, blurred, 0.5)
    canvas = Image.blend(canvas, ImageChops.screen(canvas, bloom), 0.18)
    tint = Image.new('RGBA', (W, H), hexc(warm))
    canvas = Image.blend(canvas, ImageChops.multiply(canvas, tint), 0.12)
    vig = Image.new('L', (W, H), 0)
    ImageDraw.Draw(vig).ellipse([-P(80), -P(60), W + P(80), H + P(60)], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(P(60)))
    dark = Image.new('RGBA', (W, H), (30, 20, 10, 255))
    inv = ImageChops.invert(vig).point(lambda v: int(v * 0.42))
    dark.putalpha(inv)
    canvas.alpha_composite(dark)
    return canvas.resize((BW, BH), Image.LANCZOS).convert('RGB')


def dof(layer, radius=3.5):
    return layer.filter(ImageFilter.GaussianBlur(P(radius)))


# ---------------------------------------------------------------- scenes

def scene_fox_grapes():
    bg = vgrad([(0, '#5FB8F5'), (0.55, '#BFE6FF'), (1, '#E8F8FF')])
    glow(bg, 570, 50, 70, '#FFF6C2', 0.9)
    put_ball(bg, 570, 50, 46, 46, '#FFE27A', '#FFFBE0', '#FFC53D')
    cloud(bg, 130, 60, 0.9)
    cloud(bg, 360, 45, 0.7)
    hills(bg, 190, 12, '#9ADB8A', 0.4, 1.0, '#D7F5C8')
    for x in range(10, BW, 46):
        put_ball(bg, x, 200, 40, 26, '#6CC067', '#A6E39A', '#3E8E46')
    bg = dof(bg, 3.0)
    c = bg
    hills(c, 240, 8, '#6CCB5F', 1.2, 0.8, '#B7F0A6')
    c.alpha_composite(vgrad([(0, '#59B94C'), (1, '#3E9A3A')], (W, H - P(255))), (0, P(255)))
    # pergola posts
    for px in (318, 610):
        tube(c, [(px, y) for y in range(45, 290, 3)], 18, '#B07443', '#D9A06A', '#7A4A24')
        shadow(c, px, 290, 16, 5, 0.35, 3)
    # cross beams
    tube(c, [(x, 50) for x in range(290, 640, 3)], 20, '#B87A47', '#E0AB75', '#7A4A24')
    tube(c, [(x, 70) for x in range(300, 640, 3)], 12, '#9C6434', '#C98D56', '#6A3E1C')
    # vine leaves along beam
    rnd = random.Random(7)
    for x in range(296, 640, 16):
        put_ball(c, x + rnd.uniform(-4, 4), 44 + rnd.uniform(-8, 8), 30, 24, '#4DB04A', '#9BE38B', '#2F7A33')
    # grape bunches
    for bx, by, rows in ((380, 72, 5), (468, 74, 6), (555, 70, 5)):
        tube(c, [(bx, by - 8 + i) for i in range(12)], 4, '#6B8E23')
        for r in range(rows):
            n = rows - r
            for k in range(n):
                gx = bx + (k - (n - 1) / 2) * 13
                gy = by + 8 + r * 12
                put_ball(c, gx, gy, 15, 15, '#7C3AED', '#C4B5FD', '#3B0764')
        put_ball(c, bx - 14, by + 2, 22, 16, '#4DB04A', '#9BE38B', '#2F7A33')
    grass_tufts(c, 265, 415, ['#3E9A3A', '#6CCB5F', '#2F7A33'], 90, 11)
    flowers(c, 280, 400, ['#F43F5E', '#F59E0B', '#FFFFFF'], 10, 5)
    # Fox placed centered and standing proudly on ground
    place(c, 'fox', 195, 275, 195)
    for (x, y, r) in ((300, 100, 8), (440, 160, 6), (250, 45, 7)):
        sparkle(c, x, y, r)
    return c


def scene_kind_sparrow():
    bg = vgrad([(0, '#8CCBFF'), (0.6, '#DDEBFF'), (1, '#FFE7EC')])
    glow(bg, 110, 65, 90, '#FFF4C7', 0.9)
    cloud(bg, 470, 55, 0.8)
    rnd = random.Random(4)
    for _ in range(40):
        put_ball(bg, rnd.uniform(0, BW), rnd.uniform(160, 250), rnd.uniform(30, 60), rnd.uniform(26, 50), '#F9A8D4', '#FFE4F1', '#E879B9')
    hills(bg, 270, 10, '#A7E3A0', 0.3, 1.0)
    bg = dof(bg, 5.0)
    c = bg
    # main branch centered
    pts = bezier((-20, 260), (300, 225), (660, 270), 90)
    tube(c, pts, 26, '#8B5A33', '#C08A5B', '#5C3A1E', taper=0.35)
    twig = bezier((380, 245), (430, 185), (520, 155), 40)
    tube(c, twig, 10, '#8B5A33', '#C08A5B', '#5C3A1E', taper=0.5)
    rnd = random.Random(9)
    for (x, y) in pts[::7] + twig[::6]:
        put_ball(c, x + rnd.uniform(-12, 12), y - rnd.uniform(14, 28), 22, 14, '#5BBF5A', '#A7F0A0', '#2F8A3A')
    for (x, y) in pts[::5] + twig[::4]:
        bx, by = x + rnd.uniform(-16, 16), y - rnd.uniform(10, 36)
        for a in range(5):
            ang = a / 5 * math.pi * 2 + rnd.uniform(0, 1)
            put_ball(c, bx + math.cos(ang) * 7, by + math.sin(ang) * 7, 13, 13, '#F9A8D4', '#FFF1F8', '#EC4899')
        put_ball(c, bx, by, 7, 7, '#FDE047', '#FFFBEB', '#F59E0B')
    # nest
    shadow(c, 455, 248, 64, 8, 0.4, 4)
    put_ball(c, 455, 230, 136, 54, '#A16B3B', '#D8A877', '#5C3A1E')
    put_ball(c, 455, 217, 108, 26, '#5C3A1E', '#7A4A24', '#3B2410')
    for i, ex in enumerate((432, 456, 480)):
        put_ball(c, ex, 210 - (i % 2) * 3, 24, 30, '#FCD98B', '#FFF8E1', '#E0A93B')
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for k in range(26):
        x0 = 395 + k * 4.6
        d.arc([P(x0 - 18), P(212), P(x0 + 18), P(248)], 20, 160, fill=hexc('#E3B47C'), width=P(2))
    c.alpha_composite(layer)
    # sparrow perched on the branch right by her nest
    place(c, 'sparrow', 215, 235, 155, shadow_op=0.3)
    for (x, y, r) in ((330, 80, 7), (560, 95, 6), (90, 140, 6)):
        sparkle(c, x, y, r)
    return c


def scene_lion_mouse():
    bg = vgrad([(0, '#FDBA74'), (0.45, '#FDE68A'), (0.75, '#FFF3C4'), (1, '#F8D98B')])
    glow(bg, 320, 160, 140, '#FFF1B8', 1.0)
    put_ball(bg, 320, 160, 105, 105, '#FFD45C', '#FFF7D1', '#FFB224')
    hills(bg, 205, 10, '#E5B85C', 0.6, 1.2, '#FFE3A1')
    hills(bg, 230, 8, '#D49A3E', 2.0, 0.9)
    bg = dof(bg, 3.5)
    c = bg
    # acacia tree
    tube(c, bezier((540, 260), (530, 190), (500, 120), 50), 18, '#7A4A24', '#A8703F', '#4A2C14', taper=0.3)
    tube(c, bezier((528, 175), (570, 150), (610, 128), 30), 10, '#7A4A24', '#A8703F', '#4A2C14', taper=0.4)
    rnd = random.Random(2)
    for x in range(420, 650, 18):
        put_ball(c, x, 115 + rnd.uniform(-10, 8), 46, 26, '#5E9F3A', '#A6D77A', '#33641F')
    c.alpha_composite(vgrad([(0, '#D9A94E'), (1, '#B9822E')], (W, H - P(255))), (0, P(255)))
    grass_tufts(c, 255, 415, ['#C99A3E', '#E8C46A', '#A87628'], 110, 6)
    # warm rock ledge centered vertically
    shadow(c, 290, 310, 220, 16, 0.4, 8)
    put_ball(c, 290, 275, 440, 110, '#C98A5A', '#F3C79A', '#7E4F2E')
    put_ball(c, 470, 285, 150, 75, '#B97B4C', '#E9B987', '#744628')
    put_ball(c, 110, 290, 90, 48, '#A96F43', '#DDAA7A', '#6A3F22')
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for (x0, y0, x1, y1) in ((150, 285, 190, 305), (300, 295, 330, 315), (420, 280, 446, 300)):
        d.line([(P(x0), P(y0)), (P((x0 + x1) / 2 + 6), P((y0 + y1) / 2)), (P(x1), P(y1))], fill=hexc('#7E4F2E', 150), width=P(2))
    c.alpha_composite(layer.filter(ImageFilter.GaussianBlur(P(0.8))))
    grass_tufts(c, 245, 258, ['#9DB84A', '#C9D96A'], 14, 41)
    # Lion and mouse standing clearly on rock ledge
    place(c, 'lion', 205, 255, 195, shadow_w=70)
    place(c, 'mouse', 355, 257, 86, flip=True, shadow_w=30)
    for (x, y, r) in ((130, 65, 7), (420, 55, 6), (300, 105, 5)):
        sparkle(c, x, y, r, '#FFFBEB')
    return c


def scene_crow():
    bg = vgrad([(0, '#56B6F2'), (0.55, '#BEE6FF'), (1, '#FFEFC7')])
    glow(bg, 530, 60, 90, '#FFF3B0', 1.0)
    put_ball(bg, 530, 60, 58, 58, '#FFE680', '#FFFDE8', '#FFC233')
    hills(bg, 195, 18, '#F6D58E', 0.2, 0.8, '#FFF0C8')
    # oasis
    put_ball(bg, 90, 215, 120, 16, '#38BDF8', '#BAE6FD', '#0284C7')
    tube(bg, bezier((70, 215), (66, 175), (80, 145), 30), 6, '#8B5A33')
    for a in range(6):
        ang = -math.pi / 2 + (a - 2.5) * 0.5
        tube(bg, bezier((80, 145), (80 + math.cos(ang) * 22, 138 + math.sin(ang) * 10), (80 + math.cos(ang) * 38, 152 + math.sin(ang) * 6), 20), 7, '#3FA34D', taper=0.6)
    bg = dof(bg, 3.0)
    c = bg
    hills(c, 242, 14, '#F2C26B', 1.4, 0.7, '#FFE2A6')
    c.alpha_composite(vgrad([(0, '#F0BD62'), (1, '#DFA046')], (W, H - P(255))), (0, P(255)))
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for k in range(9):
        y = 265 + k * 9
        d.arc([P(-40 + k * 30), P(y), P(260 + k * 40), P(y + 20)], 190, 350, fill=hexc('#FBD891', 160), width=P(2))
    c.alpha_composite(layer.filter(ImageFilter.GaussianBlur(P(0.8))))
    # pitcher
    shadow(c, 420, 285, 74, 12, 0.42, 6)
    put_ball(c, 420, 225, 136, 126, '#C8643B', '#F3A77A', '#7C3417')
    tube(c, [(420, y) for y in range(145, 175)], 52, '#C0592F', '#E8946A', '#7C3417')
    put_ball(c, 420, 145, 78, 24, '#D9774C', '#F7B48D', '#8A3C1D')
    put_ball(c, 420, 145, 58, 15, '#0EA5E9', '#BAE6FD', '#075985')
    tube(c, bezier((485, 180), (520, 210), (485, 245), 40), 9, '#B9542B', '#E68E64', '#6F2E14')
    layer = new_layer()
    ImageDraw.Draw(layer).arc([P(365), P(208), P(475), P(235)], 10, 170, fill=hexc('#FBE3C9', 170), width=P(4))
    c.alpha_composite(layer.filter(ImageFilter.GaussianBlur(P(0.8))))
    # pebbles
    rnd = random.Random(5)
    for (x, y) in ((320, 275), (340, 285), (510, 278), (530, 288), (305, 290), (495, 292)):
        put_ball(c, x, y, rnd.uniform(16, 24), rnd.uniform(11, 15), rnd.choice(['#A8A29E', '#D6D3D1', '#94A3B8']))
    # Crow standing next to pitcher
    place(c, 'crow', 200, 275, 175)
    for (x, y, r) in ((440, 160, 6), (398, 162, 4), (290, 85, 6)):
        sparkle(c, x, y, r)
    return c


def scene_tortoise_hare():
    bg = vgrad([(0, '#4FB3F5'), (0.6, '#BCE5FF'), (1, '#E6F8FF')])
    glow(bg, 90, 50, 70, '#FFF6C2', 0.8)
    cloud(bg, 260, 50, 0.9)
    cloud(bg, 520, 65, 0.8)
    hills(bg, 185, 16, '#93DB7E', 0.4, 1.0, '#D8F7C8')
    rnd = random.Random(8)
    for x in range(0, BW, 70):
        put_ball(bg, x + rnd.uniform(-10, 10), 180, 60, 50, '#4FAE4C', '#95DF86', '#2F7A33')
    bg = dof(bg, 3.5)
    c = bg
    hills(c, 230, 10, '#6CCB5F', 0.8, 0.8, '#B7F0A6')
    c.alpha_composite(vgrad([(0, '#5CC250'), (1, '#3E9A3A')], (W, H - P(240))), (0, P(240)))
    # racetrack band
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    top = bezier((-20, 250), (320, 230), (660, 245), 80)
    bot = bezier((660, 345), (320, 325), (-20, 350), 80)
    d.polygon([(P(x), P(y)) for x, y in top + bot], fill=hexc('#E7C08A'))
    c.alpha_composite(layer)
    for line in (bezier((-20, 275), (320, 255), (660, 272), 80), bezier((-20, 315), (320, 295), (660, 312), 80)):
        for i, (x, y) in enumerate(line):
            if (i // 4) % 2 == 0:
                put_ball(c, x, y, 10, 4, '#FFFFFF', '#FFFFFF', '#F1F5F9')
    # checkered finish flag
    tube(c, [(568, y) for y in range(95, 265, 3)], 9, '#E2E8F0', '#FFFFFF', '#94A3B8')
    put_ball(c, 568, 93, 16, 16, '#F59E0B', '#FEF3C7', '#B45309')
    flag = new_layer()
    d = ImageDraw.Draw(flag)
    cell = 13
    for r in range(4):
        for k in range(6):
            col = '#1E293B' if (r + k) % 2 == 0 else '#FFFFFF'
            x0 = 572 + k * cell
            wave = 4 * math.sin(k * 0.9)
            d.polygon([(P(x0), P(102 + r * cell + wave)), (P(x0 + cell), P(102 + r * cell + 4 * math.sin((k + 1) * 0.9))),
                       (P(x0 + cell), P(102 + (r + 1) * cell + 4 * math.sin((k + 1) * 0.9))), (P(x0), P(102 + (r + 1) * cell + wave))],
                      fill=hexc(col))
    c.alpha_composite(flag)
    shadow(c, 568, 265, 14, 4, 0.35, 3)
    grass_tufts(c, 240, 255, ['#3E9A3A', '#6CCB5F'], 60, 2)
    grass_tufts(c, 345, 415, ['#3E9A3A', '#6CCB5F'], 50, 3)
    flowers(c, 230, 250, ['#F43F5E', '#FDE047', '#FFFFFF', '#8B5CF6'], 12, 9)
    # Tortoise and hare racing across track
    place(c, 'tortoise', 200, 260, 130)
    place(c, 'hare', 370, 250, 170)
    for (x, y, r) in ((140, 105, 6), (470, 105, 7)):
        sparkle(c, x, y, r)
    return c


def scene_monkey_crocodile():
    bg = vgrad([(0, '#48B5F0'), (0.6, '#BDEBFF'), (1, '#DDF7FF')])
    cloud(bg, 470, 50, 0.85)
    glow(bg, 600, 35, 60, '#FFF6C2', 0.8)
    rnd = random.Random(12)
    for x in range(260, BW + 40, 46):
        put_ball(bg, x, 185 + rnd.uniform(-10, 10), 70, 60, '#2FA36B', '#7EE0A8', '#17663F')
    bg = dof(bg, 4.0)
    c = bg
    # river
    c.alpha_composite(vgrad([(0, '#5EEAD4'), (0.4, '#22C1C3'), (1, '#0E8FA8')], (W, H - P(215))), (0, P(215)))
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    rnd = random.Random(3)
    for _ in range(26):
        x, y = rnd.uniform(0, BW), rnd.uniform(230, 410)
        wv = rnd.uniform(20, 50)
        d.arc([P(x - wv), P(y - 4), P(x + wv), P(y + 4)], 200, 340, fill=hexc('#E0FFFB', 190), width=P(2))
    c.alpha_composite(layer.filter(ImageFilter.GaussianBlur(P(0.6))))
    # riverbank left
    put_ball(c, 70, 240, 260, 90, '#7CC56B', '#BDF0A8', '#3E8E46')
    # mango tree
    tube(c, bezier((70, 250), (60, 160), (90, 60), 60), 34, '#7A4A24', '#A8703F', '#4A2C14', taper=0.4)
    tube(c, bezier((80, 140), (200, 120), (330, 150), 70), 16, '#7A4A24', '#A8703F', '#4A2C14', taper=0.45)
    for (x, y, w, h) in ((60, 50, 150, 100), (150, 45, 140, 90), (240, 85, 130, 76), (30, 115, 100, 80), (320, 125, 80, 50)):
        put_ball(c, x, y, w, h, '#2E9E4F', '#7FDB8E', '#15602C')
    for (x, y) in ((110, 85), (180, 70), (250, 115), (60, 135), (300, 140), (205, 55)):
        tube(c, [(x, y - 14 + i) for i in range(8)], 2.5, '#5B7F2A')
        put_ball(c, x, y, 20, 24, '#FDBA35', '#FFF1B0', '#EA7A16')
    # Monkey sitting in mango tree
    place(c, 'monkey', 195, 145, 135, shadow_op=0.0)
    # Crocodile in river - perfectly visible
    croc = character('crocodile', 135, flip=True)
    cx, gy = 440, 305
    shadow(c, cx, gy - 24, 85, 10, 0.25, 6)
    c.alpha_composite(croc, (int(P(cx) - croc.width / 2), int(P(gy) - croc.height)))
    layer = new_layer()
    ImageDraw.Draw(layer).arc([P(cx - 100), P(270), P(cx + 100), P(288)], 0, 180, fill=hexc('#E0FFFB', 220), width=P(3))
    c.alpha_composite(layer.filter(ImageFilter.GaussianBlur(P(0.8))))
    for (x, y, r) in ((560, 240, 7), (380, 270, 5), (420, 65, 6)):
        sparkle(c, x, y, r)
    return c


def scene_ant_dove():
    bg = vgrad([(0, '#9AD9FF'), (0.5, '#D9F4FF'), (1, '#EFFFF8')])
    glow(bg, 500, 50, 90, '#FFF8D6', 0.9)
    rnd = random.Random(21)
    for x in range(-20, BW + 40, 50):
        tube(bg, [(x + 6, y) for y in range(110, 220, 4)], 12, '#8B6A4A')
        put_ball(bg, x, 110 + rnd.uniform(-20, 10), 90, 110, '#3FAF6B', '#8EE6AE', '#1E7444')
    bg = dof(bg, 5.0)
    c = bg
    put_ball(c, 320, 215, 760, 60, '#6CCB7A', '#B5F2BE', '#3E9A4E')
    # crystal stream
    c.alpha_composite(vgrad([(0, '#A5F3FC'), (0.5, '#67D8EF'), (1, '#38B6DC')], (W, H - P(225))), (0, P(225)))
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    rnd = random.Random(7)
    for _ in range(30):
        x, y = rnd.uniform(0, BW), rnd.uniform(235, 410)
        wv = rnd.uniform(18, 46)
        d.arc([P(x - wv), P(y - 4), P(x + wv), P(y + 4)], 200, 340, fill=hexc('#FFFFFF', 200), width=P(2))
    c.alpha_composite(layer.filter(ImageFilter.GaussianBlur(P(0.6))))
    for (x, y) in ((80, 360), (560, 365), (600, 340), (300, 370)):
        put_ball(c, x, y, 34, 16, '#9CC9D9', '#D9F3FA', '#5E8FA3')
    # mossy rock + dove
    shadow(c, 175, 290, 100, 12, 0.3, 6)
    put_ball(c, 175, 265, 210, 96, '#94A3B8', '#E2E8F0', '#475569')
    put_ball(c, 168, 235, 160, 34, '#5DBB63', '#A7F0A0', '#2F7A33')
    place(c, 'dove', 175, 245, 165, shadow_op=0.3)
    # floating leaf + ant
    shadow(c, 445, 305, 70, 7, 0.22, 4)
    put_ball(c, 445, 295, 150, 40, '#34C759', '#A7F3B5', '#15803D')
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    d.line([(P(375), P(295)), (P(515), P(293))], fill=hexc('#BBF7D0'), width=P(2))
    for k in range(5):
        x = 390 + k * 26
        d.line([(P(x), P(294)), (P(x + 14), P(283))], fill=hexc('#BBF7D0'), width=P(1.5))
        d.line([(P(x), P(294)), (P(x + 14), P(305))], fill=hexc('#BBF7D0'), width=P(1.5))
    c.alpha_composite(layer)
    layer = new_layer()
    ImageDraw.Draw(layer).ellipse([P(360), P(285), P(530), P(315)], outline=hexc('#E0FFFF', 200), width=P(2))
    c.alpha_composite(layer.filter(ImageFilter.GaussianBlur(P(1))))
    place(c, 'ant', 445, 295, 80, shadow_op=0.25)
    for (x, y, r) in ((340, 260, 6), (580, 270, 7), (260, 85, 6), (430, 120, 5)):
        sparkle(c, x, y, r)
    return c


def scene_woodcutter():
    bg = vgrad([(0, '#0F766E'), (0.45, '#34A88C'), (1, '#A7E8C9')])
    rnd = random.Random(31)
    for x in range(-20, BW + 40, 44):
        tube(bg, [(x + 4, y) for y in range(40, 240, 4)], 16 + rnd.uniform(-4, 6), '#5B4636', '#8A6E55', '#3A2B20')
    for x in range(-40, BW + 60, 60):
        put_ball(bg, x, 45 + rnd.uniform(-30, 20), 140, 120, '#167A55', '#4BC48E', '#0B4E35')
    bg = dof(bg, 5.5)
    c = bg
    # light rays
    rays = new_layer()
    d = ImageDraw.Draw(rays)
    for x0 in (180, 300, 430, 540):
        d.polygon([(P(x0), 0), (P(x0 + 40), 0), (P(x0 + 140), H), (P(x0 + 40), H)], fill=(255, 250, 210, 46))
    c.alpha_composite(rays.filter(ImageFilter.GaussianBlur(P(10))))
    # mossy ground
    put_ball(c, 320, 275, 900, 120, '#4CAF50', '#9BE59E', '#2E7D32')
    c.alpha_composite(vgrad([(0, '#4CAF50'), (1, '#2E7D32')], (W, H - P(285))), (0, P(285)))
    # crystal lake
    shadow(c, 445, 275, 170, 22, 0.25, 8)
    put_ball(c, 445, 265, 340, 70, '#38D5F2', '#E0FBFF', '#0A93B8')
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    for k in range(6):
        d.arc([P(345 + k * 26), P(255 + (k % 2) * 6), P(405 + k * 26), P(265 + (k % 2) * 6)], 200, 340, fill=hexc('#FFFFFF', 210), width=P(2))
    c.alpha_composite(layer.filter(ImageFilter.GaussianBlur(P(0.6))))
    for (x, y) in ((280, 290), (300, 300), (610, 285), (620, 300)):
        put_ball(c, x, y, 30, 18, '#A8A29E', '#E7E5E4', '#57534E')
    # golden axe floating and glowing above the lake
    glow(c, 450, 150, 80, '#FFE27A', 0.9)
    tube(c, bezier((432, 212), (446, 164), (460, 90), 40), 10, '#E8B23A', '#FFF3B0', '#9A6416')
    blade_pts = [(450, 100), (480, 96)]
    for k in range(21):
        ang = -1.05 + k * 2.1 / 20
        blade_pts.append((486 + math.cos(ang) * 44, 116 + math.sin(ang) * 44))
    blade_pts += [(480, 136), (450, 130)]
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).polygon([(P(x), P(y)) for x, y in blade_pts], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(P(0.5)))
    gold_crop = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    band = vgrad([(0, '#FFF7C2'), (0.35, '#FDE047'), (0.7, '#F59E0B'), (1, '#C2690C')], (W, P(98)))
    gold_crop.paste(band, (0, P(68)))
    gold_crop.putalpha(mask)
    c.alpha_composite(gold_crop)
    edge = new_layer()
    ImageDraw.Draw(edge).arc([P(442), P(72), P(530), P(160)], -60, 60, fill=hexc('#FFFDE7', 235), width=P(3))
    c.alpha_composite(edge.filter(ImageFilter.GaussianBlur(P(0.8))))
    put_ball(c, 458, 114, 24, 40, '#F2B630', '#FFF3B0', '#9A6416')
    for (x, y, r) in ((410, 120, 7), (530, 70, 8), (500, 170, 6), (440, 70, 5), (580, 150, 6)):
        sparkle(c, x, y, r, '#FFF7C2')
    grass_tufts(c, 290, 415, ['#2E7D32', '#4CAF50', '#81C784'], 100, 17)
    flowers(c, 300, 400, ['#F9A8D4', '#FFFFFF', '#FDE047'], 10, 4)
    # Woodcutter standing and looking in wonder at the axe
    place(c, 'woodcutter', 185, 280, 195)
    return c


SCENES = {
    'story_fox_grapes_cover.png': (scene_fox_grapes, []),
    'story_kind_sparrow_cover.png': (scene_kind_sparrow, ['story_sparrow_cover.png']),
    'story_lion_mouse_cover.png': (scene_lion_mouse, []),
    'story_crow_cover.png': (scene_crow, []),
    'story_tortoise_hare_cover.png': (scene_tortoise_hare, []),
    'story_monkey_crocodile_cover.png': (scene_monkey_crocodile, []),
    'story_ant_dove_cover.png': (scene_ant_dove, []),
    'story_woodcutter_cover.png': (scene_woodcutter, ['story_honest_woodcutter_cover.png']),
}

if __name__ == '__main__':
    only = sys.argv[2:]
    for out_dir in OUT_DIRS:
        out_dir.mkdir(parents=True, exist_ok=True)
    for name, (fn, aliases) in SCENES.items():
        if only and name not in only:
            continue
        img = finish(fn())
        for out_dir in OUT_DIRS:
            for target in [name] + aliases:
                img.save(out_dir / target, 'PNG', optimize=True)
        print('generated', name, img.size, 'aliases:', aliases)

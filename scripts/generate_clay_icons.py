"""
Generates KidsZone's 3D clay-style icon pack (256x256 transparent PNG) for the
AI Magic Story Maker: companions, quest badges, magic tools and header art.

Every shape is soft-shaded like a clay toy (diagonal key light, darker rim,
glossy specular highlight) and each finished icon gets a soft drop shadow.

Usage (from the project root):
    backend\\venv\\Scripts\\python.exe scripts\\generate_clay_icons.py . [name ...]
Writes to assets/images/magic/<name>.png
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path('.').resolve()
OUT = ROOT / 'assets' / 'images' / 'magic'

SIZE = 256
SS = 4
W = SIZE * SS


def P(v):
    return int(round(v * SS))


def hexc(h, a=255):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def mix(c1, c2, t):
    return tuple(int(round(c1[i] + (c2[i] - c1[i]) * t)) for i in range(4))


WHITE = (255, 255, 255, 255)
BLACK = (0, 0, 0, 255)


# ------------------------------------------------------------------ masks

def m_new():
    return Image.new('L', (W, W), 0)


def m_ellipse(cx, cy, rx, ry, angle=0):
    m = m_new()
    ImageDraw.Draw(m).ellipse([P(cx - rx), P(cy - ry), P(cx + rx), P(cy + ry)], fill=255)
    if angle:
        m = m.rotate(angle, resample=Image.BICUBIC, center=(P(cx), P(cy)))
    return m


def m_poly(points):
    m = m_new()
    ImageDraw.Draw(m).polygon([(P(x), P(y)) for x, y in points], fill=255)
    return m


def m_rrect(x0, y0, x1, y1, r):
    m = m_new()
    ImageDraw.Draw(m).rounded_rectangle([P(x0), P(y0), P(x1), P(y1)], radius=P(r), fill=255)
    return m


def m_tube(points, width, taper=0.0):
    m = m_new()
    d = ImageDraw.Draw(m)
    n = len(points)
    for i, (x, y) in enumerate(points):
        r = width / 2 * (1 - taper * i / max(1, n - 1))
        d.ellipse([P(x - r), P(y - r), P(x + r), P(y + r)], fill=255)
    return m


def m_union(*ms):
    out = ms[0]
    for m in ms[1:]:
        out = ImageChops.lighter(out, m)
    return out


def m_clip(m, clip):
    return ImageChops.multiply(m, clip)


def bezier(p0, p1, p2, n=80):
    pts = []
    for i in range(n + 1):
        t = i / n
        pts.append(((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0],
                    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]))
    return pts


def star_points(cx, cy, R, r, n=5, rot=-90):
    pts = []
    for i in range(n * 2):
        rad = R if i % 2 == 0 else r
        a = math.radians(rot + i * 180 / n)
        pts.append((cx + math.cos(a) * rad, cy + math.sin(a) * rad))
    return pts


# ------------------------------------------------------------------ clay shading

def clay(canvas, mask, base, light=0.42, dark=0.3, rim=0.5, gloss=150):
    """Paints a soft 3D clay shape: diagonal light, darker rim, specular gloss."""
    bbox = mask.getbbox()
    if not bbox:
        return
    x0, y0, x1, y1 = bbox
    bw, bh = max(2, x1 - x0), max(2, y1 - y0)
    base_c = hexc(base) if isinstance(base, str) else base
    light_c = mix(base_c, WHITE, light)
    dark_c = mix(base_c, BLACK, dark)

    vert = Image.linear_gradient('L').resize((bw, bh))
    horiz = Image.linear_gradient('L').rotate(90).resize((bw, bh))
    diag = ImageChops.add(vert, horiz, scale=2)
    # light -> base -> dark along the diagonal
    lo = Image.new('RGBA', (bw, bh), light_c)
    mid = Image.new('RGBA', (bw, bh), base_c)
    hi = Image.new('RGBA', (bw, bh), dark_c)
    first = diag.point(lambda v: min(255, v * 2))
    second = diag.point(lambda v: max(0, v * 2 - 255))
    body = Image.composite(mid, lo, first)
    body = Image.composite(hi, body, second)

    layer = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    layer.paste(body, (x0, y0))

    # darker rim inside the silhouette (rounded, puffy look)
    r = max(2, int(min(bw, bh) * 0.09))
    inner = mask.filter(ImageFilter.GaussianBlur(r))
    rim_a = ImageChops.subtract(mask, inner).point(lambda v: int(min(255, v * 1.6) * rim))
    rim_layer = Image.new('RGBA', (W, W), mix(base_c, BLACK, 0.45))
    rim_layer.putalpha(rim_a)
    layer.alpha_composite(rim_layer)

    # specular gloss blob on the upper-left
    if gloss:
        g = m_new()
        ImageDraw.Draw(g).ellipse([x0 + bw * 0.16, y0 + bh * 0.08, x0 + bw * 0.46, y0 + bh * 0.3], fill=gloss)
        g = g.filter(ImageFilter.GaussianBlur(max(2, int(min(bw, bh) * 0.06))))
        g = ImageChops.multiply(g, inner)
        gl = Image.new('RGBA', (W, W), WHITE)
        gl.putalpha(g)
        layer.alpha_composite(gl)

    layer.putalpha(mask)
    canvas.alpha_composite(layer)


def flat(canvas, mask, color, blur=0.0, alpha=255):
    m = mask.filter(ImageFilter.GaussianBlur(P(blur))) if blur else mask
    if alpha != 255:
        m = m.point(lambda v: v * alpha // 255)
    lay = Image.new('RGBA', (W, W), hexc(color) if isinstance(color, str) else color)
    lay.putalpha(m)
    canvas.alpha_composite(lay)


def eye(canvas, cx, cy, r, lashes=False):
    clay(canvas, m_ellipse(cx, cy, r, r * 1.15), '#2B1B12', light=0.25, dark=0.2, rim=0.2, gloss=0)
    flat(canvas, m_ellipse(cx - r * 0.32, cy - r * 0.38, r * 0.36, r * 0.36), '#FFFFFF')
    flat(canvas, m_ellipse(cx + r * 0.34, cy + r * 0.36, r * 0.16, r * 0.16), '#FFFFFF')
    if lashes:
        d = ImageDraw.Draw(canvas)
        for k in (-1, 0, 1):
            a = math.radians(-90 + k * 32 + (-14 if cx < 128 else 14))
            sx, sy = cx + math.cos(a) * r * 1.05, cy + math.sin(a) * r * 1.2
            d.line([(P(sx), P(sy)), (P(sx + math.cos(a) * r * 0.55), P(sy + math.sin(a) * r * 0.55))], fill=hexc('#2B1B12'), width=P(2.4))


def cheek(canvas, cx, cy, r):
    flat(canvas, m_ellipse(cx, cy, r, r * 0.7), '#FB7185', blur=3, alpha=150)


def smile(canvas, cx, cy, w, color='#4A2511', width=3.2):
    d = ImageDraw.Draw(canvas)
    d.arc([P(cx - w), P(cy - w * 0.7), P(cx + w), P(cy + w * 0.7)], 20, 160, fill=hexc(color), width=P(width))


def sparkle(canvas, cx, cy, R, color='#FFFFFF'):
    flat(canvas, m_poly(star_points(cx, cy, R, R * 0.28, 4, -90)), color)
    flat(canvas, m_ellipse(cx, cy, R * 0.9, R * 0.9), color, blur=R * 0.5, alpha=90)


def finish(canvas):
    """Soft drop shadow under the whole icon, then downsample."""
    alpha = canvas.split()[3]
    sh = Image.new('RGBA', (W, W), (60, 36, 20, 255))
    sh_a = alpha.filter(ImageFilter.GaussianBlur(P(5))).point(lambda v: v * 70 // 255)
    sh.putalpha(sh_a)
    out = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    out.alpha_composite(sh, (0, P(6)))
    out.alpha_composite(canvas)
    return out.resize((SIZE, SIZE), Image.LANCZOS)


def new_canvas():
    return Image.new('RGBA', (W, W), (0, 0, 0, 0))


# ------------------------------------------------------------------ companions

def icon_elephant():
    c = new_canvas()
    clay(c, m_ellipse(128, 214, 50, 32), '#93A9C9')
    for sx in (-1, 1):
        clay(c, m_ellipse(128 + sx * 66, 116, 46, 56, angle=sx * 12), '#93A9C9')
        clay(c, m_ellipse(128 + sx * 68, 120, 30, 38, angle=sx * 12), '#F9A8D4', gloss=80)
    clay(c, m_ellipse(128, 116, 66, 62), '#A3B8D6')
    clay(c, m_tube(bezier((128, 140), (124, 200), (160, 206), 50), 30, taper=0.4), '#9AB0CF', gloss=60)
    for sx in (-1, 1):
        clay(c, m_ellipse(128 + sx * 30, 160, 7, 12, angle=sx * -30), '#FFFBF0', gloss=60)
    for (x, y) in ((116, 58), (128, 54), (140, 58)):
        clay(c, m_ellipse(x, y, 6, 9), '#7F95B6', gloss=0)
    eye(c, 104, 108, 11)
    eye(c, 152, 108, 11)
    cheek(c, 88, 136, 11)
    cheek(c, 168, 136, 11)
    return c


def icon_puppy():
    c = new_canvas()
    clay(c, m_ellipse(128, 214, 48, 30), '#F2BE85')
    for sx in (-1, 1):
        clay(c, m_ellipse(128 + sx * 60, 128, 24, 50, angle=sx * 22), '#8B5A33')
    clay(c, m_ellipse(128, 120, 66, 60), '#F4C38A')
    clay(c, m_ellipse(156, 98, 22, 17, angle=-15), '#D99A5B', gloss=50)
    clay(c, m_ellipse(128, 150, 38, 27), '#FFF4E0', gloss=70)
    clay(c, m_ellipse(128, 168, 10, 12), '#FB7185', gloss=60)
    clay(c, m_ellipse(128, 138, 14, 10), '#3B2416')
    d = ImageDraw.Draw(c)
    d.line([(P(128), P(146)), (P(128), P(156))], fill=hexc('#4A2511'), width=P(3))
    smile(c, 116, 152, 12)
    smile(c, 140, 152, 12)
    eye(c, 102, 110, 11)
    eye(c, 154, 110, 11)
    cheek(c, 86, 142, 10)
    cheek(c, 170, 142, 10)
    return c


def icon_unicorn():
    c = new_canvas()
    clay(c, m_ellipse(128, 216, 48, 28), '#FBF7FF')
    for (x, y, r, col) in ((80, 96, 22, '#C084FC'), (70, 130, 22, '#F472B6'), (78, 164, 20, '#60A5FA'),
                           (106, 70, 20, '#F9A8D4'), (176, 96, 18, '#C084FC')):
        clay(c, m_ellipse(x, y, r, r), col)
    for sx in (-1, 1):
        clay(c, m_poly([(128 + sx * 26, 82), (128 + sx * 52, 52), (128 + sx * 52, 92)]), '#FBF7FF')
        clay(c, m_poly([(128 + sx * 32, 82), (128 + sx * 48, 62), (128 + sx * 48, 88)]), '#FBCFE8', gloss=0)
    clay(c, m_ellipse(128, 128, 62, 60), '#FDFAFF', light=0.2, dark=0.18)
    horn = m_poly([(114, 80), (142, 80), (128, 14)])
    clay(c, horn, '#FCD34D')
    d = ImageDraw.Draw(c)
    for k in range(4):
        y = 70 - k * 14
        d.line([(P(128 - (80 - y) * 0.2 - 4), P(y + 4)), (P(128 + (80 - y) * 0.2 + 4), P(y - 4))], fill=hexc('#D97706', 200), width=P(2.4))
    for (x, y, r, col) in ((104, 74, 16, '#F472B6'), (150, 72, 14, '#60A5FA')):
        clay(c, m_ellipse(x, y, r, r), col)
    clay(c, m_ellipse(128, 160, 34, 22), '#FCE7F3', gloss=60)
    for sx in (-1, 1):
        flat(c, m_ellipse(128 + sx * 12, 158, 3.5, 2.5), '#DB2777')
    eye(c, 106, 120, 11, lashes=True)
    eye(c, 150, 120, 11, lashes=True)
    cheek(c, 90, 146, 10)
    cheek(c, 166, 146, 10)
    sparkle(c, 200, 40, 10, '#FDE047')
    sparkle(c, 46, 60, 7, '#F9A8D4')
    return c


def icon_dolphin():
    c = new_canvas()
    clay(c, m_ellipse(128, 222, 96, 22), '#38BDF8', gloss=90)
    for (x, y, r) in ((50, 206, 12), (70, 198, 9), (190, 204, 12), (210, 196, 8), (128, 206, 8)):
        clay(c, m_ellipse(x, y, r, r), '#FFFFFF', light=0.1, dark=0.12)
    body = m_tube(bezier((182, 92), (100, 40), (70, 196), 90), 66, taper=0.72)
    snout = m_ellipse(214, 108, 26, 13, angle=-24)
    clay(c, m_union(body, snout), '#3B9BE8')
    belly = m_clip(m_tube(bezier((196, 118), (130, 90), (92, 186), 70), 34, taper=0.7), body)
    flat(c, belly, '#BFE6FF', blur=2, alpha=210)
    clay(c, m_poly([(118, 70), (142, 30), (150, 82)]), '#2F86D6')
    clay(c, m_poly([(150, 112), (176, 146), (140, 132)]), '#2F86D6', gloss=40)
    for sx in (-1, 1):
        clay(c, m_ellipse(70 + sx * 16, 206, 18, 9, angle=sx * 30), '#2F86D6', gloss=40)
    eye(c, 186, 92, 9)
    smile(c, 210, 108, 12, width=3)
    cheek(c, 196, 112, 8)
    return c


def icon_parrot():
    c = new_canvas()
    for (dx, col) in ((-14, '#3B82F6'), (0, '#EF4444'), (14, '#FDE047')):
        clay(c, m_ellipse(128 + dx, 214, 9, 34, angle=-dx), col, gloss=50)
    for sx in (-1, 1):
        clay(c, m_ellipse(128 + sx * 48, 158, 20, 48, angle=sx * -14), '#2563EB')
    clay(c, m_ellipse(128, 156, 52, 62), '#22C55E')
    clay(c, m_ellipse(128, 172, 32, 40), '#FDE047', gloss=70)
    for (x, y, col) in ((112, 40, '#FDE047'), (128, 34, '#EF4444'), (144, 40, '#F97316')):
        clay(c, m_ellipse(x, y, 8, 16, angle=(x - 128) * -1.2), col, gloss=40)
    clay(c, m_ellipse(128, 88, 50, 46), '#EF4444')
    for sx in (-1, 1):
        clay(c, m_ellipse(128 + sx * 22, 84, 15, 15), '#FFFFFF', light=0.1, dark=0.1, gloss=0)
        eye(c, 128 + sx * 22, 84, 9)
    beak = m_union(m_ellipse(128, 112, 15, 16), m_poly([(116, 112), (140, 112), (128, 136)]))
    clay(c, beak, '#F59E0B')
    flat(c, m_ellipse(128, 106, 9, 4), '#FFFBEB', blur=1.5, alpha=180)
    cheek(c, 96, 104, 9)
    cheek(c, 160, 104, 9)
    for sx in (-1, 1):
        clay(c, m_ellipse(128 + sx * 16, 218, 10, 6), '#F97316', gloss=0)
    return c


# ------------------------------------------------------------------ quests

def icon_rainbow():
    c = new_canvas()
    for i, col in enumerate(['#F43F5E', '#F97316', '#FDE047', '#22C55E', '#38BDF8', '#8B5CF6']):
        rad = 102 - i * 12
        pts = [(128 + math.cos(math.radians(a)) * rad, 176 - math.sin(math.radians(a)) * rad) for a in range(0, 181, 3)]
        clay(c, m_tube(pts, 13), col, gloss=0, rim=0.35)
    for cx in (34, 222):
        for (dx, dy, r) in ((-16, 4, 16), (0, -6, 20), (16, 4, 16)):
            clay(c, m_ellipse(cx + dx, 182 + dy, r, r * 0.9), '#FFFFFF', light=0.1, dark=0.12)
    crown = [(92, 112), (110, 88), (146, 88), (164, 112)]
    pav = [(92, 112), (164, 112), (128, 196)]
    clay(c, m_union(m_poly(crown), m_poly(pav)), '#38BDF8', light=0.5, dark=0.25)
    flat(c, m_poly([(110, 88), (128, 112), (146, 88)]), '#E0F2FE', alpha=200)
    flat(c, m_poly([(92, 112), (110, 88), (118, 112)]), '#A5F3FC', alpha=170)
    flat(c, m_poly([(128, 112), (164, 112), (128, 196)]), '#7C3AED', alpha=90)
    flat(c, m_poly([(92, 112), (128, 112), (128, 196)]), '#FFFFFF', alpha=60)
    sparkle(c, 170, 80, 10)
    sparkle(c, 86, 150, 7)
    return c


def icon_rocket():
    c = new_canvas()
    for (y, r, col) in ((214, 18, '#F97316'), (206, 14, '#FDE047'), (226, 10, '#FB923C')):
        clay(c, m_ellipse(128, y, r * 0.8, r), col, gloss=60)
    for sx in (-1, 1):
        clay(c, m_poly([(128 + sx * 30, 140), (128 + sx * 62, 196), (128 + sx * 30, 186)]), '#F43F5E')
    body = m_ellipse(128, 118, 38, 80)
    clay(c, body, '#F8FAFC', light=0.15, dark=0.2)
    nose = m_clip(body, m_poly([(0, 0), (256, 0), (256, 72), (0, 72)]))
    clay(c, nose, '#F43F5E')
    band = m_clip(body, m_poly([(0, 168), (256, 168), (256, 256), (0, 256)]))
    clay(c, band, '#F43F5E', gloss=0)
    clay(c, m_ellipse(128, 116, 22, 22), '#94A3B8', gloss=0)
    clay(c, m_ellipse(128, 116, 16, 16), '#38BDF8', light=0.5)
    clay(c, m_poly([(124, 160), (132, 160), (134, 200), (122, 200)]), '#E11D48', gloss=0)
    sparkle(c, 54, 60, 9, '#FDE047')
    sparkle(c, 204, 92, 7, '#FDE047')
    sparkle(c, 196, 34, 5)
    return c


def icon_icecream_castle():
    c = new_canvas()
    for x0, x1, top, col in ((54, 94, 116, '#F472B6'), (162, 202, 116, '#F472B6')):
        clay(c, m_rrect(x0, top, x1, 212, 8), col)
    clay(c, m_rrect(84, 134, 172, 214, 10), '#F9A8D4')
    clay(c, m_rrect(102, 92, 154, 214, 10), '#FBCFE8')
    for (cx, cy, r, col) in ((74, 108, 24, '#6EE7B7'), (182, 108, 24, '#FEF3C7'), (128, 80, 32, '#FB7185')):
        clay(c, m_ellipse(cx, cy, r, r * 0.78), col)
        for k in (-1, 0, 1):
            clay(c, m_ellipse(cx + k * r * 0.55, cy + r * 0.62, r * 0.2, r * 0.26), col, gloss=0)
    clay(c, m_ellipse(128, 46, 11, 11), '#E11D48')
    ImageDraw.Draw(c).line([(P(128), P(36)), (P(136), P(24))], fill=hexc('#15803D'), width=P(3))
    clay(c, m_union(m_rrect(114, 176, 142, 214, 4), m_ellipse(128, 178, 14, 14)), '#7C2D12', gloss=0)
    for (x, y) in ((66, 150), (182, 150), (128, 132)):
        clay(c, m_union(m_rrect(x - 7, y, x + 7, y + 16, 2), m_ellipse(x, y, 7, 7)), '#9D174D', gloss=0)
    d = ImageDraw.Draw(c)
    for i, (x, y) in enumerate(((116, 72), (140, 76), (128, 90), (64, 102), (186, 100), (80, 112))):
        col = ['#FDE047', '#38BDF8', '#FFFFFF', '#8B5CF6', '#22C55E', '#F97316'][i]
        d.line([(P(x - 3), P(y - 2)), (P(x + 3), P(y + 2))], fill=hexc(col), width=P(3))
    return c


def icon_dino():
    c = new_canvas()
    for (x, y) in ((70, 172), (92, 146), (114, 132), (138, 128), (160, 112), (172, 86)):
        clay(c, m_poly([(x - 9, y + 6), (x, y - 14), (x + 9, y + 6)]), '#F97316', gloss=40)
    clay(c, m_tube(bezier((104, 176), (70, 190), (40, 168), 40), 34, taper=0.75), '#4ADE80')
    for x in (106, 150):
        clay(c, m_ellipse(x, 212, 16, 14), '#3FC46F', gloss=40)
    clay(c, m_ellipse(128, 172, 54, 42), '#4ADE80')
    clay(c, m_ellipse(134, 184, 32, 24), '#FEF9C3', gloss=60)
    clay(c, m_tube(bezier((152, 160), (170, 130), (172, 104), 40), 34, taper=0.15), '#4ADE80', gloss=0)
    clay(c, m_ellipse(180, 88, 36, 28), '#4ADE80')
    eye(c, 188, 80, 9)
    smile(c, 196, 96, 12)
    cheek(c, 172, 100, 8)
    for (x, y) in ((116, 158), (142, 150), (104, 176)):
        flat(c, m_ellipse(x, y, 6, 5), '#22A35A', alpha=180)
    return c


def icon_treasure():
    c = new_canvas()
    clay(c, m_ellipse(128, 222, 104, 22), '#38BDF8', gloss=90)
    for (x, y, r) in ((40, 212, 10), (222, 212, 10), (60, 222, 7), (200, 224, 7)):
        clay(c, m_ellipse(x, y, r, r), '#FFFFFF', light=0.1, dark=0.12)
    lid = m_clip(m_ellipse(128, 128, 66, 46), m_poly([(0, 0), (256, 0), (256, 128), (0, 128)]))
    clay(c, lid, '#A0522D')
    for (x, y, r) in ((90, 122, 12), (108, 112, 12), (128, 116, 13), (148, 110, 12), (166, 120, 12), (118, 100, 11), (140, 98, 11)):
        clay(c, m_ellipse(x, y, r, r * 0.9), '#FBBF24', light=0.5)
    clay(c, m_poly(star_points(128, 92, 14, 6)), '#F43F5E', light=0.5)
    clay(c, m_rrect(62, 126, 194, 206, 12), '#B45309')
    for x in (80, 164):
        clay(c, m_rrect(x, 124, x + 14, 208, 4), '#FBBF24', gloss=70)
    clay(c, m_rrect(62, 140, 194, 150, 3), '#92400E', gloss=0)
    clay(c, m_rrect(116, 140, 140, 168, 6), '#FBBF24')
    flat(c, m_ellipse(128, 154, 3.5, 5), '#78350F')
    sparkle(c, 182, 78, 9, '#FDE047')
    sparkle(c, 70, 88, 6)
    return c


def icon_cloud_castle():
    c = new_canvas()
    for x0, x1, roof_y in ((62, 98, 52), (158, 194, 52)):
        clay(c, m_rrect(x0, 100, x1, 200, 6), '#A78BFA')
        clay(c, m_poly([(x0 - 6, 104), ((x0 + x1) / 2, roof_y), (x1 + 6, 104)]), '#7C3AED')
        flat(c, m_poly([((x0 + x1) / 2, roof_y), ((x0 + x1) / 2, roof_y - 18), ((x0 + x1) / 2 + 16, roof_y - 12)]), '#F472B6')
        clay(c, m_union(m_rrect((x0 + x1) / 2 - 7, 130, (x0 + x1) / 2 + 7, 150, 2), m_ellipse((x0 + x1) / 2, 130, 7, 7)), '#5B21B6', gloss=0)
    clay(c, m_rrect(88, 122, 168, 200, 8), '#C4B5FD')
    clay(c, m_rrect(108, 84, 148, 200, 8), '#DDD6FE')
    clay(c, m_poly([(100, 88), (128, 26), (156, 88)]), '#8B5CF6')
    flat(c, m_poly([(128, 26), (128, 6), (146, 13)]), '#FDE047')
    clay(c, m_union(m_rrect(116, 160, 140, 200, 4), m_ellipse(128, 162, 12, 12)), '#5B21B6', gloss=0)
    for (x, y, r) in ((40, 200, 26), (76, 210, 28), (114, 214, 26), (150, 212, 28), (190, 208, 28), (222, 198, 22), (128, 226, 30)):
        clay(c, m_ellipse(x, y, r, r * 0.82), '#FFFFFF', light=0.08, dark=0.1)
    sparkle(c, 44, 60, 8, '#FDE047')
    sparkle(c, 214, 84, 6, '#FDE047')
    return c


# ------------------------------------------------------------------ tools & header art

def icon_wand():
    c = new_canvas()
    clay(c, m_tube(bezier((70, 214), (110, 160), (150, 112), 40), 14), '#F472B6')
    d = ImageDraw.Draw(c)
    for k in range(4):
        x, y = 82 + k * 17, 198 - k * 21
        d.line([(P(x - 6), P(y - 4)), (P(x + 6), P(y + 4))], fill=hexc('#FFFFFF', 220), width=P(3))
    flat(c, m_ellipse(166, 92, 66, 66), '#FDE68A', blur=14, alpha=170)
    clay(c, m_poly(star_points(166, 92, 56, 26)), '#FBBF24', light=0.5)
    eye(c, 154, 90, 6)
    eye(c, 178, 90, 6)
    smile(c, 166, 104, 7, width=2.6)
    for (x, y, r) in ((92, 66, 10), (222, 150, 8), (214, 40, 7), (120, 40, 6)):
        sparkle(c, x, y, r, '#FDE047')
    return c


def icon_balloon():
    c = new_canvas()
    d = ImageDraw.Draw(c)
    pts = bezier((128, 176), (106, 214), (138, 246), 30)
    d.line([(P(x), P(y)) for x, y in pts], fill=hexc('#94A3B8'), width=P(2.6))
    clay(c, m_poly([(118, 182), (138, 182), (128, 168)]), '#E11D48', gloss=0)
    clay(c, m_ellipse(128, 100, 62, 74), '#F43F5E', light=0.5)
    clay(c, m_poly(star_points(146, 118, 14, 6)), '#FDE047', gloss=60)
    sparkle(c, 206, 54, 8, '#FDE047')
    sparkle(c, 48, 80, 6)
    return c


def icon_shoes():
    c = new_canvas()
    for (x, y, rx, ry, a) in ((54, 110, 26, 10, 30), (48, 128, 24, 9, 18), (50, 146, 20, 8, 6)):
        clay(c, m_ellipse(x, y, rx, ry, angle=a), '#FFFFFF', light=0.08, dark=0.12)
    upper = m_union(
        m_poly([(56, 176), (64, 120), (104, 110), (132, 134), (178, 144), (210, 166), (212, 182), (56, 186)]),
        m_ellipse(194, 168, 22, 20),
    )
    clay(c, upper, '#38BDF8')
    clay(c, m_rrect(46, 178, 218, 204, 12), '#FFFFFF', light=0.06, dark=0.16)
    flat(c, m_rrect(46, 196, 218, 204, 6), '#F43F5E', alpha=230)
    clay(c, m_ellipse(196, 170, 20, 16), '#E0F2FE', gloss=60)
    d = ImageDraw.Draw(c)
    for k in range(4):
        x = 104 + k * 13
        d.line([(P(x), P(124 + k * 3)), (P(x + 12), P(132 + k * 3))], fill=hexc('#FFFFFF'), width=P(4))
    clay(c, m_poly(star_points(108, 160, 16, 7)), '#FDE047', gloss=60)
    sparkle(c, 210, 116, 8, '#FDE047')
    return c


def icon_cape():
    c = new_canvas()
    cape = m_poly([(92, 62), (164, 62), (204, 196), (178, 186), (156, 214), (128, 194), (100, 214), (78, 186), (52, 196)])
    clay(c, cape, '#EF4444', light=0.4)
    inner = m_poly([(104, 74), (152, 74), (176, 176), (128, 184), (80, 176)])
    flat(c, inner, '#B91C1C', blur=6, alpha=90)
    clay(c, m_tube([(x, 64 + math.sin((x - 88) / 80 * math.pi) * -4) for x in range(88, 170, 2)], 18), '#FBBF24')
    clay(c, m_poly(star_points(128, 66, 22, 10)), '#FDE047', light=0.5)
    sparkle(c, 54, 92, 8, '#FDE047')
    sparkle(c, 206, 102, 7, '#FDE047')
    return c


def icon_compass():
    c = new_canvas()
    clay(c, m_tube([(128 + math.cos(math.radians(a)) * 12, 32 + math.sin(math.radians(a)) * 12) for a in range(0, 361, 6)], 8), '#F59E0B', gloss=0)
    clay(c, m_ellipse(128, 132, 88, 88), '#F59E0B', light=0.5)
    clay(c, m_ellipse(128, 132, 70, 70), '#FFFBEB', light=0.05, dark=0.12, gloss=60)
    d = ImageDraw.Draw(c)
    for k in range(12):
        a = math.radians(k * 30)
        r0, r1 = (52, 64) if k % 3 else (46, 64)
        d.line([(P(128 + math.cos(a) * r0), P(132 + math.sin(a) * r0)), (P(128 + math.cos(a) * r1), P(132 + math.sin(a) * r1))],
               fill=hexc('#B45309'), width=P(3 if k % 3 else 4))
    clay(c, m_poly([(128, 76), (142, 132), (114, 132)]), '#F43F5E', light=0.45)
    clay(c, m_poly([(128, 188), (142, 132), (114, 132)]), '#38BDF8', light=0.45)
    clay(c, m_poly(star_points(128, 132, 14, 6)), '#FBBF24', light=0.5)
    sparkle(c, 212, 62, 8, '#FDE047')
    return c


def icon_wizard():
    c = new_canvas()
    clay(c, m_ellipse(128, 196, 100, 28), '#6D28D9')
    hat = m_union(m_poly([(68, 190), (188, 190), (150, 70)]), m_tube(bezier((150, 74), (150, 34), (184, 26), 30), 24, taper=0.75))
    clay(c, hat, '#8B5CF6', light=0.4)
    clay(c, m_rrect(72, 166, 184, 184, 6), '#FBBF24', gloss=60)
    for (x, y, R) in ((116, 128, 14), (152, 104, 10), (138, 150, 8)):
        clay(c, m_poly(star_points(x, y, R, R * 0.45)), '#FDE047', gloss=40)
    clay(c, m_ellipse(188, 28, 10, 10), '#FDE047')
    sparkle(c, 50, 120, 8, '#FDE047')
    sparkle(c, 214, 140, 7)
    return c


def icon_crown():
    c = new_canvas()
    body = m_union(m_poly([(52, 166), (56, 90), (92, 130), (128, 66), (164, 130), (200, 90), (204, 166)]), m_rrect(52, 150, 204, 200, 12))
    clay(c, body, '#FBBF24', light=0.5)
    clay(c, m_rrect(52, 168, 204, 200, 12), '#F59E0B', gloss=60)
    for (x, y) in ((56, 86), (128, 60), (200, 86)):
        clay(c, m_ellipse(x, y, 12, 12), '#F43F5E', light=0.5)
    for (x, col) in ((86, '#38BDF8'), (128, '#F43F5E'), (170, '#22C55E')):
        clay(c, m_ellipse(x, 184, 11, 11), col, light=0.5)
    sparkle(c, 214, 44, 9)
    sparkle(c, 40, 46, 7, '#FDE047')
    return c


# ------------------------------------------------------------------ home learning cards

FONTS_DIR = Path('C:/Windows/Fonts')
LATIN_FONT = FONTS_DIR / 'ariblk.ttf'      # Arial Black: chunky toy letters / numbers
INDIC_FONT = FONTS_DIR / 'NirmalaB.ttf'    # Nirmala UI Bold: Gujarati + Devanagari
CHARS_DIR = ROOT / 'assets' / 'images' / 'characters'


def m_text(text, cx, cy, size, font_path):
    """Mask of a glyph string centred on (cx, cy)."""
    from PIL import ImageFont
    font = ImageFont.truetype(str(font_path), P(size))
    m = m_new()
    d = ImageDraw.Draw(m)
    x0, y0, x1, y1 = d.textbbox((0, 0), text, font=font)
    d.text((P(cx) - (x0 + x1) / 2, P(cy) - (y0 + y1) / 2), text, font=font, fill=255)
    return m


def shift(mask, dx, dy):
    return ImageChops.offset(mask, P(dx), P(dy))


def candy_glyph(c, text, cx, cy, size, font_path, color, edge):
    """Chunky candy glyph: extruded darker edge underneath + soft clay face."""
    face = m_text(text, cx, cy, size, font_path)
    for k in range(1, 7):
        flat(c, shift(face, 0, k), edge)
    clay(c, face, color, light=0.45, dark=0.15, rim=0.35)
    return face


def centroid(mask):
    small = mask.resize((64, 64))
    px = small.load()
    tx = ty = tw = 0
    for y in range(64):
        for x in range(64):
            v = px[x, y]
            tx += x * v
            ty += y * v
            tw += v
    return (tx / tw * W / 64 / SS, ty / tw * W / 64 / SS) if tw else (128, 128)


def tiny_face(c, cx, cy, s=1.0):
    eye(c, cx - 7 * s, cy, 4.2 * s)
    eye(c, cx + 7 * s, cy, 4.2 * s)
    smile(c, cx, cy + 7 * s, 5 * s, width=2.2)


def cube(c, x, y, s, color, letter, font_path, letter_size):
    """Toy block: front face + lighter top + darker side, letter raised on the front."""
    base = hexc(color)
    top = [(x, y), (x + s * 0.28, y - s * 0.22), (x + s * 1.28, y - s * 0.22), (x + s, y)]
    side = [(x + s, y), (x + s * 1.28, y - s * 0.22), (x + s * 1.28, y + s * 0.78), (x + s, y + s)]
    clay(c, m_poly(top), mix(base, WHITE, 0.35), light=0.2, dark=0.1, rim=0.2, gloss=0)
    clay(c, m_poly(side), mix(base, BLACK, 0.22), light=0.1, dark=0.2, rim=0.2, gloss=0)
    clay(c, m_rrect(x, y, x + s, y + s, s * 0.14), color, light=0.35, dark=0.2)
    face = m_text(letter, x + s / 2, y + s / 2 + 2, letter_size, font_path)
    flat(c, shift(face, 0, 2.5), mix(base, BLACK, 0.35))
    clay(c, face, '#FFFFFF', light=0.05, dark=0.12, rim=0.25, gloss=0)


def icon_abc(letters, font_path, letter_size):
    def draw():
        c = new_canvas()
        cube(c, 30, 140, 84, '#F43F5E', letters[0], font_path, letter_size)
        cube(c, 124, 140, 84, '#0EA5E9', letters[1], font_path, letter_size)
        cube(c, 78, 50, 84, '#F59E0B', letters[2], font_path, letter_size)
        clay(c, m_poly(star_points(206, 64, 30, 14)), '#FBBF24', light=0.5)
        tiny_face(c, 206, 64, 0.9)
        sparkle(c, 36, 52, 9, '#FDE047')
        sparkle(c, 232, 132, 7)
        return c
    return draw


def icon_123(digits, font_path, size):
    def draw():
        c = new_canvas()
        specs = [(digits[0], 56, 140, '#F43F5E', '#BE123C'), (digits[1], 128, 108, '#10B981', '#047857'), (digits[2], 200, 140, '#0EA5E9', '#0369A1')]
        for text, cx, cy, col, edge in specs:
            face = candy_glyph(c, text, cx, cy, size, font_path, col, edge)
            fx, fy = centroid(face)
            tiny_face(c, fx, fy - 4, 0.95)
        sparkle(c, 40, 52, 9, '#FDE047')
        sparkle(c, 220, 60, 7, '#FDE047')
        return c
    return draw


def strip_white_floor(im, band=0.14):
    """Removes a baked-in white floor under a character PNG (flood fill from transparency)."""
    w, h = im.size
    px = im.load()
    y_min = int(h * (1 - band))

    def whiteish(p):
        r, g, b, a = p
        return a > 0 and min(r, g, b) > 205 and max(r, g, b) - min(r, g, b) < 28

    stack = [(x, y) for y in range(y_min, h) for x in range(w) if px[x, y][3] <= 24]
    seen = set()
    while stack:
        x, y = stack.pop()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and y_min <= ny < h and (nx, ny) not in seen and whiteish(px[nx, ny]):
                seen.add((nx, ny))
                r, g, b, _ = px[nx, ny]
                px[nx, ny] = (r, g, b, 0)
                stack.append((nx, ny))
    return im


def character_sprite(name, height, flip=False):
    im = Image.open(CHARS_DIR / f'3d_{name}.png').convert('RGBA')
    im = im.crop(im.split()[3].point(lambda a: 255 if a > 24 else 0).getbbox())
    im = strip_white_floor(im)
    im = im.crop(im.split()[3].point(lambda a: 255 if a > 24 else 0).getbbox())
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    ph = P(height)
    return im.resize((int(im.width * ph / im.height), ph), Image.LANCZOS)


def music_note(c, x, y, s, color):
    clay(c, m_ellipse(x, y, 9 * s, 7 * s, angle=20), color, gloss=60)
    clay(c, m_rrect(x + 6 * s, y - 34 * s, x + 10 * s, y, 2 * s), color, gloss=0)
    clay(c, m_poly([(x + 8 * s, y - 34 * s), (x + 22 * s, y - 24 * s), (x + 8 * s, y - 22 * s)]), color, gloss=0)


def icon_animals():
    c = new_canvas()
    clay(c, m_ellipse(128, 232, 104, 14), '#86EFAC', light=0.3, dark=0.2, gloss=0)
    lion = character_sprite('lion', 196)
    c.alpha_composite(lion, (P(98) - lion.width // 2, P(236) - lion.height))
    bird = character_sprite('sparrow', 104, flip=True)
    c.alpha_composite(bird, (P(198) - bird.width // 2, P(164) - bird.height))
    music_note(c, 156, 40, 0.85, '#F43F5E')
    music_note(c, 226, 36, 0.7, '#8B5CF6')
    sparkle(c, 166, 150, 7, '#FDE047')
    return c


def icon_palette():
    c = new_canvas()
    board = m_union(m_ellipse(124, 140, 104, 84, angle=-12), m_ellipse(70, 104, 44, 40))
    hole = m_ellipse(88, 172, 15, 12)
    board = ImageChops.subtract(board, hole)
    for k in range(1, 7):
        flat(c, shift(board, 0, k), '#B7793F')
    clay(c, board, '#E9B77C', light=0.35, dark=0.18, rim=0.4)
    d = ImageDraw.Draw(c)
    for k in range(4):
        d.arc([P(50 + k * 18), P(88 + k * 10), P(210 - k * 6), P(210 - k * 4)], 200, 300, fill=hexc('#C98D56', 120), width=P(2))
    for (x, y, r, col) in ((76, 96, 17, '#F43F5E'), (120, 78, 17, '#F59E0B'), (166, 86, 17, '#10B981'),
                           (196, 124, 16, '#0EA5E9'), (182, 170, 16, '#8B5CF6'), (132, 192, 14, '#FDE047')):
        clay(c, m_union(m_ellipse(x, y, r, r * 0.86), m_ellipse(x + r * 0.35, y - r * 0.5, r * 0.45, r * 0.45)), col, light=0.5)
    clay(c, m_tube(bezier((52, 238), (100, 196), (150, 150), 40), 13), '#F43F5E')
    clay(c, m_tube(bezier((150, 150), (158, 142), (166, 134), 10), 15), '#CBD5E1', gloss=60)
    clay(c, m_ellipse(176, 122, 11, 18, angle=-45), '#8B5A33', gloss=0)
    clay(c, m_ellipse(184, 113, 8, 12, angle=-45), '#0EA5E9', gloss=60)
    sparkle(c, 226, 52, 9, '#FDE047')
    return c


def icon_storybook():
    c = new_canvas()
    flat(c, m_ellipse(128, 110, 100, 80), '#FDE68A', blur=22, alpha=200)
    cover = m_poly([(20, 168), (128, 196), (236, 168), (236, 196), (128, 224), (20, 196)])
    clay(c, cover, '#7C3AED', light=0.3, dark=0.25)
    left = m_poly([(28, 168)] + bezier((28, 104), (80, 84), (128, 112), 30) + [(128, 196)])
    right = m_poly([(128, 196)] + bezier((128, 112), (176, 84), (228, 104), 30) + [(228, 168)])
    clay(c, left, '#FFFBF0', light=0.1, dark=0.12, rim=0.3, gloss=0)
    clay(c, right, '#FFF8E7', light=0.05, dark=0.16, rim=0.3, gloss=0)
    d = ImageDraw.Draw(c)
    for k in range(4):
        y = 128 + k * 13
        d.line([(P(46), P(y - 4 + k)), (P(112), P(y + 6 + k * 2))], fill=hexc('#CBD5E1'), width=P(3))
        d.line([(P(144), P(y + 6 + k * 2)), (P(210), P(y - 4 + k))], fill=hexc('#CBD5E1'), width=P(3))
    d.line([(P(128), P(112)), (P(128), P(196))], fill=hexc('#E7D9BF'), width=P(3))
    for (x, y, R) in ((128, 46, 20), (78, 60, 12), (182, 54, 14), (104, 22, 8), (160, 24, 9)):
        clay(c, m_poly(star_points(x, y, R, R * 0.45)), '#FBBF24', light=0.5, gloss=60)
    for (x, y, r) in ((54, 96, 8), (206, 92, 7), (142, 84, 6), (112, 88, 5)):
        sparkle(c, x, y, r, '#FDE047')
    return c


def m_jigsaw(x, y, s, knobs):
    """Jigsaw piece mask: square body + round knobs ('+') or sockets ('-') per side (top, right, bottom, left)."""
    body = m_rrect(x, y, x + s, y + s, s * 0.12)
    r = s * 0.17
    centers = [(x + s / 2, y), (x + s, y + s / 2), (x + s / 2, y + s), (x, y + s / 2)]
    for (cx, cy), k in zip(centers, knobs):
        if k == '+':
            body = m_union(body, m_ellipse(cx, cy, r, r))
        elif k == '-':
            body = ImageChops.subtract(body, m_ellipse(cx, cy, r, r))
    return body


def icon_jigsaw():
    c = new_canvas()
    # right piece (sky): socket on its left side receives the gold piece's knob
    right = m_jigsaw(142, 92, 92, ['+', '0', '+', '-'])
    for k in range(1, 6):
        flat(c, shift(right, 0, k), '#0284C7')
    clay(c, right, '#0EA5E9', light=0.45)
    # left piece (gold) with a happy face: knobs on top and right
    left = m_jigsaw(30, 92, 104, ['+', '+', '0', '0'])
    for k in range(1, 7):
        flat(c, shift(left, 0, k), '#D97706')
    clay(c, left, '#F59E0B', light=0.5)
    tiny_face(c, 82, 150, 1.6)
    cheek(c, 56, 166, 7)
    cheek(c, 108, 166, 7)
    sparkle(c, 222, 52, 9, '#FDE047')
    sparkle(c, 30, 52, 7, '#FDE047')
    return c


def icon_gold_star():
    c = new_canvas()
    flat(c, m_ellipse(128, 132, 104, 104), '#FDE68A', blur=18, alpha=150)
    star = m_poly(star_points(128, 136, 104, 48))
    for k in range(1, 9):
        flat(c, shift(star, 0, k), '#D97706')
    clay(c, star, '#FCD34D', light=0.6, dark=0.12, rim=0.35, gloss=200)
    tiny_face(c, 128, 140, 2.0)
    cheek(c, 96, 158, 9)
    cheek(c, 160, 158, 9)
    sparkle(c, 226, 40, 11)
    sparkle(c, 30, 60, 8)
    return c


def icon_trophy():
    c = new_canvas()
    flat(c, m_ellipse(128, 104, 96, 84), '#FDE68A', blur=18, alpha=140)
    for sx in (-1, 1):
        ring = ImageChops.subtract(m_ellipse(128 + sx * 66, 92, 30, 32), m_ellipse(128 + sx * 66, 92, 17, 19))
        clay(c, ring, '#F59E0B', gloss=60)
    cup = m_union(m_clip(m_ellipse(128, 70, 66, 92), m_poly([(0, 56), (256, 56), (256, 256), (0, 256)])), m_rrect(62, 52, 194, 70, 9))
    clay(c, cup, '#FBBF24', light=0.55)
    clay(c, m_ellipse(128, 56, 62, 12), '#D97706', light=0.2, gloss=0)
    clay(c, m_rrect(116, 158, 140, 186, 6), '#F59E0B', gloss=40)
    clay(c, m_rrect(84, 184, 172, 204, 8), '#F59E0B')
    clay(c, m_rrect(72, 200, 184, 228, 10), '#8B5CF6')
    clay(c, m_rrect(104, 207, 152, 221, 4), '#FDE68A', gloss=0)
    clay(c, m_poly(star_points(128, 104, 26, 12)), '#FFFBEB', light=0.1, dark=0.1, gloss=0)
    sparkle(c, 214, 40, 10)
    sparkle(c, 40, 50, 8, '#FDE047')
    return c


def icon_medal():
    c = new_canvas()
    clay(c, m_poly([(84, 16), (122, 16), (150, 118), (112, 118)]), '#0EA5E9', gloss=40)
    clay(c, m_poly([(172, 16), (134, 16), (106, 118), (144, 118)]), '#F43F5E', gloss=40)
    for k in range(1, 7):
        flat(c, shift(m_ellipse(128, 160, 68, 68), 0, k), '#B45309')
    clay(c, m_ellipse(128, 160, 68, 68), '#F59E0B', light=0.5)
    clay(c, m_ellipse(128, 160, 50, 50), '#FBBF24', light=0.55)
    clay(c, m_poly(star_points(128, 162, 34, 15)), '#FFFBEB', light=0.1, dark=0.12, gloss=0)
    sparkle(c, 214, 110, 9)
    sparkle(c, 44, 196, 7, '#FDE047')
    return c


def icon_gift():
    c = new_canvas()
    flat(c, m_ellipse(128, 140, 104, 94), '#E9D5FF', blur=18, alpha=150)
    for k in range(1, 7):
        flat(c, shift(m_rrect(50, 112, 206, 224, 16), 0, k), '#6D28D9')
    clay(c, m_rrect(50, 112, 206, 224, 16), '#8B5CF6')
    clay(c, m_rrect(38, 84, 218, 122, 14), '#A78BFA')
    clay(c, m_rrect(112, 84, 144, 226, 6), '#FBBF24', gloss=70)
    clay(c, m_rrect(38, 92, 218, 112, 4), '#F59E0B', gloss=0)
    for sx in (-1, 1):
        clay(c, m_ellipse(128 + sx * 32, 66, 34, 22, angle=sx * -24), '#FBBF24', light=0.5)
        clay(c, m_ellipse(128 + sx * 30, 66, 14, 9, angle=sx * -24), '#D97706', gloss=0)
    clay(c, m_ellipse(128, 76, 16, 14), '#F59E0B', light=0.5)
    for (x, y, r) in ((40, 48, 9), (216, 40, 11), (226, 130, 7), (30, 150, 7)):
        sparkle(c, x, y, r, '#FDE047')
    return c


ICONS = {
    'rewards/trophy': icon_trophy,
    'rewards/medal': icon_medal,
    'rewards/gift': icon_gift,
    'subjects/braingames': icon_jigsaw,
    'subjects/star': icon_gold_star,
    'home/abc_en': icon_abc('ABC', LATIN_FONT, 54),
    'home/abc_gu': icon_abc('કખગ', INDIC_FONT, 54),
    'home/abc_hi': icon_abc('कखग', INDIC_FONT, 54),
    'home/123_en': icon_123('123', LATIN_FONT, 132),
    'home/123_gu': icon_123('૧૨૩', INDIC_FONT, 146),
    'home/123_hi': icon_123('१२३', INDIC_FONT, 146),
    'home/animals': icon_animals,
    'home/coloring': icon_palette,
    'home/storybook': icon_storybook,
    '3d_elephant': icon_elephant,
    '3d_puppy': icon_puppy,
    '3d_unicorn': icon_unicorn,
    '3d_dolphin': icon_dolphin,
    '3d_parrot': icon_parrot,
    'quest_rainbow': icon_rainbow,
    'quest_rocket': icon_rocket,
    'quest_icecream': icon_icecream_castle,
    'quest_dino': icon_dino,
    'quest_ocean': icon_treasure,
    'quest_cloud': icon_cloud_castle,
    'tool_wand': icon_wand,
    'tool_balloon': icon_balloon,
    'tool_shoes': icon_shoes,
    'tool_cape': icon_cape,
    'tool_compass': icon_compass,
    'ui_wizard': icon_wizard,
    'ui_crown': icon_crown,
}

if __name__ == '__main__':
    only = sys.argv[2:]
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in ICONS.items():
        if only and name not in only:
            continue
        target = (OUT.parent / f'{name}.png') if '/' in name else (OUT / f'{name}.png')
        target.parent.mkdir(parents=True, exist_ok=True)
        finish(fn()).save(target, 'PNG', optimize=True)
        print('generated', name)

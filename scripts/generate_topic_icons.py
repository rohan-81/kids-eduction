"""
3D clay topic illustrations for the subject topic badges (assets/images/topics/<name>.png).
Reuses the clay renderer from generate_clay_icons.py.

Usage (from the project root, Windows - uses Arial Black for the candy glyphs):
    backend\\venv\\Scripts\\python.exe scripts\\generate_topic_icons.py . [name ...]
"""
import importlib.util
import math
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

HERE = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location('clay', HERE / 'generate_clay_icons.py')
clay_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(clay_mod)
from_clay = clay_mod  # noqa

(P, W, hexc, mix, new_canvas, finish, clay, flat, m_new, m_ellipse, m_poly, m_rrect, m_tube, m_union, m_clip,
 bezier, star_points, eye, cheek, smile, sparkle, shift, tiny_face, candy_glyph, centroid, LATIN_FONT, icon_123) = (
    clay_mod.P, clay_mod.W, clay_mod.hexc, clay_mod.mix, clay_mod.new_canvas, clay_mod.finish, clay_mod.clay,
    clay_mod.flat, clay_mod.m_new, clay_mod.m_ellipse, clay_mod.m_poly, clay_mod.m_rrect, clay_mod.m_tube,
    clay_mod.m_union, clay_mod.m_clip, clay_mod.bezier, clay_mod.star_points, clay_mod.eye, clay_mod.cheek,
    clay_mod.smile, clay_mod.sparkle, clay_mod.shift, clay_mod.tiny_face, clay_mod.candy_glyph, clay_mod.centroid,
    clay_mod.LATIN_FONT, clay_mod.icon_123)

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path('.').resolve()
OUT = ROOT / 'assets' / 'images' / 'topics'


def extrude(c, mask, edge, depth=6):
    for k in range(1, depth + 1):
        flat(c, shift(mask, 0, k), edge)


def rotated(draw_fn, angle):
    """Draw on a separate canvas, rotate it around the centre, return it."""
    sub = new_canvas()
    draw_fn(sub)
    return sub.rotate(angle, resample=Image.BICUBIC, center=(W / 2, W / 2))


def rot_mask(mask, angle, cx=128, cy=128):
    return mask.rotate(angle, resample=Image.BICUBIC, center=(P(cx), P(cy)))


def line_tube(p0, p1, width, steps=30):
    return m_tube([(p0[0] + (p1[0] - p0[0]) * t / steps, p0[1] + (p1[1] - p0[1]) * t / steps) for t in range(steps + 1)], width)


# ------------------------------------------------------------------ math

def sign_icon(kind, color, edge):
    def draw():
        c = new_canvas()
        bar_h = m_rrect(44, 104, 212, 152, 24)
        bar_v = m_rrect(104, 44, 152, 212, 24)
        if kind == 'plus':
            mask = m_union(bar_h, bar_v)
        elif kind == 'minus':
            mask = bar_h
        elif kind == 'times':
            mask = rot_mask(m_union(bar_h, bar_v), 45)
        else:  # divide
            mask = m_union(bar_h, m_ellipse(128, 62, 24, 24), m_ellipse(128, 194, 24, 24))
        extrude(c, mask, edge, 8)
        clay(c, mask, color, light=0.5)
        if kind == 'minus':
            clay(c, m_ellipse(206, 64, 18, 18), '#FBBF24', light=0.5)
        tiny_face(c, 128, 124, 1.5)
        sparkle(c, 210, 44 if kind != 'minus' else 210, 10, '#FDE047')
        sparkle(c, 46, 206, 8)
        return c
    return draw


def icon_pizza():
    c = new_canvas()
    full = m_ellipse(118, 132, 96, 96)
    wedge = m_poly([(118, 132)] + [(118 + math.cos(math.radians(a)) * 120, 132 + math.sin(math.radians(a)) * 120) for a in range(-35, 36, 5)])
    pie = ImageChops.subtract(full, wedge)
    extrude(c, pie, '#B45309', 6)
    clay(c, pie, '#F59E0B', light=0.4)
    cheese = ImageChops.subtract(m_ellipse(118, 132, 78, 78), wedge)
    clay(c, cheese, '#FDE047', light=0.4, gloss=60)
    for (x, y) in ((86, 96), (130, 80), (78, 150), (120, 186), (160, 172), (104, 128)):
        clay(c, m_ellipse(x, y, 13, 13), '#EF4444', light=0.4)
    sl = new_canvas()
    sw = m_clip(m_ellipse(118, 132, 96, 96), wedge)
    extrude(sl, sw, '#B45309', 6)
    clay(sl, sw, '#F59E0B', light=0.4)
    clay(sl, m_clip(m_ellipse(118, 132, 78, 78), wedge), '#FDE047', light=0.4, gloss=60)
    clay(sl, m_ellipse(186, 132, 11, 11), '#EF4444')
    c.alpha_composite(ImageChops.offset(sl, P(22), P(4)))
    sparkle(c, 220, 60, 9, '#FDE047')
    return c


def icon_decimals():
    c = new_canvas()
    face = candy_glyph(c, '0.5', 128, 128, 120, LATIN_FONT, '#0EA5E9', '#0369A1')
    fx, fy = centroid(face)
    sparkle(c, 220, 50, 9, '#FDE047')
    sparkle(c, 40, 60, 7, '#FDE047')
    return c


def icon_geometry():
    c = new_canvas()
    front = m_poly([(112, 34), (40, 204), (150, 214)])
    side = m_poly([(112, 34), (150, 214), (196, 184)])
    extrude(c, m_union(front, side), '#BE185D', 5)
    clay(c, side, '#EC4899', light=0.2, dark=0.25, gloss=0)
    clay(c, front, '#F9A8D4', light=0.35)
    tiny_face(c, 106, 160, 1.2)
    clay(c, m_ellipse(198, 186, 40, 40), '#38BDF8', light=0.5)
    sparkle(c, 214, 70, 9, '#FDE047')
    return c


def icon_ruler():
    def draw(sub):
        body = m_rrect(24, 96, 232, 160, 12)
        extrude(sub, body, '#B45309', 7)
        clay(sub, body, '#FBBF24', light=0.45)
        d = ImageDraw.Draw(sub)
        for k in range(15):
            x = 40 + k * 13
            h = 24 if k % 5 == 0 else 14
            d.line([(P(x), P(98)), (P(x), P(98 + h))], fill=hexc('#92400E'), width=P(3))
        tiny_face(sub, 150, 136, 1.1)
    c = rotated(draw, 25)
    sparkle(c, 216, 50, 9, '#FDE047')
    sparkle(c, 40, 206, 7)
    return c


def icon_clock():
    c = new_canvas()
    for sx in (-1, 1):
        clay(c, m_ellipse(128 + sx * 62, 48, 26, 22, angle=sx * 25), '#F43F5E', light=0.5)
        clay(c, line_tube((128 + sx * 52, 196), (128 + sx * 70, 226), 14), '#E11D48', gloss=0)
    ring = m_ellipse(128, 128, 94, 94)
    extrude(c, ring, '#BE123C', 6)
    clay(c, ring, '#F43F5E', light=0.45)
    clay(c, m_ellipse(128, 128, 74, 74), '#FFFBEB', light=0.05, dark=0.1, gloss=50)
    d = ImageDraw.Draw(c)
    for k in range(12):
        a = math.radians(k * 30)
        r0 = 58 if k % 3 else 52
        d.line([(P(128 + math.cos(a) * r0), P(128 + math.sin(a) * r0)), (P(128 + math.cos(a) * 66), P(128 + math.sin(a) * 66))],
               fill=hexc('#F59E0B'), width=P(4 if k % 3 == 0 else 3))
    clay(c, line_tube((128, 128), (128, 76), 12), '#0EA5E9', gloss=0)
    clay(c, line_tube((128, 128), (168, 108), 12), '#10B981', gloss=0)
    clay(c, m_ellipse(128, 128, 9, 9), '#F59E0B', gloss=0)
    eye(c, 108, 160, 7)
    eye(c, 148, 160, 7)
    smile(c, 128, 172, 9)
    return c


def icon_money():
    c = new_canvas()
    for i, y in enumerate((206, 184, 162)):
        coin = m_ellipse(96, y, 66, 20)
        extrude(c, coin, '#B45309', 10)
        clay(c, coin, '#FBBF24', light=0.5, gloss=60)
    front = m_ellipse(170, 110, 62, 62)
    extrude(c, front, '#B45309', 9)
    clay(c, front, '#F59E0B', light=0.5)
    clay(c, m_ellipse(170, 110, 46, 46), '#FBBF24', light=0.55)
    clay(c, m_poly(star_points(170, 112, 30, 13)), '#FFFBEB', light=0.1, dark=0.12, gloss=0)
    sparkle(c, 226, 46, 9)
    sparkle(c, 40, 120, 8, '#FDE047')
    return c


def icon_beads():
    c = new_canvas()
    wire = bezier((14, 170), (128, 60), (242, 170), 80)
    clay(c, m_tube(wire, 6), '#94A3B8', gloss=0)
    cols = ['#F43F5E', '#FBBF24', '#0EA5E9'] * 3
    for i, t in enumerate(range(6, 80, 9)):
        x, y = wire[t]
        clay(c, m_ellipse(x, y, 19, 19), cols[i], light=0.5)
    sparkle(c, 128, 200, 9, '#FDE047')
    return c


def cube_q(color, glyph):
    def draw():
        c = new_canvas()
        clay_mod.cube(c, 52, 84, 124, color, glyph, LATIN_FONT, 92)
        sparkle(c, 220, 46, 10, '#FDE047')
        sparkle(c, 34, 60, 8)
        return c
    return draw


def bubble_icon(color, edge, mode):
    def draw():
        c = new_canvas()
        bub = m_union(m_rrect(30, 40, 226, 176, 52), m_poly([(70, 160), (60, 226), (120, 168)]))
        extrude(c, bub, edge, 7)
        clay(c, bub, color, light=0.45)
        if mode == 'q':
            face = clay_mod.m_text('?', 128, 108, 110, LATIN_FONT)
            flat(c, shift(face, 0, 3), mix(hexc(color), (0, 0, 0, 255), 0.35))
            clay(c, face, '#FFFFFF', light=0.05, dark=0.1, rim=0.2, gloss=0)
        else:
            for x in (82, 128, 174):
                clay(c, m_ellipse(x, 108, 17, 17), '#FFFFFF', light=0.05, dark=0.1)
        sparkle(c, 226, 196, 9, '#FDE047')
        return c
    return draw


# ------------------------------------------------------------------ science

def icon_paw():
    c = new_canvas()
    palm = m_union(m_ellipse(128, 160, 58, 50), m_ellipse(104, 176, 34, 30), m_ellipse(152, 176, 34, 30))
    toes = [(62, 104, 22, 28, -20), (100, 66, 22, 28, -8), (156, 66, 22, 28, 8), (194, 104, 22, 28, 20)]
    extrude(c, palm, '#B45309', 6)
    clay(c, palm, '#D9A066', light=0.4)
    clay(c, m_ellipse(128, 166, 38, 30), '#F9A8D4', light=0.4, gloss=70)
    for (x, y, rx, ry, a) in toes:
        t = m_ellipse(x, y, rx, ry, angle=a)
        extrude(c, t, '#B45309', 5)
        clay(c, t, '#D9A066', light=0.4)
        clay(c, m_ellipse(x, y + 3, rx * 0.6, ry * 0.6, angle=a), '#F9A8D4', light=0.4, gloss=60)
    return c


def icon_sprout():
    c = new_canvas()
    clay(c, m_tube(bezier((128, 150), (122, 110), (130, 70), 30), 10), '#22C55E', gloss=0)
    clay(c, m_ellipse(92, 78, 40, 20, angle=25), '#4ADE80', light=0.45)
    clay(c, m_ellipse(166, 62, 42, 21, angle=-25), '#22C55E', light=0.45)
    clay(c, m_ellipse(176, 52, 8, 10), '#BAE6FD', light=0.6, gloss=150)
    pot = m_poly([(64, 150), (192, 150), (174, 228), (82, 228)])
    extrude(c, pot, '#9A3412', 5)
    clay(c, pot, '#EA580C', light=0.4)
    clay(c, m_rrect(54, 138, 202, 164, 10), '#F97316', light=0.4)
    clay(c, m_ellipse(128, 142, 64, 10), '#78350F', gloss=0)
    tiny_face(c, 128, 192, 1.2)
    return c


def icon_heart():
    c = new_canvas()
    heart = m_union(m_ellipse(92, 100, 54, 54), m_ellipse(164, 100, 54, 54), m_poly([(42, 120), (214, 120), (128, 222)]))
    extrude(c, heart, '#BE123C', 7)
    clay(c, heart, '#F43F5E', light=0.5)
    tiny_face(c, 128, 128, 1.5)
    cheek(c, 92, 146, 9)
    cheek(c, 164, 146, 9)
    sparkle(c, 222, 40, 10)
    return c


def icon_apple():
    c = new_canvas()
    clay(c, m_tube(bezier((128, 70), (130, 50), (142, 30), 20), 9), '#78350F', gloss=0)
    clay(c, m_ellipse(170, 46, 30, 14, angle=-30), '#22C55E', light=0.45)
    apple = m_union(m_ellipse(98, 140, 66, 76), m_ellipse(158, 140, 66, 76))
    extrude(c, apple, '#991B1B', 6)
    clay(c, apple, '#EF4444', light=0.5, gloss=170)
    tiny_face(c, 128, 150, 1.4)
    return c


def icon_drop():
    c = new_canvas()
    drop = m_union(m_ellipse(128, 156, 70, 70), m_poly([(128, 26), (62, 136), (194, 136)]))
    extrude(c, drop, '#0369A1', 6)
    clay(c, drop, '#38BDF8', light=0.55, gloss=170)
    tiny_face(c, 128, 164, 1.4)
    for (x, y, r) in ((44, 208, 10), (214, 210, 8), (226, 180, 6)):
        clay(c, m_ellipse(x, y, r, r), '#7DD3FC', light=0.5)
    d = ImageDraw.Draw(c)
    for k, y in enumerate((60, 84)):
        d.arc([P(176), P(y - 10), P(236), P(y + 10)], 180, 360, fill=hexc('#94A3B8'), width=P(4))
    return c


def icon_weather():
    c = new_canvas()
    for i, col in enumerate(['#F43F5E', '#F59E0B', '#10B981', '#0EA5E9']):
        rad = 84 - i * 13
        pts = [(110 + math.cos(math.radians(a)) * rad, 150 - math.sin(math.radians(a)) * rad) for a in range(10, 171, 4)]
        clay(c, m_tube(pts, 12), col, gloss=0, rim=0.3)
    clay(c, m_poly(star_points(172, 84, 62, 46, 12, -90)), '#FDE047', light=0.4, gloss=0)
    clay(c, m_ellipse(172, 84, 44, 44), '#FBBF24', light=0.5)
    for (x, y, r) in ((72, 176, 40), (118, 158, 50), (166, 178, 40), (110, 196, 44)):
        clay(c, m_ellipse(x, y, r, r * 0.86), '#FFFFFF', light=0.06, dark=0.12)
    tiny_face(c, 116, 180, 1.4)
    return c


def icon_magnifier():
    c = new_canvas()
    clay(c, line_tube((150, 150), (222, 222), 28), '#F43F5E')
    lens = m_ellipse(108, 108, 70, 70)
    flat(c, lens, '#BAE6FD', alpha=150)
    flat(c, m_ellipse(88, 86, 26, 18, angle=-30), '#FFFFFF', blur=2, alpha=200)
    ring = ImageChops.subtract(m_ellipse(108, 108, 84, 84), lens)
    extrude(c, ring, '#B45309', 5)
    clay(c, ring, '#FBBF24', light=0.5)
    sparkle(c, 214, 54, 10, '#FDE047')
    return c


# ------------------------------------------------------------------ english

def icon_megaphone():
    c = new_canvas()
    clay(c, m_rrect(84, 150, 108, 206, 8), '#334155', gloss=0)
    cone = m_poly([(40, 108), (172, 50), (172, 206), (40, 150)])
    extrude(c, cone, '#BE123C', 6)
    clay(c, cone, '#F43F5E', light=0.45)
    clay(c, m_ellipse(172, 128, 22, 80), '#FB7185', light=0.3)
    clay(c, m_ellipse(176, 128, 13, 62), '#9F1239', gloss=0)
    clay(c, m_rrect(26, 100, 52, 158, 10), '#FBBF24', gloss=60)
    for i, (col, r) in enumerate((('#0EA5E9', 30), ('#10B981', 52), ('#F59E0B', 74))):
        pts = [(200 + math.cos(math.radians(a)) * r * 0.5, 128 + math.sin(math.radians(a)) * r) for a in range(-50, 51, 5)]
        clay(c, m_tube(pts, 9), col, gloss=0)
    return c


def icon_grammar():
    c = new_canvas()
    f1 = candy_glyph(c, 'A', 92, 128, 160, LATIN_FONT, '#F43F5E', '#BE123C')
    f2 = candy_glyph(c, 'a', 184, 150, 120, LATIN_FONT, '#0EA5E9', '#0369A1')
    x, y = centroid(f1)
    tiny_face(c, x, y + 12, 1.1)
    x, y = centroid(f2)
    tiny_face(c, x, y, 1.0)
    sparkle(c, 220, 44, 9, '#FDE047')
    return c


def icon_pencil():
    def draw(sub):
        body = m_rrect(56, 100, 196, 156, 8)
        extrude(sub, body, '#B45309', 6)
        clay(sub, body, '#FBBF24', light=0.45)
        flat(sub, m_rrect(56, 118, 196, 124, 2), '#F59E0B')
        flat(sub, m_rrect(56, 134, 196, 140, 2), '#F59E0B')
        clay(sub, m_poly([(196, 100), (238, 128), (196, 156)]), '#FDE68A', gloss=0)
        clay(sub, m_poly([(224, 119), (240, 128), (224, 137)]), '#334155', gloss=0)
        clay(sub, m_rrect(40, 98, 60, 158, 4), '#CBD5E1', gloss=60)
        clay(sub, m_rrect(14, 100, 44, 156, 12), '#F9A8D4', light=0.4)
        tiny_face(sub, 130, 126, 1.2)
    c = rotated(draw, 32)
    sparkle(c, 214, 200, 9, '#FDE047')
    sparkle(c, 50, 50, 7)
    return c


def icon_house():
    c = new_canvas()
    clay(c, m_rrect(164, 44, 190, 96, 4), '#B45309', gloss=0)
    walls = m_rrect(56, 112, 200, 222, 12)
    extrude(c, walls, '#C2410C', 6)
    clay(c, walls, '#FDBA74', light=0.4)
    roof = m_poly([(36, 124), (128, 40), (220, 124)])
    extrude(c, roof, '#991B1B', 6)
    clay(c, roof, '#EF4444', light=0.45)
    clay(c, m_union(m_rrect(110, 160, 146, 222, 6), m_ellipse(128, 162, 18, 16)), '#92400E', gloss=0)
    flat(c, m_ellipse(138, 194, 3, 3), '#FBBF24')
    for x in (70, 158):
        clay(c, m_rrect(x, 136, x + 28, 162, 6), '#7DD3FC', light=0.5, gloss=120)
    return c


def icon_music():
    c = new_canvas()
    beam = m_poly([(104, 56), (196, 36), (196, 60), (104, 80)])
    clay(c, m_union(beam, m_rrect(98, 58, 112, 178, 6), m_rrect(188, 38, 202, 158, 6)), '#7C3AED', gloss=0)
    for (x, y) in ((84, 180), (174, 160)):
        head = m_ellipse(x, y, 30, 24, angle=20)
        extrude(c, head, '#5B21B6', 5)
        clay(c, head, '#8B5CF6', light=0.5)
    tiny_face(c, 84, 180, 1.1)
    for (x, y, R) in ((40, 70, 14), (228, 112, 11), (150, 214, 9)):
        clay(c, m_poly(star_points(x, y, R, R * 0.45)), '#FBBF24', gloss=40)
    return c


# ------------------------------------------------------------------ gk

def icon_pin():
    c = new_canvas()
    clay(c, m_ellipse(128, 222, 82, 18), '#4ADE80', light=0.3, gloss=0)
    pin = m_union(m_ellipse(128, 96, 66, 66), m_poly([(72, 130), (184, 130), (128, 218)]))
    extrude(c, pin, '#BE123C', 6)
    clay(c, pin, '#F43F5E', light=0.5)
    clay(c, m_ellipse(128, 96, 28, 28), '#FFFFFF', light=0.05, dark=0.1)
    sparkle(c, 220, 44, 9, '#FDE047')
    return c


def icon_flag():
    c = new_canvas()
    clay(c, m_rrect(48, 40, 62, 230, 6), '#94A3B8')
    clay(c, m_ellipse(55, 36, 12, 12), '#FBBF24', light=0.5)
    pts_top = [(62 + t * 1.6, 52 + 10 * math.sin(t / 20)) for t in range(0, 101, 4)]
    pts_bot = [(62 + t * 1.6, 152 + 10 * math.sin(t / 20)) for t in range(100, -1, -4)]
    flag = m_poly(pts_top + pts_bot)
    clay(c, flag, '#0EA5E9', light=0.45)
    clay(c, m_poly(star_points(140, 104, 30, 13)), '#FDE047', light=0.4, gloss=40)
    sparkle(c, 226, 196, 9, '#FDE047')
    return c


def icon_temple():
    c = new_canvas()
    for x in (48, 192):
        clay(c, m_rrect(x - 12, 96, x + 12, 214, 6), '#FEF3C7', light=0.1, dark=0.15)
        clay(c, m_ellipse(x, 92, 16, 14), '#FBBF24', light=0.5)
    base = m_rrect(66, 132, 190, 216, 10)
    extrude(c, base, '#D97706', 5)
    clay(c, base, '#FEF3C7', light=0.1, dark=0.15)
    dome = m_clip(m_ellipse(128, 132, 58, 74), m_poly([(0, 0), (256, 0), (256, 132), (0, 132)]))
    clay(c, dome, '#FBBF24', light=0.5)
    clay(c, m_rrect(124, 34, 132, 62, 3), '#F59E0B', gloss=0)
    clay(c, m_ellipse(128, 32, 8, 8), '#F59E0B', light=0.5)
    clay(c, m_union(m_rrect(110, 168, 146, 216, 6), m_ellipse(128, 168, 18, 18)), '#7C2D12', gloss=0)
    sparkle(c, 220, 50, 9, '#FDE047')
    return c


def icon_scroll():
    c = new_canvas()
    paper = m_rrect(56, 52, 200, 204, 6)
    clay(c, paper, '#FEF3C7', light=0.1, dark=0.15)
    d = ImageDraw.Draw(c)
    for k in range(5):
        y = 84 + k * 22
        d.line([(P(76), P(y)), (P(180 - (k % 2) * 30), P(y))], fill=hexc('#D6B98A'), width=P(4))
    for y in (52, 204):
        clay(c, m_rrect(40, y - 14, 216, y + 14, 14), '#F59E0B', light=0.45)
    clay(c, m_ellipse(172, 178, 20, 20), '#EF4444', light=0.5)
    return c


def icon_car():
    c = new_canvas()
    cabin = m_union(m_rrect(76, 70, 180, 140, 26))
    clay(c, cabin, '#EF4444', light=0.45)
    for (x0, x1) in ((90, 124), (132, 166)):
        clay(c, m_rrect(x0, 84, x1, 124, 10), '#7DD3FC', light=0.5, gloss=120)
    body = m_rrect(30, 118, 226, 186, 28)
    extrude(c, body, '#991B1B', 6)
    clay(c, body, '#F43F5E', light=0.45)
    clay(c, m_ellipse(214, 142, 10, 9), '#FDE047', light=0.5)
    smile(c, 128, 156, 16)
    for x in (76, 180):
        w = m_ellipse(x, 190, 30, 30)
        clay(c, w, '#334155', light=0.25)
        clay(c, m_ellipse(x, 190, 13, 13), '#CBD5E1', gloss=60)
    return c


def icon_feather():
    c = new_canvas()
    clay(c, m_tube(bezier((70, 236), (100, 150), (170, 40), 40), 7), '#A16207', gloss=0)
    vane = m_ellipse(140, 104, 50, 82, angle=-32)
    extrude(c, vane, '#0F766E', 4)
    clay(c, vane, '#14B8A6', light=0.45)
    for (r, col) in ((34, '#FBBF24'), (24, '#2563EB'), (13, '#1E3A8A')):
        clay(c, m_ellipse(150, 84, r, r * 1.15, angle=-32), col, light=0.45, gloss=80 if r == 13 else 40)
    sparkle(c, 220, 200, 9, '#FDE047')
    sparkle(c, 46, 60, 7)
    return c


def icon_gear():
    c = new_canvas()

    def gear(cx, cy, r, teeth):
        m = m_ellipse(cx, cy, r, r)
        for i in range(teeth):
            m = m_union(m, rot_mask(m_rrect(cx - r * 0.18, cy - r - r * 0.24, cx + r * 0.18, cy - r + 6, 4), i * 360 / teeth, cx, cy))
        return ImageChops.subtract(m, m_ellipse(cx, cy, r * 0.3, r * 0.3))

    g2 = gear(184, 186, 40, 8)
    extrude(c, g2, '#0369A1', 5)
    clay(c, g2, '#0EA5E9', light=0.45)
    g1 = gear(104, 104, 66, 10)
    extrude(c, g1, '#B45309', 6)
    clay(c, g1, '#F59E0B', light=0.5)
    sparkle(c, 220, 50, 10, '#FDE047')
    return c


def icon_treasure_map():
    c = new_canvas()
    panels = [((30, 60), (100, 44), (100, 214), (30, 198), '#FDE68A'),
              ((100, 44), (164, 62), (164, 214), (100, 214), '#FCD34D'),
              ((164, 62), (228, 46), (228, 196), (164, 214), '#FDE68A')]
    for a, b, cc, dd, col in panels:
        clay(c, m_poly([a, b, cc, dd]), col, light=0.25, dark=0.15, rim=0.3, gloss=0)
    clay(c, m_ellipse(70, 110, 26, 20), '#4ADE80', light=0.3, gloss=0)
    for i, (x, y) in enumerate(bezier((70, 120), (120, 210), (186, 110), 14)):
        if i % 2 == 0:
            flat(c, m_ellipse(x, y, 4, 4), '#F43F5E')
    x_mark = m_union(rot_mask(m_rrect(160, 90, 212, 104, 6), 45, 186, 97), rot_mask(m_rrect(160, 90, 212, 104, 6), -45, 186, 97))
    clay(c, x_mark, '#EF4444', light=0.4)
    return c


# ------------------------------------------------------------------ logic

def icon_shapes_seq():
    c = new_canvas()
    circle = m_ellipse(56, 150, 36, 36)
    tri = m_poly([(128, 102), (90, 186), (166, 186)])
    sq = m_rrect(170, 114, 238, 182, 10)
    for m, col, edge in ((circle, '#0EA5E9', '#0369A1'), (tri, '#F43F5E', '#BE123C'), (sq, '#FBBF24', '#B45309')):
        extrude(c, m, edge, 6)
        clay(c, m, col, light=0.5)
    tiny_face(c, 128, 160, 1.0)
    sparkle(c, 128, 50, 10, '#FDE047')
    return c


def icon_odd_one():
    c = new_canvas()
    for (x, y) in ((76, 80), (180, 80), (76, 184)):
        b = m_ellipse(x, y, 44, 44)
        extrude(c, b, '#0369A1', 5)
        clay(c, b, '#38BDF8', light=0.55, gloss=170)
    st = m_poly(star_points(180, 186, 52, 24))
    extrude(c, st, '#B45309', 6)
    clay(c, st, '#FBBF24', light=0.55)
    tiny_face(c, 180, 190, 0.9)
    sparkle(c, 236, 140, 8, '#FDE047')
    return c


def icon_key():
    def draw(sub):
        bow = ImageChops.subtract(m_ellipse(70, 128, 50, 50), m_ellipse(70, 128, 20, 20))
        shaft = m_rrect(112, 116, 232, 140, 8)
        teeth = m_union(m_rrect(196, 138, 210, 168, 3), m_rrect(216, 138, 230, 160, 3))
        k = m_union(bow, shaft, teeth)
        extrude(sub, k, '#B45309', 7)
        clay(sub, k, '#FBBF24', light=0.55)
    c = rotated(draw, 30)
    for (x, y, r) in ((214, 52, 11), (46, 200, 8), (200, 200, 7)):
        sparkle(c, x, y, r, '#FDE047')
    return c


TOPIC_ICONS = {
    'addition': sign_icon('plus', '#10B981', '#047857'),
    'subtraction': sign_icon('minus', '#F43F5E', '#BE123C'),
    'multiplication': sign_icon('times', '#0EA5E9', '#0369A1'),
    'division': sign_icon('divide', '#8B5CF6', '#5B21B6'),
    'fractions': icon_pizza,
    'decimals': icon_decimals,
    'geometry': icon_geometry,
    'measurement': icon_ruler,
    'time': icon_clock,
    'money': icon_money,
    'patterns': icon_beads,
    'algebra': cube_q('#8B5CF6', '?'),
    'wordproblems': bubble_icon('#0EA5E9', '#0369A1', 'q'),
    'sentences': bubble_icon('#8B5CF6', '#5B21B6', 'dots'),
    'paw': icon_paw,
    'sprout': icon_sprout,
    'heart': icon_heart,
    'apple': icon_apple,
    'drop': icon_drop,
    'weather': icon_weather,
    'magnifier': icon_magnifier,
    'megaphone': icon_megaphone,
    'vowels': icon_123('AEI', LATIN_FONT, 118),
    'grammar': icon_grammar,
    'pencil': icon_pencil,
    'house': icon_house,
    'music': icon_music,
    'pin': icon_pin,
    'flag': icon_flag,
    'temple': icon_temple,
    'scroll': icon_scroll,
    'car': icon_car,
    'feather': icon_feather,
    'gear': icon_gear,
    'treasuremap': icon_treasure_map,
    'series': icon_123('246', LATIN_FONT, 128),
    'shapes': icon_shapes_seq,
    'oddone': icon_odd_one,
    'key': icon_key,
}

if __name__ == '__main__':
    only = sys.argv[2:]
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in TOPIC_ICONS.items():
        if only and name not in only:
            continue
        finish(fn()).save(OUT / f'{name}.png', 'PNG', optimize=True)
        print('generated', name)

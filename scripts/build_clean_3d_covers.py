"""
Builds studio-quality 3D Pixar Character Showcase covers.
Features:
- Pure 3D studio lighting (radial top spotlight, soft warm ambient fill).
- Soft 3D claymorphic floor with realistic contact shadow and ambient occlusion.
- High-resolution 1024x1024 3D character front and center (no flat 2D drawn hills, no other animals).
- Floating golden stars and delicate bokeh light particles.
"""
import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

OUTPUT_DIR_ASSETS = r'assets\images\stories'
OUTPUT_DIR_BACKEND = r'backend\media\stories'
CHARS_DIR = r'assets\images\characters'

WIDTH = 640
HEIGHT = 420

def create_radial_spotlight(top_rgb, floor_rgb, spot_rgb=(255, 255, 255)):
    # Create soft studio background
    base = Image.new('RGBA', (WIDTH, HEIGHT), (0,0,0,0))
    draw = ImageDraw.Draw(base)
    # Background vertical gradient
    for y in range(HEIGHT):
        ratio = y / float(HEIGHT)
        r = int(top_rgb[0] * (1 - ratio) + floor_rgb[0] * ratio)
        g = int(top_rgb[1] * (1 - ratio) + floor_rgb[1] * ratio)
        b = int(top_rgb[2] * (1 - ratio) + floor_rgb[2] * ratio)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b, 255))

    # Top radial spotlight
    spot = Image.new('RGBA', (WIDTH, HEIGHT), (0,0,0,0))
    sdraw = ImageDraw.Draw(spot)
    cx, cy = WIDTH // 2, 80
    for r in range(280, 20, -10):
        alpha = int(35 * (1 - r / 280.0))
        sdraw.ellipse([cx - r * 1.5, cy - r, cx + r * 1.5, cy + r], fill=(*spot_rgb, alpha))
    spot = spot.filter(ImageFilter.GaussianBlur(25))
    base.alpha_composite(spot)

    # Soft 3D clay platform/floor at bottom
    floor = Image.new('RGBA', (WIDTH, HEIGHT), (0,0,0,0))
    fdraw = ImageDraw.Draw(floor)
    pw = 520
    ph = 140
    px = (WIDTH - pw) // 2
    py = HEIGHT - 110
    fdraw.ellipse([px, py, px + pw, py + ph], fill=(255, 255, 255, 110))
    floor = floor.filter(ImageFilter.GaussianBlur(15))
    base.alpha_composite(floor)

    return base

def draw_bokeh(img, count=15, tint=(255, 255, 255)):
    layer = Image.new('RGBA', (WIDTH, HEIGHT), (0,0,0,0))
    draw = ImageDraw.Draw(layer)
    coords = [
        (80, 100, 24), (160, 70, 36), (480, 90, 28), (560, 130, 40),
        (120, 240, 20), (520, 260, 32), (240, 50, 18), (400, 60, 22),
        (70, 320, 30), (570, 310, 26), (300, 40, 20), (360, 50, 16)
    ]
    for x, y, r in coords[:count]:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(*tint, 55))
    layer = layer.filter(ImageFilter.GaussianBlur(10))
    img.alpha_composite(layer)

def draw_sparkle_stars(img, coords):
    sparkle = Image.new('RGBA', (WIDTH, HEIGHT), (0,0,0,0))
    sdraw = ImageDraw.Draw(sparkle)
    for x, y, size in coords:
        sdraw.line([(x - size, y), (x + size, y)], fill=(255, 255, 255, 240), width=2)
        sdraw.line([(x, y - size), (x, y + size)], fill=(255, 255, 255, 240), width=2)
        sdraw.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(255, 255, 255, 255))
    sparkle = sparkle.filter(ImageFilter.GaussianBlur(1))
    img.alpha_composite(sparkle)

def paste_character(bg, char_path, target_height=270, x_center=320, y_bottom=HEIGHT - 25):
    if not os.path.exists(char_path):
        print(f"Warning: {char_path} not found")
        return
    char = Image.open(char_path).convert('RGBA')
    aspect = char.width / float(char.height)
    new_h = target_height
    new_w = int(new_h * aspect)
    char = char.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # 3D contact drop shadow on the studio floor
    shadow = Image.new('RGBA', bg.size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sw = int(new_w * 0.82)
    sh = int(new_h * 0.18)
    sx = x_center - sw // 2
    sy = y_bottom - sh // 2
    sdraw.ellipse([sx, sy, sx + sw, sy + sh], fill=(15, 23, 42, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    bg.alpha_composite(shadow)

    # Paste character
    px = x_center - new_w // 2
    py = y_bottom - new_h + 10
    bg.alpha_composite(char, (px, py))

def save_cover(img, filename):
    p1 = os.path.join(OUTPUT_DIR_ASSETS, filename)
    p2 = os.path.join(OUTPUT_DIR_BACKEND, filename)
    img.save(p1, 'PNG', optimize=True)
    img.save(p2, 'PNG', optimize=True)
    print(f" -> Saved 3D Studio Showcase {filename}")

def generate_studio_covers():
    os.makedirs(OUTPUT_DIR_ASSETS, exist_ok=True)
    os.makedirs(OUTPUT_DIR_BACKEND, exist_ok=True)

    # 1. THE FOX AND THE SOUR GRAPES (Warm Peach & Lavender 3D Studio Stage)
    print("Building 3D Studio: story_fox_grapes_cover.png...")
    bg = create_radial_spotlight((253, 230, 138), (254, 215, 170), (255, 255, 255)) # Soft Warm Marigold
    draw_bokeh(bg, 10, (253, 186, 116))
    draw_sparkle_stars(bg, [(120, 100, 8), (520, 120, 9), (180, 70, 6), (460, 60, 7), (540, 240, 8)])
    paste_character(bg, os.path.join(CHARS_DIR, '3d_fox.png'), target_height=275, x_center=320, y_bottom=HEIGHT - 25)
    save_cover(bg, 'story_fox_grapes_cover.png')

    # 2. THE KIND LITTLE SPARROW (Fairy Lavender & Soft Rose 3D Studio Stage)
    print("Building 3D Studio: story_kind_sparrow_cover.png / story_sparrow_cover.png...")
    bg = create_radial_spotlight((233, 213, 255), (254, 205, 211), (255, 255, 255)) # Pastel Violet / Rose
    draw_bokeh(bg, 10, (244, 114, 182))
    draw_sparkle_stars(bg, [(100, 90, 8), (540, 110, 9), (200, 60, 7), (440, 75, 8), (120, 260, 7)])
    paste_character(bg, os.path.join(CHARS_DIR, '3d_sparrow.png'), target_height=265, x_center=320, y_bottom=HEIGHT - 30)
    save_cover(bg, 'story_kind_sparrow_cover.png')
    save_cover(bg, 'story_sparrow_cover.png')

    # 3. THE LION AND THE MOUSE (Golden Amber Sunrise 3D Studio Stage)
    print("Building 3D Studio: story_lion_mouse_cover.png...")
    bg = create_radial_spotlight((254, 240, 138), (251, 191, 36), (255, 255, 255)) # Radiant Gold
    draw_bokeh(bg, 12, (245, 158, 11))
    draw_sparkle_stars(bg, [(140, 90, 9), (500, 100, 8), (220, 60, 7), (420, 70, 7)])
    paste_character(bg, os.path.join(CHARS_DIR, '3d_lion.png'), target_height=265, x_center=240, y_bottom=HEIGHT - 25)
    paste_character(bg, os.path.join(CHARS_DIR, '3d_mouse.png'), target_height=145, x_center=440, y_bottom=HEIGHT - 25)
    save_cover(bg, 'story_lion_mouse_cover.png')

    # 4. THE CLEVER CROW (Ocean Cyan & Sky Blue 3D Studio Stage)
    print("Building 3D Studio: story_crow_cover.png...")
    bg = create_radial_spotlight((186, 230, 253), (125, 211, 252), (255, 255, 255))
    draw_bokeh(bg, 10, (14, 165, 233))
    draw_sparkle_stars(bg, [(110, 80, 8), (530, 110, 9), (240, 60, 7), (400, 70, 7)])
    paste_character(bg, os.path.join(CHARS_DIR, '3d_crow.png'), target_height=260, x_center=320, y_bottom=HEIGHT - 25)
    save_cover(bg, 'story_crow_cover.png')

    # 5. THE TORTOISE AND THE HARE (Spring Mint & Sunshine 3D Studio Stage)
    print("Building 3D Studio: story_tortoise_hare_cover.png...")
    bg = create_radial_spotlight((167, 243, 208), (110, 231, 183), (255, 255, 255)) # Fresh Mint
    draw_bokeh(bg, 10, (16, 185, 129))
    draw_sparkle_stars(bg, [(120, 90, 8), (520, 100, 8), (320, 50, 7)])
    paste_character(bg, os.path.join(CHARS_DIR, '3d_tortoise.png'), target_height=210, x_center=200, y_bottom=HEIGHT - 25)
    paste_character(bg, os.path.join(CHARS_DIR, '3d_hare.png'), target_height=255, x_center=430, y_bottom=HEIGHT - 25)
    save_cover(bg, 'story_tortoise_hare_cover.png')

    # 6. THE MONKEY AND THE CROCODILE (Tropical Lagoon 3D Studio Stage)
    print("Building 3D Studio: story_monkey_crocodile_cover.png...")
    bg = create_radial_spotlight((186, 230, 253), (153, 246, 228), (255, 255, 255)) # Sky & Teal
    draw_bokeh(bg, 10, (20, 184, 166))
    draw_sparkle_stars(bg, [(100, 80, 8), (540, 100, 8), (320, 60, 7)])
    paste_character(bg, os.path.join(CHARS_DIR, '3d_monkey.png'), target_height=240, x_center=200, y_bottom=HEIGHT - 35)
    paste_character(bg, os.path.join(CHARS_DIR, '3d_crocodile.png'), target_height=210, x_center=430, y_bottom=HEIGHT - 25)
    save_cover(bg, 'story_monkey_crocodile_cover.png')

    # 7. THE ANT AND THE DOVE (Celestial Sky Blue 3D Studio Stage)
    print("Building 3D Studio: story_ant_dove_cover.png...")
    bg = create_radial_spotlight((224, 242, 254), (186, 230, 253), (255, 255, 255))
    draw_bokeh(bg, 10, (56, 189, 248))
    draw_sparkle_stars(bg, [(120, 90, 8), (520, 100, 8), (320, 50, 7)])
    paste_character(bg, os.path.join(CHARS_DIR, '3d_dove.png'), target_height=240, x_center=210, y_bottom=HEIGHT - 35)
    paste_character(bg, os.path.join(CHARS_DIR, '3d_ant.png'), target_height=190, x_center=440, y_bottom=HEIGHT - 25)
    save_cover(bg, 'story_ant_dove_cover.png')

    # 8. THE HONEST WOODCUTTER (Warm Golden Amber 3D Studio Stage)
    print("Building 3D Studio: story_woodcutter_cover.png...")
    bg = create_radial_spotlight((254, 243, 199), (253, 230, 138), (255, 255, 255))
    draw_bokeh(bg, 10, (245, 158, 11))
    draw_sparkle_stars(bg, [(110, 80, 8), (530, 90, 8), (320, 60, 7)])
    paste_character(bg, os.path.join(CHARS_DIR, '3d_woodcutter.png'), target_height=265, x_center=320, y_bottom=HEIGHT - 25)
    save_cover(bg, 'story_woodcutter_cover.png')
    save_cover(bg, 'story_honest_woodcutter_cover.png')

    print("All 3D Pixar Studio Showcase Covers successfully generated!")

if __name__ == '__main__':
    generate_studio_covers()

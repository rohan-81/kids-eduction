"""
Builds cinematic 3D Disney/Pixar style fairytale storybook covers
by placing 1024x1024 3D transparent character renders onto lush 3D cartoon
scenic backdrops (cartoon_garden.jpg, cartoon_adventure.jpg, fantasy_adventure_header.jpg).
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

OUTPUT_DIR_ASSETS = r'assets\images\stories'
OUTPUT_DIR_BACKEND = r'backend\media\stories'
CHARS_DIR = r'assets\images\characters'
BG_DIR = r'assets\images'

WIDTH = 640
HEIGHT = 420

def get_cinematic_bg(bg_name, crop_box=None, blur_amount=0):
    bg_path = os.path.join(BG_DIR, bg_name)
    bg = Image.open(bg_path).convert('RGBA')
    if crop_box:
        bg = bg.crop(crop_box)
    bg = bg.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    if blur_amount > 0:
        bg = bg.filter(ImageFilter.GaussianBlur(blur_amount))
    
    # Warm cinematic color grade
    enhancer = ImageEnhance.Color(bg)
    bg = enhancer.enhance(1.15)
    bright = ImageEnhance.Brightness(bg)
    bg = bright.enhance(1.05)
    return bg

def add_vignette(img):
    vignette = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(vignette)
    for i in range(40):
        alpha = int(45 * (i / 40.0))
        draw.rectangle([i, i, WIDTH - i, HEIGHT - i], outline=(15, 23, 42, alpha))
    vignette = vignette.filter(ImageFilter.GaussianBlur(12))
    img.alpha_composite(vignette)

def paste_character(bg, char_path, target_height=260, x_center=320, y_bottom=HEIGHT - 25):
    if not os.path.exists(char_path):
        print(f"Warning: {char_path} not found")
        return
    char = Image.open(char_path).convert('RGBA')
    aspect = char.width / float(char.height)
    new_h = target_height
    new_w = int(new_h * aspect)
    char = char.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # 3D contact drop shadow on the ground
    shadow = Image.new('RGBA', bg.size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sw = int(new_w * 0.8)
    sh = int(new_h * 0.18)
    sx = x_center - sw // 2
    sy = y_bottom - sh // 2
    sdraw.ellipse([sx, sy, sx + sw, sy + sh], fill=(10, 15, 30, 140))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    bg.alpha_composite(shadow)

    # Paste character
    px = x_center - new_w // 2
    py = y_bottom - new_h + 10
    bg.alpha_composite(char, (px, py))

def save_cover(img, filename):
    add_vignette(img)
    p1 = os.path.join(OUTPUT_DIR_ASSETS, filename)
    p2 = os.path.join(OUTPUT_DIR_BACKEND, filename)
    img.save(p1, 'PNG', optimize=True)
    img.save(p2, 'PNG', optimize=True)
    print(f" -> Saved {filename} with 3D cinematic background")

def generate_all_covers():
    os.makedirs(OUTPUT_DIR_ASSETS, exist_ok=True)
    os.makedirs(OUTPUT_DIR_BACKEND, exist_ok=True)

    # 1. THE FOX AND SOUR GRAPES (Lush 3D cartoon garden with 3D Fox)
    print("Building 3D Cover: story_fox_grapes_cover.png...")
    bg = get_cinematic_bg('cartoon_garden.jpg', crop_box=(150, 100, 1250, 750))
    # Juicy 3D purple grapes hanging on top right
    gdraw = ImageDraw.Draw(bg)
    grape_centers = [(480, 70), (495, 90), (465, 90), (480, 110), (510, 110), (495, 130), (480, 150)]
    for gx, gy in grape_centers:
        gdraw.ellipse([gx - 18, gy - 18, gx + 18, gy + 18], fill=(147, 51, 234, 255), outline=(107, 33, 168, 255), width=2)
    # Vine leaves
    gdraw.ellipse([440, 30, 520, 60], fill=(34, 197, 94, 255))
    gdraw.ellipse([480, 35, 560, 65], fill=(22, 163, 74, 255))
    paste_character(bg, os.path.join(CHARS_DIR, '3d_fox.png'), target_height=270, x_center=240, y_bottom=HEIGHT - 20)
    save_cover(bg, 'story_fox_grapes_cover.png')

    # 2. THE KIND LITTLE SPARROW (Blooming 3D cartoon garden with 3D baby sparrow)
    print("Building 3D Cover: story_kind_sparrow_cover.png / story_sparrow_cover.png...")
    bg = get_cinematic_bg('cartoon_garden.jpg', crop_box=(0, 50, 1100, 700))
    paste_character(bg, os.path.join(CHARS_DIR, '3d_sparrow.png'), target_height=260, x_center=320, y_bottom=HEIGHT - 25)
    save_cover(bg, 'story_kind_sparrow_cover.png')
    save_cover(bg, 'story_sparrow_cover.png')

    # 3. THE LION AND THE MOUSE (Rich 3D cartoon savanna/jungle with 3D Lion & 3D Mouse)
    print("Building 3D Cover: story_lion_mouse_cover.png...")
    bg = get_cinematic_bg('cartoon_hero.jpg', crop_box=(100, 50, 1280, 720))
    paste_character(bg, os.path.join(CHARS_DIR, '3d_lion.png'), target_height=270, x_center=250, y_bottom=HEIGHT - 20)
    paste_character(bg, os.path.join(CHARS_DIR, '3d_mouse.png'), target_height=140, x_center=440, y_bottom=HEIGHT - 25)
    save_cover(bg, 'story_lion_mouse_cover.png')

    # 4. THE CLEVER CROW (3D cartoon desert/garden with 3D Crow & pitcher)
    print("Building 3D Cover: story_crow_cover.png...")
    bg = get_cinematic_bg('fantasy_adventure_header.jpg', crop_box=(150, 80, 1250, 720))
    paste_character(bg, os.path.join(CHARS_DIR, '3d_crow.png'), target_height=250, x_center=300, y_bottom=HEIGHT - 25)
    save_cover(bg, 'story_crow_cover.png')

    # 5. THE TORTOISE AND THE HARE (3D cartoon green meadow with 3D Tortoise & 3D Hare)
    print("Building 3D Cover: story_tortoise_hare_cover.png...")
    bg = get_cinematic_bg('cartoon_garden.jpg', crop_box=(200, 120, 1300, 760))
    paste_character(bg, os.path.join(CHARS_DIR, '3d_tortoise.png'), target_height=210, x_center=190, y_bottom=HEIGHT - 20)
    paste_character(bg, os.path.join(CHARS_DIR, '3d_hare.png'), target_height=260, x_center=440, y_bottom=HEIGHT - 20)
    save_cover(bg, 'story_tortoise_hare_cover.png')

    # 6. THE MONKEY AND THE CROCODILE (3D cartoon jungle river with 3D Monkey & 3D Crocodile)
    print("Building 3D Cover: story_monkey_crocodile_cover.png...")
    bg = get_cinematic_bg('cartoon_adventure.jpg', crop_box=(100, 80, 1200, 720))
    paste_character(bg, os.path.join(CHARS_DIR, '3d_monkey.png'), target_height=240, x_center=190, y_bottom=HEIGHT - 35)
    paste_character(bg, os.path.join(CHARS_DIR, '3d_crocodile.png'), target_height=210, x_center=430, y_bottom=HEIGHT - 20)
    save_cover(bg, 'story_monkey_crocodile_cover.png')

    # 7. THE ANT AND THE DOVE (3D cartoon forest river with 3D Ant & 3D Dove)
    print("Building 3D Cover: story_ant_dove_cover.png...")
    bg = get_cinematic_bg('cartoon_adventure.jpg', crop_box=(200, 100, 1300, 740))
    paste_character(bg, os.path.join(CHARS_DIR, '3d_dove.png'), target_height=240, x_center=200, y_bottom=HEIGHT - 35)
    paste_character(bg, os.path.join(CHARS_DIR, '3d_ant.png'), target_height=190, x_center=440, y_bottom=HEIGHT - 20)
    save_cover(bg, 'story_ant_dove_cover.png')

    # 8. THE HONEST WOODCUTTER (3D cartoon enchanted forest with 3D Woodcutter)
    print("Building 3D Cover: story_woodcutter_cover.png...")
    bg = get_cinematic_bg('cartoon_adventure.jpg', crop_box=(0, 60, 1100, 700))
    paste_character(bg, os.path.join(CHARS_DIR, '3d_woodcutter.png'), target_height=260, x_center=320, y_bottom=HEIGHT - 20)
    save_cover(bg, 'story_woodcutter_cover.png')
    save_cover(bg, 'story_honest_woodcutter_cover.png')

    print("All 3D Cinematic Story Covers successfully generated!")

if __name__ == '__main__':
    generate_all_covers()

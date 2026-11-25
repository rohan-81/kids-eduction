#!/usr/bin/env python3
"""
Slices the 3 ChatGPT DALL-E grid sheets:
  1. Cute 3D Space Character Sticker Grid.png (12 space items)
  2. Cheerful Weather Sticker Characters.png (7 weather items)
  3. Kawaii Water and Senses Sticker Sheet.png (10 water + 10 body items)
Cuts out white backgrounds, frames to 1024x1024 transparent RGBA,
saves to assets/images/characters/, and updates src/utils/extraRenders.ts.
"""
from __future__ import annotations
import shutil
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from generate_3d_animals import finish_and_save, CHAR_DIR, available_render
from import_extra_3d import rebuild_registry

DL = Path.home() / 'Downloads'

def slice_space():
    sheet_p = DL / 'Cute 3D Space Character Sticker Grid.png'
    if not sheet_p.exists():
        print(f"Skipping Space: {sheet_p} not found.")
        return
    print(f"Processing Space Sheet: {sheet_p.name} ...")
    im = Image.open(sheet_p).convert('RGB')
    
    row_ranges = [(0, 425), (425, 815), (815, 1254)]
    row_cuts = [
        [0, 362, 632, 928, 1254],
        [0, 310, 630, 965, 1254],
        [0, 335, 618, 949, 1254]
    ]
    space_names = [
        ['sun', 'mercury', 'venus', 'earth'],
        ['mars', 'jupiter', 'saturn', 'uranus'],
        ['neptune', 'moon', 'twinkling_star', 'rocket']
    ]

    for r, (y1, y2) in enumerate(row_ranges):
        cuts = row_cuts[r]
        for c in range(4):
            x1, x2 = cuts[c], cuts[c+1]
            stem = space_names[r][c]
            cell = im.crop((x1, y1, x2, y2))
            print(f"  Cropping Space: {stem} from ({x1}, {y1}) to ({x2}, {y2}) ...")
            finish_and_save(cell, stem, CHAR_DIR)

def slice_weather():
    sheet_p = DL / 'Cheerful Weather Sticker Characters.png'
    if not sheet_p.exists():
        print(f"Skipping Weather: {sheet_p} not found.")
        return
    print(f"Processing Weather Sheet: {sheet_p.name} ...")
    im = Image.open(sheet_p).convert('RGB')
    w, h = im.size
    cut_y = 486

    r0_cuts = [0, 443, 802, 1167, 1536]
    r0_names = ['summer', 'winter', 'spring', 'autumn']
    for c in range(4):
        x1, x2 = r0_cuts[c], r0_cuts[c+1]
        stem = r0_names[c]
        cell = im.crop((x1, 0, x2, cut_y))
        print(f"  Cropping Weather R0: {stem} ...")
        finish_and_save(cell, stem, CHAR_DIR)

    r1_cuts = [0, 590, 1082, 1536]
    r1_names = ['rainbow', 'windy', 'snowman']
    for c in range(3):
        x1, x2 = r1_cuts[c], r1_cuts[c+1]
        stem = r1_names[c]
        cell = im.crop((x1, cut_y, x2, h))
        print(f"  Cropping Weather R1: {stem} ...")
        finish_and_save(cell, stem, CHAR_DIR)

    # Also link sunny -> summer sun or space sun
    summer_p = CHAR_DIR / '3d_summer.png'
    sunny_p = CHAR_DIR / '3d_sunny.png'
    if summer_p.exists() and not sunny_p.exists():
        shutil.copy(summer_p, sunny_p)
        print("  Copied 3d_summer.png -> 3d_sunny.png")

def slice_water_and_body():
    sheet_p = DL / 'Kawaii Water and Senses Sticker Sheet.png'
    if not sheet_p.exists():
        print(f"Skipping Water & Body: {sheet_p} not found.")
        return
    print(f"Processing Water & Body Sheet: {sheet_p.name} ...")
    im = Image.open(sheet_p).convert('RGB')

    row_cuts = [0, 295, 546, 783, 1024]
    grid_cuts = [
        [0, 306, 600, 908, 1234, 1536],
        [0, 345, 618, 921, 1231, 1536],
        [0, 353, 602, 912, 1239, 1536],
        [0, 321, 624, 967, 1277, 1536],
    ]
    grid_names = [
        ['water_drop', 'rain_shower', 'clouds', 'river', 'ocean'],
        ['wind', 'oxygen', 'ice', 'water_cycle', 'drinking_water'],
        ['eyes', 'ears', 'nose', 'tongue', 'skin_hand'],
        ['brain', 'heart', 'teeth', 'legs', 'skeleton_bones']
    ]

    for r in range(4):
        y1, y2 = row_cuts[r], row_cuts[r+1]
        cols = grid_cuts[r]
        for c in range(5):
            x1, x2 = cols[c], cols[c+1]
            stem = grid_names[r][c]
            cell = im.crop((x1, y1, x2, y2))
            print(f"  Cropping Water/Body [{r},{c}]: {stem} ...")
            finish_and_save(cell, stem, CHAR_DIR)

def slice_grid_dynamically(sheet_p: Path, rows: int, cols: int, names: list[list[str]]):
    print(f"Processing Dynamic Grid Sheet: {sheet_p.name} ({rows}x{cols}) ...")
    im = Image.open(sheet_p).convert('RGB')
    w, h = im.size
    from PIL import ImageChops
    bg = Image.new('RGB', im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg).convert('L')
    
    # Find horizontal cuts between rows
    row_cuts = [0]
    for r in range(1, rows):
        b = int(r * (h / rows))
        win = diff.crop((0, max(0, b - 40), w, min(h, b + 40)))
        sums = [sum(win.crop((0, y, w, y + 1)).tobytes()) for y in range(win.height)]
        row_cuts.append(max(0, b - 40) + sums.index(min(sums)))
    row_cuts.append(h)

    for r in range(rows):
        y1, y2 = row_cuts[r], row_cuts[r + 1]
        row_diff = diff.crop((0, y1, w, y2))
        col_cuts = [0]
        for c in range(1, cols):
            b = int(c * (w / cols))
            win = row_diff.crop((max(0, b - 50), 0, min(w, b + 50), y2 - y1))
            sums = [sum(win.crop((x, 0, x + 1, y2 - y1)).tobytes()) for x in range(win.width)]
            col_cuts.append(max(0, b - 50) + sums.index(min(sums)))
        col_cuts.append(w)

        for c in range(cols):
            x1, x2 = col_cuts[c], col_cuts[c + 1]
            stem = names[r][c]
            cell = im.crop((x1, y1, x2, y2))
            print(f"  Cropping [{r},{c}]: {stem} from ({x1},{y1}) to ({x2},{y2}) ...")
            finish_and_save(cell, stem, CHAR_DIR)

def slice_earth_and_discoveries():
    # Check for Earth & Environment sheet
    earth_names = [
        ['earth_planet', 'mountains', 'forest', 'save_trees', 'recycle'],
        ['soil', 'sunlight', 'blue_sky', 'save_water', 'solar_energy']
    ]
    for p in DL.glob('*[Ee]arth*.png'):
        if p.name == 'Cute 3D Space Character Sticker Grid.png':
            continue
        slice_grid_dynamically(p, 2, 5, earth_names)
        break

    # Check for Scientific Discoveries sheet
    sci_names = [
        ['wheel', 'bulb', 'gravity', 'telescope', 'microscope'],
        ['telephone', 'airplane', 'steam_engine', 'computer', 'magnet']
    ]
    for p in DL.glob('*[Dd]iscover*.png'):
        slice_grid_dynamically(p, 2, 5, sci_names)
        break
    for p in DL.glob('*[Ss]cience*.png'):
        slice_grid_dynamically(p, 2, 5, sci_names)
        break
    for p in DL.glob('*[Ii]nvention*.png'):
        slice_grid_dynamically(p, 2, 5, sci_names)
        break

    # Check for Grammar sheet (2 rows x 4 cols = 8 items)
    gram_names = [
        ['gram_noun', 'gram_verb', 'gram_adjective', 'gram_pronoun'],
        ['gram_singular_plural', 'gram_capital', 'gram_period', 'gram_question']
    ]
    for p in DL.glob('*[Gg]rammar*.png'):
        slice_grid_dynamically(p, 2, 4, gram_names)
        break

def slice_english_actions_and_nouns():
    eng_names = [
        ['apple', 'play_together', 'fish', 'sleep'],
        ['dance', 'write', 'sing', 'swim'],
        ['person', 'place_school', 'proper_noun', 'common_city']
    ]
    skip_names = {
        'Playful Grammar Friends Sticker Grid.png',
        'Kawaii Water and Senses Sticker Sheet.png',
        'Cute 3D Space Character Sticker Grid.png',
        'Cheerful Weather Sticker Characters.png',
        'Kawaii Eco-Friendly Earth Mascot Collection.png',
        'Cheerful Invention Icons Collection.png'
    }
    for p in DL.glob('*.png'):
        if p.name in skip_names:
            continue
        if any(k in p.name.lower() for k in ['verb', 'action', 'sentence', 'english', 'activity', 'daily', 'kids']):
            slice_grid_dynamically(p, 3, 4, eng_names)
            break

RHYME_REGISTRY_TS = ROOT / 'src' / 'utils' / 'rhymeRenders.ts'
RHYME_MAPPING = {
    'twinkle': 'twinkling_star',
    'johny': 'johny',
    'black-sheep': 'sheep',
    'humpty': 'humpty',
    'jack-jill': 'person',
    'rain-rain': 'rain_shower',
    'row-boat': 'boat',
    'old-macdonald': 'cow',
    'chakiben': 'sparrow',
    'dhingli': 'dhingli',
    'ekdo-salekhdo': 'number_one',
    'aav-re-varsad': 'rainy',
    'mamanu-ghar': 'house',
    'machli': 'fish',
    'mota-hathi': 'elephant',
    'upar-pankha': 'sleep',
    'bandar-mama': 'monkey',
    'aalu-kachalu': 'potato',
}

def rebuild_rhyme_registry():
    lines = []
    for rid, stem in RHYME_MAPPING.items():
        if available_render(f'3d_{stem}') is not None:
            lines.append(f"  '{rid}': characterAsset('3d_{stem}'),")
    content = (
        "// AUTO-GENERATED for Nursery Rhymes & Balgeeto\n"
        "// Renders are served remotely (Django /media/characters/<key>.webp) and disk-cached by expo-image;\n"
        "// see src/utils/remoteAssets.ts. Bundled copies were removed to keep the app small.\n"
        "import { characterAsset, RemoteImageSource } from './remoteAssets';\n\n"
        "export const RHYME_3D_ASSETS: Record<string, RemoteImageSource> = {\n"
        + "\n".join(lines)
        + "\n};\n\n"
        "export function getRhyme3DVisual(rhymeId: string): RemoteImageSource | null {\n"
        "  return RHYME_3D_ASSETS[rhymeId] || null;\n"
        "}\n"
    )
    RHYME_REGISTRY_TS.write_text(content, encoding='utf-8', newline='\n')
    print(f"Rhyme registry updated: {len(lines)} rhymes mapped to 3D.")

def slice_rhymes():
    rhyme_names = [
        ['johny', 'humpty', 'bus', 'dhingli'],
        ['number_one', 'butterfly', 'potato', 'tractor']
    ]
    skip_names = {
        'Playful Grammar Friends Sticker Grid.png',
        'Kawaii Water and Senses Sticker Sheet.png',
        'Cute 3D Space Character Sticker Grid.png',
        'Cheerful Weather Sticker Characters.png',
        'Kawaii Eco-Friendly Earth Mascot Collection.png',
        'Cheerful Invention Icons Collection.png',
        'Playful 3D Learning Sticker Collage.png'
    }
    for p in DL.glob('*.png'):
        if p.name in skip_names:
            continue
        if any(k in p.name.lower() for k in ['rhyme', 'balgeet', 'song', 'nursery', 'poem']):
            slice_grid_dynamically(p, 2, 4, rhyme_names)
            break

def slice_gk_icons():
    names = [
        ['taj_mahal', 'trophy'],
        ['india_map', 'crown']
    ]
    skip_names = {
        'Playful Grammar Friends Sticker Grid.png',
        'Kawaii Water and Senses Sticker Sheet.png',
        'Cute 3D Space Character Sticker Grid.png',
        'Cheerful Weather Sticker Characters.png',
        'Kawaii Eco-Friendly Earth Mascot Collection.png',
        'Cheerful Invention Icons Collection.png',
        'Playful 3D Learning Sticker Collage.png'
    }
    for p in DL.glob('*.png'):
        if p.name in skip_names:
            continue
        if any(k in p.name.lower() for k in ['gk', 'monument', 'india', 'trophy', 'general', 'knowledge', 'heritage', 'culture', 'sports']):
            slice_grid_dynamically(p, 2, 2, names)
            break

def slice_personalities_and_heroes():
    names = [
        ['pers_chawla', 'pers_aryabhata', 'pers_teresa', 'pers_vivekananda', 'pers_ramanujan'],
        ['pers_bhabha', 'pers_sarabhai', 'hist_bhagat', 'hist_bose', 'hist_ashoka']
    ]
    skip_names = {
        'Playful Grammar Friends Sticker Grid.png',
        'Kawaii Water and Senses Sticker Sheet.png',
        'Cute 3D Space Character Sticker Grid.png',
        'Cheerful Weather Sticker Characters.png',
        'Kawaii Eco-Friendly Earth Mascot Collection.png',
        'Cheerful Invention Icons Collection.png',
        'Playful 3D Learning Sticker Collage.png',
        'Cheerful Nursery Character Sticker Sheet.png',
        'Chibi Transportation and Community Helpers Sticker Sheet.png',
        'Cheerful Sports Mascot Collection.png',
        'Chibi Indian Icons Sticker Sheet.png',
        'Cheerful Indian Icons Sticker Collection.png'
    }
    for p in DL.glob('*.png'):
        if p.name in skip_names:
            continue
        if any(k in p.name.lower() for k in ['personality', 'leader', 'hero', 'chawla', 'vivekananda', 'bhagat', 'scientist', 'heroes']):
            slice_grid_dynamically(p, 2, 5, names)
            break

def slice_monuments_geo_inv():
    names = [
        ['india_gate', 'great_wall', 'pyramid', 'liberty', 'desert'],
        ['everest', 'continents', 'island', 'zero', 'printing_press']
    ]
    skip_names = {
        'Playful Grammar Friends Sticker Grid.png',
        'Kawaii Water and Senses Sticker Sheet.png',
        'Cute 3D Space Character Sticker Grid.png',
        'Cheerful Weather Sticker Characters.png',
        'Kawaii Eco-Friendly Earth Mascot Collection.png',
        'Cheerful Invention Icons Collection.png',
        'Playful 3D Learning Sticker Collage.png',
        'Cheerful Nursery Character Sticker Sheet.png',
        'Chibi Transportation and Community Helpers Sticker Sheet.png',
        'Cheerful Sports Mascot Collection.png',
        'Chibi Indian Icons Sticker Sheet.png',
        'Cheerful Indian Icons Sticker Collection.png'
    }
    for p in DL.glob('*.png'):
        if p.name in skip_names:
            continue
        if any(k in p.name.lower() for k in ['monument', 'world', 'geography', 'everest', 'pyramid', 'liberty', 'desert', 'zero', 'press']):
            slice_grid_dynamically(p, 2, 5, names)
            break

def slice_radio_and_tv():
    names = [
        ['radio', 'tv']
    ]
    skip_names = {
        'Playful Grammar Friends Sticker Grid.png',
        'Kawaii Water and Senses Sticker Sheet.png',
        'Cute 3D Space Character Sticker Grid.png',
        'Cheerful Weather Sticker Characters.png',
        'Kawaii Eco-Friendly Earth Mascot Collection.png',
        'Cheerful Invention Icons Collection.png',
        'Playful 3D Learning Sticker Collage.png',
        'Cheerful Nursery Character Sticker Sheet.png',
        'Chibi Transportation and Community Helpers Sticker Sheet.png',
        'Cheerful Sports Mascot Collection.png',
        'Chibi Indian Icons Sticker Sheet.png',
        'Cheerful Indian Icons Sticker Collection.png',
        'Chibi Icons of Indian Inspiration.png',
        'Cheerful World Icons Mascot Collage.png'
    }
    for p in DL.glob('*.png'):
        if p.name in skip_names:
            continue
        if any(k in p.name.lower() for k in ['radio', 'tv', 'television', 'broadcast', 'media']):
            slice_grid_dynamically(p, 1, 2, names)
            break

if __name__ == '__main__':
    slice_space()
    slice_weather()
    slice_water_and_body()
    slice_earth_and_discoveries()
    slice_english_actions_and_nouns()
    slice_rhymes()
    slice_gk_icons()
    slice_personalities_and_heroes()
    slice_monuments_geo_inv()
    slice_radio_and_tv()
    rebuild_registry()
    rebuild_rhyme_registry()
    print("Done! Sliced and imported all sheets cleanly.")

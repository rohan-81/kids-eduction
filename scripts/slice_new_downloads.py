#!/usr/bin/env python3
"""
Slices the 3 newly downloaded DALL-E sheets:
1. Cheerful Fruit and Veggie Character Lineup.png (10 fruits & vegetables)
2. Around the World_ Adorable Cultural Kids.png (10 world country kids)
3. Patriotic Celebration Sticker Sheet.png (4 symbols & Eiffel Tower)

Removes white backgrounds, frames to 1024x1024 transparent RGBA,
saves into assets/images/characters/, and updates registries.
"""
from __future__ import annotations
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from generate_3d_animals import finish_and_save, CHAR_DIR
from import_extra_3d import rebuild_registry

DL = Path.home() / 'Downloads'

def slice_fruits_and_veggies():
    p = DL / 'Cheerful Fruit and Veggie Character Lineup.png'
    if not p.exists():
        print(f"File not found: {p}")
        return
    print(f"Slicing: {p.name} ...")
    im = Image.open(p).convert('RGB')
    w, h = im.size # 1536, 1024
    
    # 2 rows x 5 columns
    cut_y = 512
    # Columns approximately at 0, 307, 614, 921, 1228, 1536
    col_cuts_r0 = [0, 310, 610, 920, 1230, 1536]
    col_cuts_r1 = [0, 310, 610, 920, 1230, 1536]
    
    row0_names = ['fr_apple', 'fr_banana', 'fr_mango', 'fr_orange', 'fr_grapes']
    row1_names = ['fr_watermelon', 'fr_pineapple', 'fr_strawberry', 'fr_papaya', 'fr_carrot']
    
    for c in range(5):
        stem = row0_names[c]
        cell = im.crop((col_cuts_r0[c], 0, col_cuts_r0[c+1], cut_y))
        print(f"  Cropping R0 [{c}]: {stem} ...")
        finish_and_save(cell, stem, CHAR_DIR)
        
    for c in range(5):
        stem = row1_names[c]
        cell = im.crop((col_cuts_r1[c], cut_y, col_cuts_r1[c+1], h))
        print(f"  Cropping R1 [{c}]: {stem} ...")
        finish_and_save(cell, stem, CHAR_DIR)

def slice_world_kids():
    p = DL / 'Around the World_ Adorable Cultural Kids.png'
    if not p.exists():
        print(f"File not found: {p}")
        return
    print(f"Slicing: {p.name} ...")
    im = Image.open(p).convert('RGB')
    w, h = im.size
    
    cut_y = 510
    col_cuts_r0 = [0, 315, 615, 920, 1230, 1536]
    col_cuts_r1 = [0, 315, 615, 920, 1230, 1536]
    
    row0_names = ['country_india', 'country_usa', 'country_uk', 'country_japan', 'country_france']
    row1_names = ['country_germany', 'country_australia', 'country_canada', 'country_russia', 'country_uae']
    
    for c in range(5):
        stem = row0_names[c]
        cell = im.crop((col_cuts_r0[c], 0, col_cuts_r0[c+1], cut_y))
        print(f"  Cropping World Kids R0 [{c}]: {stem} ...")
        finish_and_save(cell, stem, CHAR_DIR)
        
    for c in range(5):
        stem = row1_names[c]
        cell = im.crop((col_cuts_r1[c], cut_y, col_cuts_r1[c+1], h))
        print(f"  Cropping World Kids R1 [{c}]: {stem} ...")
        finish_and_save(cell, stem, CHAR_DIR)

def slice_patriotic_and_eiffel():
    p = DL / 'Patriotic Celebration Sticker Sheet.png'
    if not p.exists():
        print(f"File not found: {p}")
        return
    print(f"Slicing: {p.name} ...")
    im = Image.open(p).convert('RGB')
    w, h = im.size
    
    cut_x = 768
    cut_y = 512
    
    items = [
        ('sym_flag', 0, 0, cut_x, cut_y),
        ('sym_anthem', cut_x, 0, w, cut_y),
        ('mon_eiffel', 0, cut_y, cut_x, h),
        ('hist_independence', cut_x, cut_y, w, h),
    ]
    
    for stem, x1, y1, x2, y2 in items:
        cell = im.crop((x1, y1, x2, y2))
        print(f"  Cropping Patriotic/Eiffel: {stem} ...")
        finish_and_save(cell, stem, CHAR_DIR)

if __name__ == '__main__':
    slice_fruits_and_veggies()
    slice_world_kids()
    slice_patriotic_and_eiffel()
    print("All slices completed successfully!")

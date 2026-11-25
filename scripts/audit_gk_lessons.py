import os
import re
from pathlib import Path

def extract_lessons(filepath):
    lessons = []
    curr = {}
    with open(filepath, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('id:'):
                curr['id'] = line.split(':', 1)[1].strip().strip("',\" ")
            elif line.startswith('categoryId:'):
                curr['cat'] = line.split(':', 1)[1].strip().strip("',\" ")
            elif line.startswith('symbol:'):
                curr['symbol'] = line.split(':', 1)[1].strip().strip("',\" ")
            elif line.startswith('title:'):
                curr['title'] = line.split(':', 1)[1].strip().strip("',\" ")
            elif line.startswith('exampleWord:'):
                curr['word'] = line.split(':', 1)[1].strip().strip("',\" ")
            elif line in ('},', '}'):
                if 'id' in curr and 'cat' in curr:
                    lessons.append(curr)
                curr = {}
    return lessons

gk_lessons = extract_lessons('src/data/lessonsGK.ts')
gen_lessons = [l for l in extract_lessons('src/data/lessons.ts') if l.get('cat') == 'gk']

all_gk = gk_lessons + gen_lessons
print(f"Total GK lessons found: {len(all_gk)} ({len(gk_lessons)} in lessonsGK.ts, {len(gen_lessons)} in lessons.ts)\n")

# Check which 3D characters we have in assets/images/characters/
char_dir = Path('assets/images/characters')
existing_chars = set(p.stem for p in char_dir.glob('*.png'))

from collections import defaultdict
by_cat = defaultdict(list)
for l in all_gk:
    by_cat[l['cat']].append(l)

# Read Lesson3DVisuals and extraRenders mappings
content_extra = open('src/utils/extraRenders.ts', encoding='utf-8').read()
content_animals = open('src/utils/animalRenders.ts', encoding='utf-8').read()
content_nature = open('src/utils/natureRenders.ts', encoding='utf-8').read()
content_visuals = open('src/components/Lesson3DVisuals.tsx', encoding='utf-8').read()

def has_3d(item):
    id_ = item['id']
    sym = item.get('symbol', '')
    # Check if id or sym is in extraRenders or animalRenders or natureRenders or Lesson3DVisuals
    if f"'{id_}':" in content_extra or f'"{id_}":' in content_extra:
        return True, "extraRenders (id)"
    if sym and (f"'{sym}':" in content_extra or f'"{sym}":' in content_extra):
        return True, f"extraRenders (sym: {sym})"
    if f"'{id_}':" in content_animals or f'"{id_}":' in content_animals:
        return True, "animalRenders"
    if f"'{id_}':" in content_nature or f'"{id_}":' in content_nature:
        return True, "natureRenders"
    if f"'{id_}'" in content_visuals or f'"{id_}"' in content_visuals:
        return True, "Lesson3DVisuals"
    # Check direct char file match
    clean_id = id_.replace('gk-', '').replace('sym-', '').replace('veh-', '').replace('pers-', '').replace('mon-', '').replace('sport-', '').replace('geo-', '').replace('state-', '').replace('country-', '').replace('inv-', '').replace('-', '_')
    if f"3d_{clean_id}" in existing_chars:
        return True, f"file (3d_{clean_id})"
    return False, "MISSING"

for cat, items in by_cat.items():
    print(f"==================================================")
    print(f"CATEGORY: {cat} ({len(items)} lessons)")
    print(f"==================================================")
    for it in items:
        status, reason = has_3d(it)
        status_icon = "✅" if status else "❌"
        sym = it.get('symbol', '')
        title = it.get('title', '').split('•')[0].strip()
        print(f"  {status_icon} [{it['id']}] {sym} {title} -> {reason}")
    print()

import re
import glob
from pathlib import Path
from collections import Counter, defaultdict

lesson_files = [
    'src/data/lessons.ts',
    'src/data/lessonsGK.ts',
    'src/data/lessonsMath.ts',
    'src/data/lessonsScience.ts',
    'src/data/lessonsEnglish.ts',
]

def parse_lessons(filepath):
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
            elif line.startswith('imageUrl:'):
                curr['img'] = line.split(':', 1)[1].strip().strip("',\" ")
            elif line in ('},', '}'):
                if 'id' in curr:
                    lessons.append(curr)
                curr = {}
    return lessons

all_lessons = []
for f in lesson_files:
    l = parse_lessons(f)
    print(f'{f}: {len(l)} lessons')
    all_lessons.extend(l)

print(f'\nTotal lessons parsed: {len(all_lessons)}')

# Read registries
extra = open('src/utils/extraRenders.ts', encoding='utf-8').read()
animals = open('src/utils/animalRenders.ts', encoding='utf-8').read()
nature = open('src/utils/natureRenders.ts', encoding='utf-8').read()
visuals = open('src/components/Lesson3DVisuals.tsx', encoding='utf-8').read()

char_dir = Path('assets/images/characters')
existing_chars = set(p.stem for p in char_dir.glob('*.png'))

missing = []
has_3d = []

for item in all_lessons:
    lid = item['id']
    cat = item.get('cat', '')
    sym = item.get('symbol', '')
    title = item.get('title', '')
    
    found = False
    source = ''
    if f"'{lid}':" in extra or f'"{lid}":' in extra:
        found, source = True, 'extraRenders'
    elif f"'{lid}':" in animals or f'"{lid}":' in animals:
        found, source = True, 'animalRenders'
    elif f"'{lid}':" in nature or f'\"{lid}\":' in nature:
        found, source = True, 'natureRenders'
    elif f"'{lid}':" in visuals or f'\"{lid}\":' in visuals or f"'{lid}'" in visuals:
        found, source = True, 'Lesson3DVisuals'
    elif lid.startswith('money-'):
        found, source = True, 'currency'
    elif cat in ('numbers', 'gu-varnamala', 'gu-barakhadi', 'hi-varnamala', 'en-alphabet', 'en-phonics', 'math'):
        found, source = True, 'typography-native'
    
    # Also check if existing 3D character file matches clean id
    clean_id = lid.replace('gk-', '').replace('sym-', '').replace('veh-', '').replace('pers-', '').replace('mon-', '').replace('sport-', '').replace('geo-', '').replace('state-', '').replace('country-', '').replace('inv-', '').replace('-', '_')
    file_match = f"3d_{clean_id}" in existing_chars or f"3d_{lid.replace('-', '_')}" in existing_chars
    
    if found:
        has_3d.append((lid, cat, title, source))
    elif file_match:
        missing.append((lid, cat, title, sym, f"FILE EXISTS: 3d_{clean_id}.png (unregistered)"))
    else:
        missing.append((lid, cat, title, sym, "NO 3D FILE"))

print(f'\nLessons WITH 3D / native visual: {len(has_3d)}')
print(f'Lessons MISSING 3D visual: {len(missing)}\n')

print('Missing lessons breakdown by category:')
by_cat = defaultdict(list)
for m in missing:
    by_cat[m[1]].append(m)

for cat, items in sorted(by_cat.items(), key=lambda x: -len(x[1])):
    print(f'\n=== {cat} ({len(items)} missing) ===')
    for lid, _, title, sym, note in items:
        print(f'  - [{lid}] {sym} {title} -> {note}')

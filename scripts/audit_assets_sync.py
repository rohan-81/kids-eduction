import os
import re
import sqlite3

# 1. Collect all characterAsset keys from frontend code
frontend_keys = set()
pattern = re.compile(r'characterAsset\([\'"]([^\'"]+)[\'"]\)')
for search_dir in ['src', 'app']:
    for root, _, files in os.walk(search_dir):
        for f in files:
            if f.endswith(('.ts', '.tsx')):
                with open(os.path.join(root, f), 'r', encoding='utf-8') as fp:
                    for match in pattern.findall(fp.read()):
                        frontend_keys.add(match)

print(f'Total unique characterAsset keys referenced in frontend: {len(frontend_keys)}')

# 2. Check existence in backend/media/characters
media_dir = os.path.join('backend', 'media', 'characters')
missing = []
for k in sorted(frontend_keys):
    webp_path = os.path.join(media_dir, f'{k}.webp')
    png_path = os.path.join(media_dir, f'{k}.png')
    if not os.path.exists(webp_path) and not os.path.exists(png_path):
        missing.append(k)

if missing:
    print(f'MISSING ASSETS ({len(missing)}): {missing}')
else:
    print(f'SUCCESS: ALL {len(frontend_keys)} frontend characterAsset keys exist physically in backend/media/characters! (0 missing)')

# 3. Check SQLite database lessons
conn = sqlite3.connect('backend/db.sqlite3')
cur = conn.cursor()
cur.execute('SELECT COUNT(*), COUNT(example_image) FROM lessons_lesson WHERE example_image != ""')
cnt, with_img = cur.fetchone()
print(f'Database Lessons with example_image: {with_img} of {cnt}')

# Check if any db example_image file is missing
cur.execute('SELECT stable_id, example_image FROM lessons_lesson WHERE example_image LIKE "characters/%"')
db_missing = []
for sid, img in cur.fetchall():
    full_p = os.path.join('backend', 'media', img)
    if not os.path.exists(full_p):
        db_missing.append((sid, img))

if db_missing:
    print(f'MISSING DB LESSON IMAGES ({len(db_missing)}): {db_missing[:5]}')
else:
    print('SUCCESS: ALL lessons_lesson images in database exist on disk! (0 missing)')

# Check CharacterAsset model table
try:
    cur.execute('SELECT COUNT(*) FROM lessons_characterasset')
    c_count = cur.fetchone()[0]
    print(f'SUCCESS: CharacterAsset table records in DB: {c_count}')
except Exception as e:
    print(f'CharacterAsset table check: {e}')

conn.close()

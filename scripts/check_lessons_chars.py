import sqlite3
conn = sqlite3.connect('backend/db.sqlite3')
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM lessons_lesson WHERE example_image LIKE 'characters/%'")
print('Lessons with characters/*.webp:', cur.fetchone()[0])

cur.execute("SELECT stable_id, title, example_image FROM lessons_lesson WHERE example_image LIKE 'characters/%' LIMIT 5")
for r in cur.fetchall():
    print(r)

conn.close()

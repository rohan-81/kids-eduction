import sqlite3

conn = sqlite3.connect('backend/db.sqlite3')
cur = conn.cursor()
cur.execute("""
    UPDATE lessons_lesson 
    SET age_group = 'all' 
    WHERE category IN ('hi-varnamala', 'gu-varnamala', 'gu-barakhadi', 'en-alphabet', 'en-phonics', 'animals')
""")
conn.commit()
print(f"Updated {cur.rowcount} lessons to age_group='all'.")

cur.execute("SELECT category, age_group, COUNT(*) FROM lessons_lesson WHERE category IN ('hi-varnamala', 'gu-varnamala', 'gu-barakhadi') GROUP BY category, age_group")
print("New counts:", cur.fetchall())
conn.close()

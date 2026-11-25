with open('app/parents.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if any(k in l.lower() for k in ['chart', 'weeklyactivity']):
        print(f"{i+1}: {l.strip()[:80]}")


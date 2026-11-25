import re

with open('src/data/storiesData.ts', 'r', encoding='utf-8') as f:
    c = f.read()

for m in re.finditer(r'id:\s*["\']([^"\']+)["\'],\s*titleGu:\s*["\']([^"\']+)["\']', c):
    print(m.group(1), '-->', m.group(2))


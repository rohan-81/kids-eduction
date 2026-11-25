import os
import re

pattern = re.compile(r'require\([\'"]([^\'"]+)[\'"]')
root_dir = os.getcwd()
broken = []

for search_dir in ['src', 'app']:
    for root, _, files in os.walk(search_dir):
        for f in files:
            if f.endswith(('.ts', '.tsx', '.js')):
                file_path = os.path.join(root, f)
                with open(file_path, 'r', encoding='utf-8') as fp:
                    content = fp.read()
                    for req in pattern.findall(content):
                        if req.startswith('.'):
                            target = os.path.normpath(os.path.join(root, req))
                            found = False
                            for ext in ['', '.ts', '.tsx', '.js', '.json', '.png', '.webp', '.jpg', '.jpeg']:
                                if os.path.exists(target + ext):
                                    found = True
                                    break
                            if not found:
                                broken.append((os.path.relpath(file_path, root_dir), req))

print(f'Total broken requires: {len(broken)}')
for f, req in broken:
    print(f'{f} -> {req}')

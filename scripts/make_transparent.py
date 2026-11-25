"""
Utility to turn solid white background images into clean transparent PNGs
with smooth edge anti-aliasing.
"""
import sys
import os
from collections import deque
from PIL import Image

def make_transparent(input_path: str, output_path: str, threshold: int = 230):
    img = Image.open(input_path).convert('RGBA')
    w, h = img.size
    pix = img.load()

    visited = set()
    q = deque()

    # Border seeds
    for x in range(w):
        for y in [0, h - 1]:
            r, g, b, a = pix[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                q.append((x, y))
                visited.add((x, y))

    for y in range(h):
        for x in [0, w - 1]:
            if (x, y) not in visited:
                r, g, b, a = pix[x, y]
                if r >= threshold and g >= threshold and b >= threshold:
                    q.append((x, y))
                    visited.add((x, y))

    # BFS floodfill
    while q:
        cx, cy = q.popleft()
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                r, g, b, a = pix[nx, ny]
                if r >= threshold and g >= threshold and b >= threshold:
                    visited.add((nx, ny))
                    q.append((nx, ny))

    # Set transparency with feathering
    for x, y in visited:
        r, g, b, _ = pix[x, y]
        pix[x, y] = (r, g, b, 0)

    # Feather near boundary for anti-aliasing
    for x, y in visited:
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                r, g, b, a = pix[nx, ny]
                # If pixel is very light, make semi-transparent
                brightness = (r + g + b) / 3
                if brightness > 210:
                    alpha = int(255 * (1 - (brightness - 210) / (255 - 210)))
                    pix[nx, ny] = (r, g, b, min(a, max(40, alpha)))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"Successfully saved transparent PNG to {output_path} ({len(visited)} bg pixels cleared)")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python make_transparent.py <input_img> <output_png> [threshold]")
        sys.exit(1)
    thresh = int(sys.argv[3]) if len(sys.argv) > 3 else 230
    make_transparent(sys.argv[1], sys.argv[2], thresh)

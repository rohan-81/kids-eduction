from PIL import Image

for name in ['story_crow_cover.png', 'story_tortoise_hare_cover.png', 'story_fox_grapes_cover.png', 'story_lion_mouse_cover.png']:
    img = Image.open(f'assets/images/stories/{name}').convert('RGB')
    w, h = img.size
    # Sample top, middle, bottom pixels
    # Find bounding box of content differing from sky (top-left pixel)
    bg = img.getpixel((0, 0))
    diff_y = []
    diff_x = []
    for y in range(h):
        for x in range(w):
            p = img.getpixel((x, y))
            # simple color difference
            if abs(p[0] - bg[0]) + abs(p[1] - bg[1]) + abs(p[2] - bg[2]) > 40:
                diff_y.append(y)
                diff_x.append(x)
    if diff_y:
        print(f'{name}: min_y={min(diff_y)}, max_y={max(diff_y)}, min_x={min(diff_x)}, max_x={max(diff_x)} (image size {w}x{h})')
    else:
        print(f'{name}: uniform')

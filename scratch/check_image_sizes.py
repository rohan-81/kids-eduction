import os
from PIL import Image

dir_path = 'assets/images/stories'
for f in os.listdir(dir_path):
    if f.endswith('.png'):
        p = os.path.join(dir_path, f)
        img = Image.open(p)
        print(f, img.size, img.mode)


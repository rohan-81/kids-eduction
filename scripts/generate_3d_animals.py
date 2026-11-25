#!/usr/bin/env python3
"""
KidsZone 3D animal render pipeline.

Makes every Animals & Birds card use a real 1024x1024 transparent 3D render that matches
assets/images/characters/3d_lion.png, then regenerates src/utils/animalRenders.ts so the
app picks the new renders up automatically (renders win over the SVG stand-ins).

Commands
  generate   Call an image API for animals that have no good render yet.
  import     Post-process images you made by hand (Midjourney / Leonardo / Ideogram).
  registry   Only rebuild src/utils/animalRenders.ts from the PNGs on disk.

Examples
  python scripts/generate_3d_animals.py generate --only cow,dog,cat            # lists the plan, spends nothing
  python scripts/generate_3d_animals.py generate --only cow,dog,cat --yes      # actually calls the API
  python scripts/generate_3d_animals.py generate --provider replicate --yes
  python scripts/generate_3d_animals.py import ~/Downloads/midjourney          # files named like dog.png, cat_v2.png
  python scripts/generate_3d_animals.py registry

API keys come from the environment only:
  OpenAI     OPENAI_API_KEY        (default model gpt-image-1: uses the lion as a style reference
                                    and returns a transparent PNG directly)
  Replicate  REPLICATE_API_TOKEN   (black-forest-labs/flux-1.1-pro with the lion as image_prompt)

Requirements: Python 3.9+, Pillow. Optional: `pip install rembg` for the best background cut-out
(a white flood-fill fallback is built in).
"""
from __future__ import annotations

import argparse
import base64
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
import uuid
from collections import deque
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit('Pillow is required: pip install pillow')

ROOT = Path(__file__).resolve().parents[1]
PROMPTS_MD = ROOT / 'docs' / 'animal-3d-prompts.md'
# Working folder for 1024px masters while producing renders. It is NOT bundled with the app;
# publish finished renders with backend/scripts/migrate_assets_to_db.py (-> MEDIA_CHAR_DIR).
CHAR_DIR = ROOT / 'assets' / 'images' / 'characters'
MEDIA_CHAR_DIR = ROOT / 'backend' / 'media' / 'characters'
LION = CHAR_DIR / '3d_lion.png'
REGISTRY_TS = ROOT / 'src' / 'utils' / 'animalRenders.ts'

CANVAS = 1024
TOP_Y, BOTTOM_Y, MAX_W = 70, 962, 900  # same framing as 3d_lion.png (feet near the bottom)
MIN_GOOD_SIZE = 1000  # 300px / 256px script-made images are ignored

# name -> (lesson id or None, emojis it should replace in quizzes/games, existing-file aliases)
ANIMALS: dict[str, tuple[str | None, list[str], list[str]]] = {
    'lion': ('an-lion', ['🦁'], []), 'monkey': ('an-monkey', ['🐒', '🐵'], []),
    'rabbit': ('an-rabbit', ['🐰', '🐇'], ['hare']), 'sparrow': ('an-sparrow', ['🐦'], []),
    'fox': ('an-fox', ['🦊'], []), 'tortoise': ('an-turtle', ['🐢'], []), 'crocodile': ('an-crocodile', ['🐊'], []),
    'pigeon': ('an-pigeon', ['🕊️', '🕊'], ['dove']), 'crow': ('an-crow', ['🐦‍⬛'], []), 'mouse': (None, ['🐭', '🐁'], []),
    'cow': ('an-cow', ['🐄', '🐮'], []), 'dog': ('an-dog', ['🐕', '🐶'], []), 'cat': ('an-cat', ['🐱', '🐈'], []),
    'horse': ('an-horse', ['🐎', '🐴'], []), 'tiger': ('an-tiger', ['🐅', '🐯'], []), 'peacock': ('an-peacock', ['🦚'], []),
    'elephant': ('an-elephant', ['🐘'], []), 'camel': ('an-camel', ['🐪', '🐫'], []), 'duck': ('an-duck', ['🦆'], []),
    'deer': ('an-deer', ['🦌'], []), 'giraffe': ('an-giraffe', ['🦒'], []), 'zebra': ('an-zebra', ['🦓'], []),
    'bear': ('an-bear', ['🐻'], []), 'rooster': ('an-rooster', ['🐓'], []), 'goat': ('an-goat', ['🐐'], []),
    'sheep': ('an-sheep', ['🐑'], []), 'buffalo': ('an-buffalo', ['🐃'], []), 'hippo': ('an-hippo', ['🦛'], []),
    'rhino': ('an-rhino', ['🦏'], []), 'squirrel': ('an-squirrel', ['🐿️', '🐿'], []), 'donkey': ('an-donkey', ['🫏'], []),
    'ox': ('an-ox', ['🐂'], []), 'wolf': ('an-wolf', ['🐺'], []), 'leopard': ('an-leopard', ['🐆'], []),
    'cheetah': ('an-cheetah', [], []), 'panda': ('an-panda', ['🐼'], []), 'kangaroo': ('an-kangaroo', ['🦘'], []),
    'frog': ('an-frog', ['🐸'], []), 'koel': ('an-koel', [], []), 'owl': ('an-owl', ['🦉'], []),
    'eagle': ('an-eagle', ['🦅'], []), 'vulture': ('an-vulture', [], []), 'swan': ('an-swan', ['🦢'], []),
    'flamingo': ('an-flamingo', ['🦩'], []), 'crane': ('an-crane', ['🪿'], []), 'woodpecker': ('an-woodpecker', [], []),
    'kingfisher': ('an-kingfisher', [], []), 'penguin': ('an-penguin', ['🐧'], []), 'ostrich': ('an-ostrich', [], []),
    'parrot': ('an-parrot', ['🦜'], []), 'dolphin': (None, ['🐬'], []),
}

STYLE_LOCK = (
    'Use the reference image ONLY for art style, render quality, fur/feather softness, lighting, camera angle, '
    'framing and baby proportions. Do not draw a lion: draw exactly the animal described.'
)


def log(msg: str) -> None:
    print(msg, flush=True)


# ----------------------------------------------------------------------------- prompts

def load_prompts() -> dict[str, str]:
    text = PROMPTS_MD.read_text(encoding='utf-8')
    prompts: dict[str, str] = {}
    for m in re.finditer(r'^### .*?`3d_([a-z]+)\.png`\s*\n+```text\n(.+?)\n```', text, re.M | re.S):
        name, prompt = m.group(1), m.group(2).strip()
        prompt = re.sub(r'\s--\w+.*$', '', prompt)  # drop Midjourney flags for API use
        prompts[name] = prompt
    if not prompts:
        sys.exit(f'No prompts found in {PROMPTS_MD}')
    return prompts


# ----------------------------------------------------------------------------- files

def available_render(file_stem: str) -> Path | None:
    """
    A render that exists for `file_stem` (e.g. '3d_lion'): the 1024px master PNG in CHAR_DIR when
    present, else the served copy in backend/media/characters/. The app bundle no longer holds
    character images (they are served by Django), so registries must not depend on local PNGs.
    """
    png = CHAR_DIR / f'{file_stem}.png'
    if png.exists() and png.stat().st_size > MIN_GOOD_SIZE:
        return png
    webp = MEDIA_CHAR_DIR / f'{file_stem}.webp'
    return webp if webp.exists() else None


def render_path(name: str) -> Path | None:
    """The existing good render for an animal (own name first, then aliases like hare/dove)."""
    for stem in [name, *ANIMALS.get(name, (None, [], []))[2]]:
        p = CHAR_DIR / f'3d_{stem}.png'
        if p.exists() and is_good_render(p):
            return p
        served = MEDIA_CHAR_DIR / f'3d_{stem}.webp'
        if served.exists():
            return served
    return None


def is_good_render(p: Path) -> bool:
    try:
        with Image.open(p) as im:
            if min(im.size) < MIN_GOOD_SIZE:
                return False
            if im.mode != 'RGBA':
                return False
            alpha = im.getchannel('A')
            return alpha.getpixel((4, 4)) < 10 and alpha.getpixel((im.width - 5, 4)) < 10
    except Exception:
        return False


# ----------------------------------------------------------------------------- post-processing

def remove_white_background(img: Image.Image, threshold: int = 238) -> Image.Image:
    """rembg if installed, otherwise flood-fill near-white from the borders with a soft edge."""
    try:
        from rembg import remove  # type: ignore

        return remove(img.convert('RGBA'))
    except Exception:
        pass
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()
    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    def is_bg(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return r >= threshold and g >= threshold and b >= threshold and max(r, g, b) - min(r, g, b) < 18

    for x in range(w):
        for y in (0, h - 1):
            if is_bg(x, y):
                q.append((x, y)); seen[y * w + x] = 1
    for y in range(h):
        for x in (0, w - 1):
            if not seen[y * w + x] and is_bg(x, y):
                q.append((x, y)); seen[y * w + x] = 1
    while q:
        x, y = q.popleft()
        px[x, y] = (255, 255, 255, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and is_bg(nx, ny):
                seen[ny * w + nx] = 1
                q.append((nx, ny))
    # soften the 1px fringe next to removed pixels
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if px[x, y][3] == 255 and any(px[x + dx, y + dy][3] == 0 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                r, g, b, _ = px[x, y]
                light = (r + g + b) / 3
                px[x, y] = (r, g, b, 140 if light > 200 else 220)
    return img


def frame_like_lion(img: Image.Image) -> Image.Image:
    """Crop to the character, scale to the lion's height, centre it, feet near the bottom."""
    img = img.convert('RGBA')
    bbox = img.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
    if not bbox:
        raise ValueError('image is empty after background removal')
    subject = img.crop(bbox)
    target_h = BOTTOM_Y - TOP_Y
    scale = min(target_h / subject.height, MAX_W / subject.width)
    subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.LANCZOS)
    canvas = Image.new('RGBA', (CANVAS, CANVAS), (255, 255, 255, 0))
    canvas.alpha_composite(subject, ((CANVAS - subject.width) // 2, BOTTOM_Y - subject.height))
    return canvas


def finish_and_save(img: Image.Image, name: str, out_dir: Path) -> Path:
    img = img.convert('RGBA')
    corner_alpha = img.getchannel('A').getpixel((4, 4))
    if corner_alpha > 10:  # opaque background -> cut it out
        img = remove_white_background(img)
    img = frame_like_lion(img)
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f'3d_{name}.png'
    img.save(out, optimize=True)
    log(f'  saved {out.relative_to(ROOT) if out.is_relative_to(ROOT) else out}')
    return out


# ----------------------------------------------------------------------------- HTTP helpers (stdlib only)

def http_json(url: str, payload: dict | None, headers: dict, method: str = 'POST', timeout: int = 300) -> dict:
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={'Content-Type': 'application/json', **headers})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'{e.code} {e.reason}: {e.read().decode(errors="replace")[:500]}') from None


def http_multipart(url: str, fields: dict[str, str], files: list[tuple[str, str, bytes, str]], headers: dict, timeout: int = 300) -> dict:
    boundary = uuid.uuid4().hex
    body = io.BytesIO()
    for k, v in fields.items():
        body.write(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    for field, filename, content, ctype in files:
        body.write(f'--{boundary}\r\nContent-Disposition: form-data; name="{field}"; filename="{filename}"\r\nContent-Type: {ctype}\r\n\r\n'.encode())
        body.write(content)
        body.write(b'\r\n')
    body.write(f'--{boundary}--\r\n'.encode())
    req = urllib.request.Request(url, data=body.getvalue(), method='POST',
                                 headers={'Content-Type': f'multipart/form-data; boundary={boundary}', **headers})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'{e.code} {e.reason}: {e.read().decode(errors="replace")[:500]}') from None


def download(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=300) as r:
        return r.read()


# ----------------------------------------------------------------------------- providers

def gen_openai(prompt: str, model: str) -> Image.Image:
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        sys.exit('Set OPENAI_API_KEY first.')
    auth = {'Authorization': f'Bearer {key}'}
    if model.startswith('gpt-image'):
        # edits endpoint with the lion as style reference; transparent PNG straight from the API
        res = http_multipart(
            'https://api.openai.com/v1/images/edits',
            {'model': model, 'prompt': f'{prompt}\n\n{STYLE_LOCK}', 'size': '1024x1024',
             'quality': 'high', 'background': 'transparent', 'output_format': 'png', 'n': '1'},
            [('image[]', '3d_lion.png', LION.read_bytes(), 'image/png')],
            auth,
        )
    else:  # dall-e-3: no reference image / transparency, background removed afterwards
        res = http_json('https://api.openai.com/v1/images/generations',
                        {'model': model, 'prompt': prompt, 'size': '1024x1024', 'quality': 'hd',
                         'response_format': 'b64_json', 'n': 1}, auth)
    return Image.open(io.BytesIO(base64.b64decode(res['data'][0]['b64_json'])))


def gen_replicate(prompt: str, model: str) -> Image.Image:
    token = os.environ.get('REPLICATE_API_TOKEN')
    if not token:
        sys.exit('Set REPLICATE_API_TOKEN first.')
    auth = {'Authorization': f'Bearer {token}', 'Prefer': 'wait'}
    lion_uri = 'data:image/png;base64,' + base64.b64encode(LION.read_bytes()).decode()
    pred = http_json(f'https://api.replicate.com/v1/models/{model}/predictions',
                     {'input': {'prompt': prompt, 'aspect_ratio': '1:1', 'output_format': 'png',
                                'image_prompt': lion_uri, 'safety_tolerance': 2}}, auth)
    while pred.get('status') not in ('succeeded', 'failed', 'canceled'):
        time.sleep(2)
        pred = http_json(pred['urls']['get'], None, auth, method='GET')
    if pred['status'] != 'succeeded':
        raise RuntimeError(f"replicate: {pred.get('error')}")
    out = pred['output'][0] if isinstance(pred['output'], list) else pred['output']
    return Image.open(io.BytesIO(download(out)))


PROVIDERS = {
    'openai': (gen_openai, 'gpt-image-1'),
    'replicate': (gen_replicate, 'black-forest-labs/flux-1.1-pro'),
}


# ----------------------------------------------------------------------------- registry

def write_registry() -> None:
    by_lesson, by_emoji = [], []
    for name, (lesson, emojis, _aliases) in ANIMALS.items():
        p = render_path(name)
        if not p:
            continue
        req = f"characterAsset('{p.stem}')"
        if lesson:
            by_lesson.append(f"  '{lesson}': {req},")
        for e in emojis:
            by_emoji.append(f"  '{e}': {req},")
    REGISTRY_TS.write_text(
        '// AUTO-GENERATED by scripts/generate_3d_animals.py (registry). Do not edit by hand.\n'
        '// Real 1024x1024 transparent 3D renders that match 3d_lion.png. They take priority over\n'
        '// the SVG stand-ins in Lesson3DVisuals / CONTENT_ART.\n'
        '// Renders are served remotely (Django /media/characters/<key>.webp) and disk-cached by expo-image;\n'
        '// see src/utils/remoteAssets.ts. Bundled copies were removed to keep the app small.\n'
        "import { characterAsset, RemoteImageSource } from './remoteAssets';\n\n"
        'export const ANIMAL_RENDERS_BY_LESSON: Record<string, RemoteImageSource> = {\n' + '\n'.join(by_lesson) + '\n};\n\n'
        'export const ANIMAL_RENDERS_BY_EMOJI: Record<string, RemoteImageSource> = {\n' + '\n'.join(by_emoji) + '\n};\n',
        encoding='utf-8', newline='\n')
    log(f'registry: {len(by_lesson)} lesson renders, {len(by_emoji)} emoji renders -> {REGISTRY_TS.relative_to(ROOT)}')


# ----------------------------------------------------------------------------- commands

def cmd_generate(a: argparse.Namespace) -> None:
    prompts = load_prompts()
    names = [n.strip() for n in a.only.split(',')] if a.only else list(prompts)
    unknown = [n for n in names if n not in prompts]
    if unknown:
        sys.exit(f'No prompt for: {", ".join(unknown)}')
    todo = [n for n in names if a.force or not render_path(n)]
    fn, default_model = PROVIDERS[a.provider]
    model = a.model or default_model
    log(f'{len(todo)} to generate with {a.provider}/{model}: {", ".join(todo) or "-"}')
    if not a.yes:
        log('Dry run: nothing was sent. Re-run with --yes to call the API (each image is billed).')
        return
    out_dir = Path(a.out_dir) if a.out_dir else CHAR_DIR
    failed = []
    for i, name in enumerate(todo, 1):
        log(f'[{i}/{len(todo)}] {name}')
        try:
            img = fn(prompts[name], model)
            if a.keep_raw:
                raw = out_dir / 'raw'; raw.mkdir(parents=True, exist_ok=True)
                img.save(raw / f'{name}.png')
            finish_and_save(img, name, out_dir)
        except Exception as e:  # keep going; report at the end
            log(f'  FAILED: {e}')
            failed.append(name)
    if out_dir == CHAR_DIR:
        write_registry()
    if failed:
        log(f'Failed: {", ".join(failed)} (re-run with --only {",".join(failed)})')


def cmd_import(a: argparse.Namespace) -> None:
    src = Path(a.folder).expanduser()
    files = sorted(p for p in src.iterdir() if p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp'))
    out_dir = Path(a.out_dir) if a.out_dir else CHAR_DIR
    done = 0
    for p in files:
        stem = re.sub(r'[^a-z]', ' ', p.stem.lower()).split()
        name = next((w for w in stem if w in ANIMALS), None)
        if not name:
            log(f'skip {p.name}: file name must contain an animal name (e.g. dog.png, cat_v2.png)')
            continue
        if not a.force and out_dir == CHAR_DIR and render_path(name):
            log(f'skip {p.name}: 3d_{name}.png already exists (use --force to replace)')
            continue
        log(f'{p.name} -> {name}')
        finish_and_save(Image.open(p), name, out_dir)
        done += 1
    log(f'imported {done} image(s)')
    if out_dir == CHAR_DIR:
        write_registry()


def main() -> None:
    sys.stdout.reconfigure(encoding='utf-8')
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    g = sub.add_parser('generate', help='generate missing renders through an image API')
    g.add_argument('--provider', choices=list(PROVIDERS), default='openai')
    g.add_argument('--model', help='override the provider model (e.g. dall-e-3)')
    g.add_argument('--only', help='comma-separated animal names, e.g. cow,dog,cat')
    g.add_argument('--force', action='store_true', help='regenerate even if a good render exists')
    g.add_argument('--yes', action='store_true', help='actually call the API (otherwise dry run)')
    g.add_argument('--keep-raw', action='store_true', help='also keep the unprocessed API output')
    g.add_argument('--out-dir', help='write somewhere else (no registry update)')
    g.set_defaults(func=cmd_generate)
    im = sub.add_parser('import', help='post-process hand-made images from a folder')
    im.add_argument('folder')
    im.add_argument('--force', action='store_true')
    im.add_argument('--out-dir')
    im.set_defaults(func=cmd_import)
    r = sub.add_parser('registry', help='rebuild src/utils/animalRenders.ts')
    r.set_defaults(func=lambda _a: write_registry())
    args = ap.parse_args()
    args.func(args)


if __name__ == '__main__':
    main()

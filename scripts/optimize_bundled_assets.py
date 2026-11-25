"""
Shrinks the images that must stay bundled in the app (offline-critical art: subject icons,
story characters, photos, backgrounds) by re-encoding them as WebP and repointing require()s.

    backend/venv/Scripts/python scripts/optimize_bundled_assets.py            # convert + rewrite
    backend/venv/Scripts/python scripts/optimize_bundled_assets.py --dry-run  # report only

- Character / icon art (characters/, magic/, 3d_style/, topics/, currency coins): max 512 px.
- Photos and backgrounds: max 1280 px (full-width on phones/tablets stays sharp).
- A WebP is kept only if it is smaller than the original; otherwise the require is left alone.
- Originals are kept on disk as masters (Metro only bundles files that are require()d).
- Idempotent: existing up-to-date .webp files are reused.

The large 3D renders used by lessons/quizzes/rhymes are not bundled at all any more; they are
served by Django (see backend/scripts/migrate_assets_to_db.py and src/utils/remoteAssets.ts).
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIRS = [ROOT / 'app', ROOT / 'src']
REQUIRE_RE = re.compile(r"""require\(\s*(['"])([^'"]+\.(?:png|jpe?g))\1\s*\)""", re.IGNORECASE)
SMALL_ART_DIRS = ('/characters/', '/magic/', '/3d_style/', '/topics/', '/currency/coin')


def max_side_for(path: Path) -> int:
    p = path.as_posix()
    return 512 if any(d in p for d in SMALL_ART_DIRS) else 1280


def to_webp(src: Path, dry_run: bool) -> Path | None:
    dest = src.with_suffix('.webp')
    if dest.exists() and dest.stat().st_mtime >= src.stat().st_mtime:
        return dest if dest.stat().st_size < src.stat().st_size else None
    with Image.open(src) as im:
        has_alpha = im.mode in ('RGBA', 'LA', 'P')
        im = im.convert('RGBA' if has_alpha else 'RGB')
        limit = max_side_for(src)
        im.thumbnail((limit, limit), Image.LANCZOS)
        if dry_run:
            return dest
        im.save(dest, 'WEBP', quality=82, method=4)
    if dest.stat().st_size >= src.stat().st_size:
        dest.unlink()  # no gain: keep the original
        return None
    return dest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    files = [f for d in SOURCE_DIRS for f in d.rglob('*') if f.suffix in ('.ts', '.tsx') and f.is_file()]
    converted: dict[Path, Path | None] = {}
    rewrites = 0
    for f in files:
        text = f.read_text(encoding='utf-8')

        def repl(m: re.Match) -> str:
            nonlocal rewrites
            quote, rel = m.group(1), m.group(2)
            src = (f.parent / rel).resolve()
            if not src.exists():
                return m.group(0)
            if src not in converted:
                converted[src] = to_webp(src, args.dry_run)
            dest = converted[src]
            if dest is None:
                return m.group(0)
            rewrites += 1
            new_rel = rel[: rel.rfind('.')] + '.webp'
            return f'require({quote}{new_rel}{quote})'

        new_text = REQUIRE_RE.sub(repl, text)
        if new_text != text and not args.dry_run:
            f.write_text(new_text, encoding='utf-8', newline='')

    before = sum(p.stat().st_size for p in converted)
    after = sum((d.stat().st_size if d and d.exists() else p.stat().st_size) for p, d in converted.items())
    kept = sum(1 for d in converted.values() if d is None)
    print(f'{len(converted)} bundled images, {rewrites} require()s repointed to .webp, {kept} kept as-is')
    if not args.dry_run:
        print(f'bundled image size: {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB')


if __name__ == '__main__':
    main()

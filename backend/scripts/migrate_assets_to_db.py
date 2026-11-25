"""
Migrate KidsZone 3D character renders from the app bundle into Django media + database.

    cd backend
    venv/Scripts/python scripts/migrate_assets_to_db.py            # convert + upsert + link lessons
    venv/Scripts/python scripts/migrate_assets_to_db.py --dry-run  # report only, write nothing
    venv/Scripts/python scripts/migrate_assets_to_db.py --force    # re-encode all, overwrite lesson images

What it does (safe to re-run; unchanged files are skipped):
  1. Reads the render registries in src/utils/{animal,extra,nature,rhyme}Renders.ts to learn which
     render (e.g. 3d_lion) backs which lesson id / emoji / rhyme.
  2. Converts every assets/images/characters/3d_*.png (1024px) to a 512px WebP (quality 85,
     alpha preserved) in backend/media/characters/<stem>.webp.
  3. Upserts a CharacterAsset row per render (asset_key = stem, tags = lesson ids/emoji using it).
  4. Sets Lesson.example_image = 'characters/<stem>.webp' for lessons that use a render. Existing
     non-empty values pointing elsewhere (e.g. curated photo URLs) are kept unless --force.
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent
SRC_CHAR_DIR = REPO_ROOT / 'assets' / 'images' / 'characters'
REGISTRIES = {
    'animals': REPO_ROOT / 'src' / 'utils' / 'animalRenders.ts',
    'extra': REPO_ROOT / 'src' / 'utils' / 'extraRenders.ts',
    'nature': REPO_ROOT / 'src' / 'utils' / 'natureRenders.ts',
    'rhymes': REPO_ROOT / 'src' / 'utils' / 'rhymeRenders.ts',
}

sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# `export const NAME: ... = {` ... `};`
_BLOCK_RE = re.compile(r'export const (\w+)\s*:[^=]*=\s*\{(.*?)\n\};', re.S)
# 'key': require('../../assets/images/characters/3d_lion.png')   (bundled form)
# 'key': characterAsset('3d_lion')                                (remote form)
_ENTRY_RE = re.compile(
    r"""^\s*['"]([^'"]+)['"]\s*:\s*(?:require\(\s*['"][^'"]*/characters/([\w-]+)\.\w+['"]\s*\)|characterAsset\(\s*['"]([\w-]+)['"]\s*\))""",
    re.M,
)


def parse_registries():
    """Returns (lesson_to_stem, stem_categories, stem_tags)."""
    lesson_to_stem: dict[str, str] = {}
    stem_categories: dict[str, str] = {}
    stem_tags: dict[str, set[str]] = defaultdict(set)
    for category, path in REGISTRIES.items():
        if not path.exists():
            print(f'  ! registry missing, skipped: {path.relative_to(REPO_ROOT)}')
            continue
        text = path.read_text(encoding='utf-8')
        for block_name, body in _BLOCK_RE.findall(text):
            is_lesson_map = block_name.endswith('_BY_LESSON')
            for key, stem_a, stem_b in _ENTRY_RE.findall(body):
                stem = stem_a or stem_b
                stem_categories.setdefault(stem, category)
                stem_tags[stem].add(key)
                if is_lesson_map:
                    lesson_to_stem.setdefault(key, stem)
    return lesson_to_stem, stem_categories, stem_tags


def lesson_id_aliases(lesson_id: str) -> list[str]:
    """Mirror of src/services/apiService.ts lessonIdAliases (animal lessons used two prefixes)."""
    return list(dict.fromkeys([
        lesson_id,
        lesson_id.replace('animal-', 'an-'),
        f'an-{lesson_id}',
        lesson_id.replace('an-', 'animal-'),
    ]))


def convert(src: Path, dest: Path, size: int, quality: int, force: bool, dry_run: bool):
    """PNG -> WebP thumbnail. Returns (width, height, status)."""
    from PIL import Image

    if src == dest or (dest.exists() and not force and dest.stat().st_mtime >= src.stat().st_mtime):
        with Image.open(dest) as im:
            return im.width, im.height, 'up-to-date'
    with Image.open(src) as im:
        im = im.convert('RGBA')
        im.thumbnail((size, size), Image.LANCZOS)
        if not dry_run:
            dest.parent.mkdir(parents=True, exist_ok=True)
            im.save(dest, 'WEBP', quality=quality, method=6)
        return im.width, im.height, 'converted'


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--size', type=int, default=512, help='max width/height in px (default 512)')
    parser.add_argument('--quality', type=int, default=85, help='WebP quality 1-100 (default 85)')
    parser.add_argument('--force', action='store_true', help='re-encode everything and overwrite lesson images')
    parser.add_argument('--dry-run', action='store_true', help='report what would change, write nothing')
    args = parser.parse_args()

    import django
    django.setup()
    from django.conf import settings
    from django.db import transaction
    from PIL import features
    from lessons.models import CharacterAsset, Lesson

    if not features.check('webp'):
        sys.exit('Pillow was built without WebP support; install a Pillow wheel with libwebp.')

    media_char_dir = Path(settings.MEDIA_ROOT) / 'characters'
    lesson_to_stem, stem_categories, stem_tags = parse_registries()
    print(f'Registries: {len(lesson_to_stem)} lesson links, {len(stem_tags)} renders referenced')

    # Masters (1024px PNGs) are optional: the app no longer bundles them. Without them, the
    # already-published WebPs in MEDIA_ROOT/characters are the source of truth and the script
    # just syncs the database (CharacterAsset rows + lesson links) from them.
    if SRC_CHAR_DIR.exists() and any(SRC_CHAR_DIR.glob('3d_*.png')):
        sources = sorted(SRC_CHAR_DIR.glob('3d_*.png'))
        print(f'Source PNGs: {len(sources)} in {SRC_CHAR_DIR.relative_to(REPO_ROOT)}')
    else:
        sources = sorted(media_char_dir.glob('3d_*.webp'))
        print(f'No master PNGs; syncing database from {len(sources)} published WebPs in {media_char_dir}')
        if not sources:
            sys.exit('Nothing to do: no master PNGs and no published WebPs.')

    stats = defaultdict(int)
    bytes_in = bytes_out = 0
    available: set[str] = set()

    with transaction.atomic():
        # 1-3. Convert + upsert CharacterAsset rows
        for src in sources:
            stem = src.stem
            dest = media_char_dir / f'{stem}.webp'
            width, height, status = convert(src, dest, args.size, args.quality, args.force, args.dry_run)
            stats[status] += 1
            available.add(stem)
            bytes_in += src.stat().st_size
            if dest.exists():
                bytes_out += dest.stat().st_size

            defaults = {
                'title': stem.replace('3d_', '').replace('_', ' ').title(),
                'image_file': f'characters/{stem}.webp',
                'category': stem_categories.get(stem, 'shared'),
                'tags': sorted(stem_tags.get(stem, set())),
                'width': width,
                'height': height,
                'is_active': True,
            }
            if not args.dry_run:
                _, created = CharacterAsset.objects.update_or_create(asset_key=stem, defaults=defaults)
                stats['assets created' if created else 'assets updated'] += 1

        missing = sorted(set(stem_tags) - available)
        if missing:
            print(f'  ! {len(missing)} referenced renders have no source PNG: {", ".join(missing[:10])}')

        # 4. Link lessons
        by_stable_id = {l.stable_id: l for l in Lesson.objects.exclude(stable_id__isnull=True)}
        for lesson_id, stem in sorted(lesson_to_stem.items()):
            if stem not in available:
                continue
            lesson = next((by_stable_id[a] for a in lesson_id_aliases(lesson_id) if a in by_stable_id), None)
            if lesson is None:
                stats['lessons not in DB'] += 1
                continue
            new_value = f'characters/{stem}.webp'
            current = lesson.example_image or ''
            if current == new_value:
                stats['lessons already linked'] += 1
                continue
            if current and not current.startswith('characters/') and not args.force:
                stats['lessons kept (custom image)'] += 1
                continue
            stats['lessons linked'] += 1
            if not args.dry_run:
                lesson.example_image = new_value
                lesson.save(update_fields=['example_image'])

        if args.dry_run:
            transaction.set_rollback(True)

    print('\nSummary' + (' (dry run, nothing written)' if args.dry_run else ''))
    for key in sorted(stats):
        print(f'  {key:28s} {stats[key]}')
    if bytes_out and sources and sources[0].suffix == '.png':
        print(f'  size: {bytes_in / 1e6:.1f} MB PNG -> {bytes_out / 1e6:.1f} MB WebP '
              f'({100 - bytes_out * 100 / bytes_in:.0f}% smaller)')


if __name__ == '__main__':
    main()

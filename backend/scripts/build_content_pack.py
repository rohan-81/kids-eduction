"""
Builds backend/media/content_pack_v1.zip containing all compressed remote media
(characters, app_assets, animal audio, rhymes audio, stories) so the mobile app
can download everything in a single fast request on first launch and work 100% offline.

Usage:
    python backend/scripts/build_content_pack.py
"""
from pathlib import Path
import json
import zipfile

BACKEND_DIR = Path(__file__).resolve().parent.parent
MEDIA_DIR = BACKEND_DIR / 'media'
OUT_ZIP = MEDIA_DIR / 'content_pack_v1.zip'

INCLUDE_SUBDIRS = [
    'characters',
    'app_assets',
    'audio/animals',
    'rhymes/audio',
    'stories',
]


def build_pack() -> Path:
    tmp_zip = OUT_ZIP.with_suffix('.tmp.zip')
    manifest_files = []
    # Media files (.webp, .mp3) are already compressed; ZIP_STORED gives near-identical size
    # while eliminating slow inflate decompression in JS on mobile.
    with zipfile.ZipFile(tmp_zip, 'w', compression=zipfile.ZIP_STORED) as zf:
        for sub in INCLUDE_SUBDIRS:
            sub_dir = MEDIA_DIR / sub
            if not sub_dir.exists():
                continue
            for fp in sorted(sub_dir.rglob('*')):
                if not fp.is_file() or fp.name.startswith('.'):
                    continue
                arcname = fp.relative_to(MEDIA_DIR).as_posix()
                zf.write(fp, arcname)
                manifest_files.append(arcname)

        manifest = {
            'version': 'v1',
            'file_count': len(manifest_files),
        }
        zf.writestr('manifest.json', json.dumps(manifest))

    tmp_zip.replace(OUT_ZIP)
    size_mb = OUT_ZIP.stat().st_size / 1048576.0
    print(f"Built {OUT_ZIP} ({len(manifest_files)} files, {size_mb:.2f} MB)")
    return OUT_ZIP


if __name__ == '__main__':
    build_pack()


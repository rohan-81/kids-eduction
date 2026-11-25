"""
Shared conversion of exported rhyme records into Rhyme model fields.

scripts/export_static_data.ts emits rhymes already flattened to the model layout
(slug, title, title_gujarati, title_hindi, category, lyrics_english, ...).
Older exports used {id, titleEn, titleGu, titleHi, lines: [{en, gu, hi}]}; both are accepted.
"""

from .models import Rhyme

LANGUAGE_CATEGORIES = {'en', 'gu', 'hi'}

# Withdrawn for licensing (AUDIO_PROVENANCE.md, Category B; see migration 0002). An old export
# file may still contain them: importing it must never re-activate them or re-link their audio.
RETIRED_RHYME_SLUGS = frozenset({'lakdi-kathi', 'chanda-mama', 'titli', 'bus-wheels'})


def rhyme_slug(record, idx):
    return str(record.get('slug') or record.get('id') or f"rhyme-{idx + 1}")


def rhyme_defaults(record, idx):
    if any(k in record for k in ('lyrics_english', 'lyrics_gujarati', 'lyrics_hindi')):
        return {
            'title': record.get('title') or rhyme_slug(record, idx),
            'title_gujarati': record.get('title_gujarati', ''),
            'title_hindi': record.get('title_hindi', ''),
            'category': record.get('category') or 'nursery',
            'lyrics_english': record.get('lyrics_english', ''),
            'lyrics_gujarati': record.get('lyrics_gujarati', ''),
            'lyrics_hindi': record.get('lyrics_hindi', ''),
            'cover_image': record.get('cover_image', ''),
            'audio_url': record.get('audio_url', ''),
            'order': record.get('order', idx),
            'is_active': record.get('is_active', True),
        }

    # Legacy export layout
    lines = record.get('lines', []) or []

    def join(key):
        return "\n".join(ln.get(key, '') for ln in lines if isinstance(ln, dict) and ln.get(key))

    return {
        'title': record.get('titleEn') or record.get('titleGu') or rhyme_slug(record, idx),
        'title_gujarati': record.get('titleGu', ''),
        'title_hindi': record.get('titleHi', ''),
        'category': 'nursery',
        'lyrics_english': join('en'),
        'lyrics_gujarati': join('gu'),
        'lyrics_hindi': join('hi'),
        'order': idx,
        'is_active': True,
    }


def has_lyrics(defaults):
    return any(defaults.get(k) for k in ('lyrics_english', 'lyrics_gujarati', 'lyrics_hindi'))


def upsert_rhyme(record, idx):
    """Create/update one rhyme. Returns (obj, created)."""
    slug = rhyme_slug(record, idx)
    defaults = rhyme_defaults(record, idx)
    if slug in RETIRED_RHYME_SLUGS:
        defaults.update(is_active=False, audio_url='')
    return Rhyme.objects.update_or_create(slug=slug, defaults=defaults)

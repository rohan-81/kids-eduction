"""Shared helpers to seed the Sticker catalog from an exported JSON list."""

import json
from pathlib import Path

from .models import Sticker

DEFAULT_STICKER_FIXTURE = Path(__file__).resolve().parent / 'fixtures' / 'sticker_catalog.json'


def load_sticker_records(path=None):
    with open(path or DEFAULT_STICKER_FIXTURE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('stickers', []) if isinstance(data, dict) else data


def sticker_defaults(record, idx):
    name_en = record.get('name_en') or record.get('slug')
    return {
        'emoji': record.get('emoji', ''),
        'category': record.get('category') or 'animals',
        'name_en': name_en,
        'name_gu': record.get('name_gu', ''),
        'name_hi': record.get('name_hi', ''),
        'default_unlocked': bool(record.get('default_unlocked', False)),
        'order': record.get('order', idx),
        'is_active': record.get('is_active', True),
    }


def upsert_sticker(record, idx):
    """Create/update one sticker. Returns (obj, created)."""
    if not record.get('slug') or not record.get('emoji'):
        raise ValueError(f"sticker #{idx} is missing slug or emoji")
    return Sticker.objects.update_or_create(slug=record['slug'], defaults=sticker_defaults(record, idx))

import json
from pathlib import Path

from django.conf import settings
from django.test import TestCase

from rhymes.importing import RETIRED_RHYME_SLUGS, upsert_rhyme
from rhymes.models import Rhyme

EXPORT_FILE = Path(settings.BASE_DIR) / 'data_exports' / 'kidszone_data.json'
REPLACEMENTS = {'row-boat', 'mota-hathi', 'upar-pankha', 'bandar-mama'}


class RetiredRhymeTests(TestCase):
    def test_import_never_reactivates_a_retired_film_song(self):
        record = {'slug': 'lakdi-kathi', 'title': 'Lakdi Ki Kathi', 'lyrics_hindi': 'x',
                  'audio_url': '/media/rhymes/audio/lakdi-kathi.mp3', 'is_active': True}
        obj, _ = upsert_rhyme(record, 0)
        self.assertFalse(obj.is_active)
        self.assertEqual(obj.audio_url, '')

    def test_api_hides_retired_rhymes(self):
        Rhyme.objects.create(slug='chanda-mama', title='Chanda Mama', lyrics_hindi='x', is_active=False)
        Rhyme.objects.create(slug='row-boat', title='Row, Row, Row Your Boat', lyrics_english='Row')
        slugs = [r['slug'] for r in self.client.get('/api/rhymes/').json()]
        self.assertIn('row-boat', slugs)
        self.assertNotIn('chanda-mama', slugs)

    def test_export_file_has_replacements_and_no_retired_songs(self):
        rhymes = json.loads(EXPORT_FILE.read_text(encoding='utf-8'))['rhymes']
        slugs = {r['slug'] for r in rhymes}
        self.assertTrue(REPLACEMENTS <= slugs)
        self.assertFalse(RETIRED_RHYME_SLUGS & slugs)
        for r in rhymes:  # importer-readable shape (legacy main/sub rows were silently skipped)
            self.assertTrue(r.get('lyrics_english') or r.get('lyrics_gujarati') or r.get('lyrics_hindi'), r['slug'])

    def test_retired_audio_files_are_gone(self):
        audio_dir = Path(settings.MEDIA_ROOT) / 'rhymes' / 'audio'
        for slug in RETIRED_RHYME_SLUGS:
            self.assertFalse((audio_dir / f'{slug}.mp3').exists(), slug)

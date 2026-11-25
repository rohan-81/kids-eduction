from django.test import TestCase
from lessons.models import Category, Lesson

class LessonModelAndAPITest(TestCase):
    def setUp(self):
        self.cat = Category.objects.create(
            slug='gujarati',
            title='Gujarati Vowels',
            title_gujarati='સ્વર',
            title_hindi='स्वर',
            icon='📚',
        )
        self.lesson = Lesson.objects.create(
            stable_id='gu-vowel-1',
            title='અ - અનાનસ',
            category='gujarati',
            language='gu',
            age_group='2-4',
            difficulty=1,
            symbol='અ',
            example_word='અનાનસ',
            example_meaning='Pineapple',
        )

    def test_unicode_preservation(self):
        self.assertEqual(self.cat.title_gujarati, 'સ્વર')
        self.assertEqual(self.cat.title_hindi, 'स्वर')
        self.assertEqual(self.lesson.symbol, 'અ')
        self.assertEqual(self.lesson.example_word, 'અનાનસ')

    def test_lesson_filter_api(self):
        res = self.client.get('/api/lessons/?category=gujarati&language=gu')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        results = data.get('results', []) if isinstance(data, dict) else data
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]['symbol'], 'અ')


class MediaUrlAndCharacterAssetTest(TestCase):
    """3D renders served from /media/characters/ with absolute URLs in API responses."""

    def setUp(self):
        from lessons.models import CharacterAsset
        Lesson.objects.create(
            stable_id='an-lion', title='Lion', category='animals', language='en',
            example_image='characters/3d_lion.webp',
        )
        Lesson.objects.create(
            stable_id='gu-swar-1', title='અ', category='gu-varnamala', language='gu',
            example_image='https://images.unsplash.com/photo-1550258987?w=600',
        )
        CharacterAsset.objects.create(asset_key='3d_lion', image_file='characters/3d_lion.webp', category='animals')
        CharacterAsset.objects.create(asset_key='3d_old', image_file='characters/3d_old.webp', is_active=False)

    def test_lesson_example_image_is_absolute(self):
        res = self.client.get('/api/lessons/by-slug/an-lion/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['example_image'], 'http://testserver/media/characters/3d_lion.webp')

    def test_external_urls_are_untouched(self):
        res = self.client.get('/api/lessons/by-slug/gu-swar-1/')
        self.assertEqual(res.json()['example_image'], 'https://images.unsplash.com/photo-1550258987?w=600')

    def test_emoji_values_are_never_turned_into_urls(self):
        from lessons.media_urls import absolute_media_url
        self.assertEqual(absolute_media_url('🦅'), '🦅')
        self.assertEqual(absolute_media_url('☀️ 🦅 🏜️'), '☀️ 🦅 🏜️')
        self.assertEqual(absolute_media_url('/media/stories/crow.png'), '/media/stories/crow.png')

    def test_cdn_setting_rewrites_media_urls(self):
        from django.test import override_settings
        from lessons.media_urls import absolute_media_url
        with override_settings(MEDIA_CDN_URL='https://cdn.kidszone.app/media/'):
            self.assertEqual(absolute_media_url('characters/3d_lion.webp'), 'https://cdn.kidszone.app/media/characters/3d_lion.webp')

    def test_asset_manifest_lists_active_assets_unpaginated(self):
        res = self.client.get('/api/lessons/assets/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsInstance(data, list)
        self.assertEqual([a['asset_key'] for a in data], ['3d_lion'])
        self.assertEqual(data[0]['url'], 'http://testserver/media/characters/3d_lion.webp')

    def test_assets_route_is_not_swallowed_by_lesson_detail(self):
        res = self.client.get('/api/lessons/assets/3d_lion/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['asset_key'], '3d_lion')

    def test_webp_media_is_served_with_image_content_type(self):
        import mimetypes
        self.assertEqual(mimetypes.guess_type('x.webp')[0], 'image/webp')

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Reward

class RewardAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_and_fetch_reward(self):
        res = self.client.post('/api/rewards/', {
            'reward_type': 'badge',
            'title': 'Alphabet Master',
            'icon': '⭐',
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['title'], 'Alphabet Master')

        get_res = self.client.get('/api/rewards/')
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)


class StickerAPITest(TestCase):
    def setUp(self):
        from django.core.management import call_command
        from io import StringIO
        call_command('import_stickers', stdout=StringIO())
        self.client = APIClient()

    def test_catalog_is_seeded_from_fixture(self):
        from .models import Sticker
        self.assertEqual(Sticker.objects.count(), 24)
        self.assertEqual(Sticker.objects.filter(default_unlocked=True).count(), 11)

    def test_list_returns_ordered_multilingual_stickers(self):
        res = self.client.get('/api/rewards/stickers/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 24)
        first = res.data[0]
        self.assertEqual(first['slug'], 'stk-lion')
        for key in ('emoji', 'category', 'name_en', 'name_gu', 'name_hi', 'default_unlocked'):
            self.assertIn(key, first)

    def test_category_filter_and_detail(self):
        res = self.client.get('/api/rewards/stickers/', {'category': 'space'})
        self.assertTrue(len(res.data) > 0)
        self.assertTrue(all(s['category'] == 'space' for s in res.data))
        detail = self.client.get('/api/rewards/stickers/stk-rocket/')
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data['emoji'], '🚀')

    def test_inactive_stickers_are_hidden(self):
        from .models import Sticker
        Sticker.objects.filter(slug='stk-lion').update(is_active=False)
        slugs = [s['slug'] for s in self.client.get('/api/rewards/stickers/').data]
        self.assertNotIn('stk-lion', slugs)

    def test_reimport_is_idempotent(self):
        from django.core.management import call_command
        from io import StringIO
        from .models import Sticker
        call_command('import_stickers', stdout=StringIO())
        self.assertEqual(Sticker.objects.count(), 24)
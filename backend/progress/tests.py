from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from child_profiles.models import ChildProfile
from gamification.models import AdventureLevel, ChildAdventureProgress, ChildWallet
from lessons.models import Lesson
from progress.models import GameResult, LessonProgress


def _sync_payload(child_id, **overrides):
    payload = {
        'child_profile_id': child_id,
        'lessons': [{'lesson_id': 'gu-kakko-1', 'completed': True, 'stars': 3, 'best_score': 100}],
        'wallet': {'coins': 85, 'stars': 12},
        'streak': {'current_streak': 4, 'longest_streak': 6},
        'avatar': {'base_avatar': 'bunny', 'equipped_hat': 'hat-crown', 'unlocked_items': ['hat-crown', 'item-wand']},
    }
    payload.update(overrides)
    return payload


class CloudSyncTest(TestCase):
    def setUp(self):
        self.parent = User.objects.create_user(username='sync_parent', password='Sunflower#2026')
        self.child = ChildProfile.objects.create(nickname='Sync Explorer', age_group='2-4', parent=self.parent)
        self.lesson = Lesson.objects.create(
            stable_id='gu-kakko-1',
            title='ક - કમળ',
            category='gujarati',
            language='gu',
        )
        self.api = APIClient()
        self.api.force_authenticate(self.parent)

    def test_multi_device_cloud_sync(self):
        res = self.api.post('/api/sync/', _sync_payload(self.child.id), format='json')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['status'], 'synchronized')
        self.assertEqual(data['wallet']['total_coins'], 85)
        self.assertEqual(data['wallet']['total_stars'], 12)
        self.assertEqual(data['streak']['current_streak'], 4)
        self.assertEqual(data['avatar']['base_avatar'], 'bunny')
        self.assertIn('hat-crown', data['avatar']['unlocked_items'])

        progress = LessonProgress.objects.filter(child_profile=self.child, lesson_slug='gu-kakko-1').first()
        self.assertIsNotNone(progress)
        self.assertTrue(progress.completed)
        self.assertEqual(progress.stars, 3)

    # --- P0-2: guest isolation -------------------------------------------------------------

    def test_anonymous_sync_is_rejected_and_writes_nothing(self):
        res = APIClient().post('/api/sync/', _sync_payload(self.child.id), format='json')
        self.assertEqual(res.status_code, 401)
        self.assertFalse(LessonProgress.objects.exists())
        self.assertFalse(ChildProfile.objects.filter(parent__isnull=True).exists())

    def test_anonymous_game_result_is_rejected(self):
        res = APIClient().post(
            '/api/game-results/',
            {'child_profile': self.child.id, 'game_type': 'picture-puzzle', 'score': 8, 'total_questions': 10},
            format='json',
        )
        self.assertEqual(res.status_code, 401)
        self.assertFalse(GameResult.objects.exists())

    def test_anonymous_cannot_list_progress(self):
        LessonProgress.objects.create(child_profile=self.child, lesson_slug='gu-kakko-1')
        res = APIClient().get('/api/progress/')
        self.assertEqual(res.status_code, 401)

    def test_parent_cannot_sync_into_another_parents_child(self):
        other = User.objects.create_user(username='other_parent', password='Sunflower#2026')
        other_child = ChildProfile.objects.create(nickname='Other', age_group='4-6', parent=other)
        res = self.api.post('/api/sync/', _sync_payload(other_child.id), format='json')
        self.assertEqual(res.status_code, 404)
        self.assertFalse(LessonProgress.objects.filter(child_profile=other_child).exists())
        # ...and it is NOT silently redirected into this parent's own child either.
        self.assertFalse(LessonProgress.objects.filter(child_profile=self.child).exists())

    def test_unknown_child_id_does_not_fall_back_to_first_child(self):
        res = self.api.post('/api/sync/', _sync_payload(1_700_000_000_000), format='json')
        self.assertEqual(res.status_code, 404)
        self.assertFalse(LessonProgress.objects.exists())

    def test_game_result_for_owned_child(self):
        res = self.api.post(
            '/api/game-results/',
            {'child_profile': self.child.id, 'game_type': 'picture-puzzle', 'score': 8, 'total_questions': 10},
            format='json',
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['score'], 8)

    # --- P0-3: input hardening --------------------------------------------------------------

    def test_malformed_numbers_do_not_crash(self):
        payload = _sync_payload(
            self.child.id,
            adventure_level='lots',
            wallet={'coins': 'abc', 'stars': None},
            streak={'current_streak': [], 'longest_streak': {}},
            lessons=[{'lesson_id': 'gu-kakko-1', 'stars': 'x', 'best_score': '1e9'}],
        )
        res = self.api.post('/api/sync/', payload, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(ChildWallet.objects.get(child_profile=self.child).total_coins, 0)

    def test_huge_adventure_level_is_clamped_to_existing_levels(self):
        for n in range(1, 6):
            AdventureLevel.objects.create(level_number=n, title=f'L{n}')
        res = self.api.post('/api/sync/', _sync_payload(self.child.id, adventure_level=10**9), format='json')
        self.assertEqual(res.status_code, 200)
        self.assertLessEqual(res.json()['adventure_level'], 6)
        self.assertEqual(ChildAdventureProgress.objects.filter(child_profile=self.child, completed=True).count(), 4)

    def test_stars_are_capped_and_lesson_batch_is_bounded(self):
        res = self.api.post(
            '/api/sync/',
            _sync_payload(self.child.id, lessons=[{'lesson_id': 'gu-kakko-1', 'stars': 999}]),
            format='json',
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(LessonProgress.objects.get(child_profile=self.child).stars, 3)

        too_many = [{'lesson_id': f'l-{i}'} for i in range(501)]
        res = self.api.post('/api/sync/', _sync_payload(self.child.id, lessons=too_many), format='json')
        self.assertEqual(res.status_code, 400)

    def test_is_reset_requires_strict_json_true(self):
        LessonProgress.objects.create(child_profile=self.child, lesson_slug='keep-me')
        for falsy_looking in ['false', 'true', 1, 'yes']:
            res = self.api.post(
                '/api/sync/', _sync_payload(self.child.id, lessons=[], is_reset=falsy_looking), format='json'
            )
            self.assertEqual(res.status_code, 200)
            self.assertTrue(LessonProgress.objects.filter(lesson_slug='keep-me').exists(), falsy_looking)

        res = self.api.post('/api/sync/', _sync_payload(self.child.id, lessons=[], is_reset=True), format='json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()['is_reset'])
        self.assertFalse(LessonProgress.objects.filter(lesson_slug='keep-me').exists())

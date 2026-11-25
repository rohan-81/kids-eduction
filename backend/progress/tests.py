from django.test import TestCase
from child_profiles.models import ChildProfile
from lessons.models import Lesson
from progress.models import LessonProgress
from gamification.models import ChildWallet

class CloudSyncTest(TestCase):
    def setUp(self):
        self.child = ChildProfile.objects.create(nickname='Sync Explorer', age_group='2-4')
        self.lesson = Lesson.objects.create(
            stable_id='gu-kakko-1',
            title='ક - કમળ',
            category='gujarati',
            language='gu',
        )

    def test_multi_device_cloud_sync(self):
        payload = {
            'child_profile_id': self.child.id,
            'lessons': [
                {'lesson_id': 'gu-kakko-1', 'completed': True, 'stars': 3, 'best_score': 100}
            ],
            'wallet': {
                'coins': 85,
                'stars': 12,
            },
            'streak': {
                'current_streak': 4,
                'longest_streak': 6,
            },
            'avatar': {
                'base_avatar': 'bunny',
                'equipped_hat': 'hat-crown',
                'unlocked_items': ['hat-crown', 'item-wand'],
            }
        }
        res = self.client.post('/api/sync/', payload, content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['status'], 'synchronized')
        self.assertEqual(data['wallet']['total_coins'], 85)
        self.assertEqual(data['wallet']['total_stars'], 12)
        self.assertEqual(data['streak']['current_streak'], 4)
        self.assertEqual(data['avatar']['base_avatar'], 'bunny')
        self.assertIn('hat-crown', data['avatar']['unlocked_items'])

        # Verify database record created
        progress = LessonProgress.objects.filter(child_profile=self.child, lesson_slug='gu-kakko-1').first()
        self.assertIsNotNone(progress)
        self.assertTrue(progress.completed)
        self.assertEqual(progress.stars, 3)

    def test_guest_game_result_submission_allowed(self):
        from django.contrib.auth.models import User
        parent = User.objects.create_user(username='parent_test', password='password123')
        parent_child = ChildProfile.objects.create(nickname='Parent Child', age_group='2-4', parent=parent)

        # Unauthenticated guest submits game result using parent_child id
        payload = {
            'child_profile': parent_child.id,
            'game_type': 'picture-puzzle',
            'score': 8,
            'total_questions': 10,
        }
        res = self.client.post('/api/game-results/', payload, content_type='application/json')
        # Should succeed (201 Created) without throwing 403 Permission Denied
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['game_type'], 'picture-puzzle')
        self.assertEqual(data['score'], 8)

    def test_guest_cloud_sync_with_owned_profile_id_allowed(self):
        from django.contrib.auth.models import User
        parent = User.objects.create_user(username='parent_sync_user', password='password123')
        parent_child = ChildProfile.objects.create(nickname='Sync Child', age_group='2-4', parent=parent)

        # Unauthenticated guest submits cloud sync using parent_child id
        payload = {
            'child_profile_id': parent_child.id,
            'lessons': [
                {'lesson_id': 'gu-kakko-1', 'completed': True, 'stars': 3, 'best_score': 100}
            ],
            'wallet': {'coins': 50, 'stars': 5},
            'streak': {'current_streak': 2, 'longest_streak': 3},
            'avatar': {'base_avatar': 'fox', 'unlocked_items': []},
        }
        res = self.client.post('/api/sync/', payload, content_type='application/json')
        # Should succeed (200 OK) instead of throwing 403 Forbidden: Profile belongs to another parent
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['status'], 'synchronized')

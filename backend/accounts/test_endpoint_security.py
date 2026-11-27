"""
End-to-end API audit: every route under /api/ is classified as public or private.

- Private routes must answer 401 to every HTTP method when no token is sent.
- Public routes may be read anonymously, but never written (except the auth/answer endpoints).
- A route nobody classified fails the suite, so new endpoints cannot ship unreviewed.
- Deleting a child purges every row that references it (no orphans).
- Coins spent on the device are deducted once on sync (no refund, no double charge).
"""
from django.contrib.auth.models import User
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.db.models import ForeignKey, OneToOneField
from django.test import TestCase
from django.urls import URLResolver, get_resolver, reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from child_profiles.models import ChildProfile
from gamification.models import (
    AdventureLevel, ChildAdventureProgress, ChildWallet, CoinTransaction, DailyStreak, LuckySpinHistory,
)
from parent_controls.models import ScreenTimeLog, ScreenTimeSetting, WrongAnswerLog
from personalization.models import AvatarItem, ChildAvatar, GardenPlant
from progress.models import DailyActivity, GameResult, LessonProgress
from rewards.models import Reward

CHILD = {'child_id': 1}
PK = {'pk': 1}

# name -> reverse() kwargs
PRIVATE = {
    'user-me': {}, 'logout': {}, 'session': {},
    'profile-list': {}, 'profile-detail': PK,
    'child-wallet': CHILD, 'child-streak': CHILD, 'child-spin': CHILD,
    'child-avatar': CHILD, 'purchase-avatar-item': CHILD,
    'garden-plants-list': {}, 'garden-plants-detail': PK,
    'reward-list': {}, 'reward-detail': PK,
    'cloud-sync': {},
    'lesson-progress-root-list': {}, 'lesson-progress-root-detail': PK,
    'lesson-progress-nested-list': {}, 'lesson-progress-nested-detail': PK,
    'game-results-root-list': {}, 'game-results-root-detail': PK,
    'game-results-nested-list': {}, 'game-results-nested-detail': PK,
    'daily-activity-list': {}, 'daily-activity-detail': PK,
    'screen-time-settings': CHILD, 'screen-time-log': CHILD,
    'wrong-answers-list': {}, 'wrong-answers-detail': PK,
}

# Read-only public content. Writes must be refused (401/403/405).
PUBLIC_READ = {
    'lesson-list': {}, 'lesson-detail': PK, 'lesson-get-by-stable-id': {'stable_id': 'x'},
    'category-list': {}, 'category-detail': {'slug': 'x'},
    'character-asset-list': {}, 'character-asset-detail': {'asset_key': 'x'},
    'animal-audio': {'key': 'dog'},
    'question-list': {}, 'question-detail': PK, 'question-game-questions': {},
    'story-list': {}, 'story-detail': {'slug': 'x'},
    'rhyme-list': {}, 'rhyme-detail': {'slug': 'x'},
    'coloring-list': {}, 'coloring-detail': {'slug': 'x'},
    'worksheets-list': {}, 'worksheets-detail': {'slug': 'x'},
    'adventure-levels-list': {}, 'adventure-levels-detail': {'level_number': 1},
    'avatar-items-list': {}, 'avatar-items-detail': {'item_id': 'x'},
    'badges-list': {}, 'badges-detail': {'slug': 'x'},
    'stickers-list': {}, 'stickers-detail': {'slug': 'x'},
}

# Public by design: they accept anonymous POSTs (credentials / answer checking) or proxy TTS.
PUBLIC_ACTIONS = {'register', 'login', 'question-submit-answer', 'tts-audio', 'tts-audio-mp3', 'api-root'}

METHODS = ('get', 'post', 'put', 'patch', 'delete')


def _api_route_names():
    def walk(patterns, prefix=''):
        for p in patterns:
            if isinstance(p, URLResolver):
                yield from walk(p.url_patterns, prefix + str(p.pattern))
            else:
                yield prefix + str(p.pattern), p.name

    return {name for path, name in walk(get_resolver().url_patterns) if path.startswith('api')}


class EndpointClassificationTests(TestCase):
    def test_every_api_route_is_classified(self):
        known = set(PRIVATE) | set(PUBLIC_READ) | PUBLIC_ACTIONS
        unclassified = _api_route_names() - known
        self.assertEqual(unclassified, set(), 'New API routes must be added to PRIVATE or PUBLIC_READ')

    def test_private_routes_return_401_for_every_method(self):
        client = APIClient()
        failures = []
        for name, kwargs in PRIVATE.items():
            url = reverse(name, kwargs=kwargs)
            for method in METHODS:
                status = getattr(client, method)(url, {}, format='json').status_code
                if status != 401:
                    failures.append(f'{method.upper()} {url} -> {status}')
        self.assertEqual(failures, [])

    def test_public_content_is_readable_but_not_writable(self):
        client = APIClient()
        failures = []
        for name, kwargs in PUBLIC_READ.items():
            url = reverse(name, kwargs=kwargs)
            status = client.get(url).status_code
            if status not in (200, 404):
                failures.append(f'GET {url} -> {status}')
            for method in ('post', 'put', 'patch', 'delete'):
                status = getattr(client, method)(url, {}, format='json').status_code
                if status not in (401, 403, 405):
                    failures.append(f'{method.upper()} {url} -> {status}')
        self.assertEqual(failures, [])

    def test_malformed_query_params_never_500(self):
        client = APIClient()
        for url in (
            '/api/questions/?lesson_id=abc',
            '/api/questions/?difficulty=hard',
            '/api/lessons/?difficulty=x',
            '/api/questions/game-questions/?lesson_id=1%27--',
        ):
            self.assertEqual(client.get(url).status_code, 200, url)


class _ParentFixture(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='audit-parent', password='Password123!')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        self.child = ChildProfile.objects.create(parent=self.user, nickname='Kid')


class ChildDeletionPurgeTests(_ParentFixture):
    def test_deleting_a_child_leaves_no_orphan_rows(self):
        child = self.child
        level = AdventureLevel.objects.create(level_number=1, title='L1')
        ChildAdventureProgress.objects.create(child_profile=child, level=level)
        ChildWallet.objects.create(child_profile=child, total_coins=5)
        CoinTransaction.objects.create(child_profile=child, amount=5)
        DailyStreak.objects.create(child_profile=child)
        LuckySpinHistory.objects.create(child_profile=child)
        ScreenTimeSetting.objects.create(child_profile=child)
        ScreenTimeLog.objects.create(child_profile=child, date='2026-01-01')
        WrongAnswerLog.objects.create(child_profile=child, question_text='q', user_answer='a', correct_answer='b')
        ChildAvatar.objects.create(child_profile=child)
        GardenPlant.objects.create(child_profile=child)
        LessonProgress.objects.create(child_profile=child, lesson_slug='l1')
        GameResult.objects.create(child_profile=child, game_type='quiz')
        DailyActivity.objects.create(child_profile=child, date='2026-01-01')
        Reward.objects.create(child_profile=child)

        # Every model pointing at ChildProfile must be covered by the fixture above.
        related = {
            rel.related_model for rel in ChildProfile._meta.related_objects
            if isinstance(rel.field, (ForeignKey, OneToOneField))
        }
        for model in related:
            self.assertTrue(model.objects.filter(child_profile=child).exists(), f'fixture misses {model.__name__}')

        response = self.client.delete(f'/api/profiles/{child.id}/')
        self.assertEqual(response.status_code, 204)

        self.assertFalse(ChildProfile.objects.filter(id=child.id).exists())
        leftovers = {m.__name__: m.objects.filter(child_profile_id=child.id).count() for m in related}
        self.assertEqual({k: v for k, v in leftovers.items() if v}, {})

    def test_cannot_delete_another_parents_child(self):
        other = User.objects.create_user(username='other-parent', password='Password123!')
        foreign = ChildProfile.objects.create(parent=other, nickname='Not yours')
        self.assertEqual(self.client.delete(f'/api/profiles/{foreign.id}/').status_code, 404)
        self.assertTrue(ChildProfile.objects.filter(id=foreign.id).exists())


class WalletSpendSyncTests(_ParentFixture):
    def sync(self, coins, spent_total, **extra):
        payload = {'child_profile_id': self.child.id, 'wallet': {'coins': coins, 'stars': 0, 'spent_total': spent_total}}
        payload.update(extra)
        return self.client.post('/api/sync/', payload, format='json').json()

    def test_device_purchase_is_not_refunded_by_sync(self):
        ChildWallet.objects.create(child_profile=self.child, total_coins=100)
        state = self.sync(coins=50, spent_total=50)
        self.assertEqual(state['wallet']['total_coins'], 50)
        self.assertEqual(state['coins_spent_total'], 50)

    def test_resending_the_same_spend_is_idempotent(self):
        ChildWallet.objects.create(child_profile=self.child, total_coins=100)
        self.sync(coins=50, spent_total=50)
        state = self.sync(coins=50, spent_total=50)
        self.assertEqual(state['wallet']['total_coins'], 50)
        self.assertEqual(CoinTransaction.objects.filter(child_profile=self.child, transaction_type='device_spend').count(), 1)

    def test_offline_earnings_and_spending_both_survive(self):
        ChildWallet.objects.create(child_profile=self.child, total_coins=100)
        # Offline: earned 20, spent 50 -> device balance 70.
        state = self.sync(coins=70, spent_total=50)
        self.assertEqual(state['wallet']['total_coins'], 70)

    def test_other_device_earnings_are_kept_when_this_device_spends(self):
        ChildWallet.objects.create(child_profile=self.child, total_coins=130)  # another device earned 30
        state = self.sync(coins=50, spent_total=50)  # this device: 100 - 50
        self.assertEqual(state['wallet']['total_coins'], 80)

    def test_reset_clears_the_spend_ledger(self):
        ChildWallet.objects.create(child_profile=self.child, total_coins=100)
        self.sync(coins=50, spent_total=50)
        self.sync(coins=50, spent_total=0, is_reset=True)
        state = self.sync(coins=20, spent_total=30)  # fresh lifetime counter after the reset
        self.assertEqual(state['wallet']['total_coins'], 20)

    def test_many_lessons_sync_in_constant_queries(self):
        lessons = [{'lesson_id': f'l-{i}', 'completed': True, 'stars': 2} for i in range(200)]
        with CaptureQueriesContext(connection) as ctx:
            self.client.post('/api/sync/', {'child_profile_id': self.child.id, 'lessons': lessons}, format='json')
        self.assertLess(len(ctx.captured_queries), 40)  # was ~2 queries per lesson (400+)
        self.assertEqual(LessonProgress.objects.filter(child_profile=self.child).count(), 200)
        # Second sync upgrades stars without new rows.
        lessons[0]['stars'] = 3
        self.client.post('/api/sync/', {'child_profile_id': self.child.id, 'lessons': lessons}, format='json')
        self.assertEqual(LessonProgress.objects.get(child_profile=self.child, lesson_slug='l-0').stars, 3)
        self.assertEqual(LessonProgress.objects.filter(child_profile=self.child).count(), 200)


class AvatarPurchaseTests(_ParentFixture):
    def setUp(self):
        super().setUp()
        AvatarItem.objects.create(item_id='crown', name='Crown', price_coins=30)
        ChildWallet.objects.create(child_profile=self.child, total_coins=100)

    def test_double_tap_purchase_charges_once(self):
        url = f'/api/personalization/purchase/{self.child.id}/'
        self.assertEqual(self.client.post(url, {'item_id': 'crown'}, format='json').status_code, 200)
        self.assertEqual(self.client.post(url, {'item_id': 'crown'}, format='json').status_code, 200)
        self.assertEqual(ChildWallet.objects.get(child_profile=self.child).total_coins, 70)
        self.assertEqual(CoinTransaction.objects.filter(child_profile=self.child).count(), 1)

    def test_avatar_put_rejects_non_strings_and_clips_long_values(self):
        url = f'/api/personalization/avatar/{self.child.id}/'
        self.assertEqual(self.client.put(url, {'base_avatar': {'x': 1}}, format='json').status_code, 400)
        response = self.client.put(url, {'base_avatar': 'a' * 500, 'unlocked_items': ['hat', {'bad': 1}]}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['base_avatar']), 50)
        self.assertEqual(response.json()['unlocked_items'], ['hat'])


class BackendBugFixRegressionTests(_ParentFixture):
    def test_nested_progress_routes_not_shadowed(self):
        for url in ('/api/progress/lessons/', '/api/progress/games/', '/api/progress/activity/'):
            res = self.client.get(url)
            self.assertEqual(res.status_code, 200, f'Expected 200 for {url}, got {res.status_code}')

    def test_animal_audio_path_traversal_rejected(self):
        res = self.client.get('/api/lessons/animal-audio/../../settings.py/')
        self.assertIn(res.status_code, (400, 404))
        res_direct = self.client.get('/api/lessons/animal-audio/..%5C..%5Csettings/')
        self.assertEqual(res_direct.status_code, 400)

    def test_unbounded_int_params_do_not_500(self):
        res_q = self.client.get('/api/questions/game-questions/', {'lesson_id': '9' * 40, 'difficulty': '9' * 20})
        self.assertEqual(res_q.status_code, 200)
        res_l = self.client.get('/api/lessons/', {'difficulty': '9' * 20})
        self.assertEqual(res_l.status_code, 200)

    def test_garden_plant_idor_returns_404(self):
        other_user = User.objects.create_user(username='other_parent', password='x')
        other_child = ChildProfile.objects.create(parent=other_user, nickname='Other')
        res = self.client.post(
            '/api/personalization/garden/',
            {'child_profile_id': other_child.id, 'slot_index': 0, 'plant_type': 'rose', 'stage': 'seed', 'water_count': 1},
            format='json',
        )
        self.assertEqual(res.status_code, 404)

    def test_login_ignores_session_csrf(self):
        csrf_user = User.objects.create_user(username='csrf_parent', password='StrongPassword123!')
        csrf_client = APIClient(enforce_csrf_checks=True)
        csrf_client.force_login(csrf_user)
        res = csrf_client.post('/api/auth/login/', {'username': 'csrf_parent', 'password': 'StrongPassword123!'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('token', res.json())

    def test_cloud_sync_reset_and_game_stats_and_last_active(self):
        GardenPlant.objects.create(child_profile=self.child, slot_index=0, plant_type='tulip', stage='seedling', water_count=3)
        ChildAvatar.objects.create(child_profile=self.child, base_avatar='boy', unlocked_items=['crown'])
        res_reset = self.client.post(
            '/api/sync/',
            {'child_profile_id': self.child.id, 'is_reset': True},
            format='json',
        )
        self.assertEqual(res_reset.status_code, 200)
        self.assertEqual(GardenPlant.objects.filter(child_profile=self.child).count(), 0)
        self.assertEqual(ChildAvatar.objects.get(child_profile=self.child).unlocked_items, [])

        res_sync = self.client.post(
            '/api/sync/',
            {
                'child_profile_id': self.child.id,
                'streak': 4,
                'last_active_date': '2026-11-26',
                'game_stats': {'math-quiz': {'highScore': 95, 'timesPlayed': 3}},
            },
            format='json',
        )
        self.assertEqual(res_sync.status_code, 200)
        self.assertEqual(GameResult.objects.filter(child_profile=self.child, game_type='math-quiz').count(), 1)
        self.assertEqual(GameResult.objects.get(child_profile=self.child, game_type='math-quiz').score, 95)

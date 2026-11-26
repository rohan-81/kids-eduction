from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from child_profiles.models import ChildProfile
from gamification.models import ChildWallet, LuckySpinHistory


class LuckySpinViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='parent1', password='Password123!')
        self.child = ChildProfile.objects.create(parent=self.user, nickname='Aarav', age_group='4-6')

    def test_anonymous_spin_rejected(self):
        res = self.client.post(f'/api/gamification/spin/{self.child.id}/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_spin_awards_prize_and_blocks_same_day_repeat(self):
        self.client.force_authenticate(user=self.user)

        # First spin: succeeds
        res1 = self.client.post(f'/api/gamification/spin/{self.child.id}/')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertIn('prize', res1.data)
        self.assertIn('wallet', res1.data)
        self.assertEqual(LuckySpinHistory.objects.filter(child_profile=self.child).count(), 1)

        # Second spin on same day: blocked
        res2 = self.client.post(f'/api/gamification/spin/{self.child.id}/')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(res2.data.get('already_claimed'))
        self.assertEqual(LuckySpinHistory.objects.filter(child_profile=self.child).count(), 1)

    def test_spin_is_available_again_the_next_day(self):
        from datetime import timedelta
        from django.utils import timezone
        self.client.force_authenticate(user=self.user)
        self.assertEqual(self.client.post(f'/api/gamification/spin/{self.child.id}/').status_code, 200)
        # Age yesterday's spin (auto_now_add ignores explicit values, so update afterwards).
        LuckySpinHistory.objects.filter(child_profile=self.child).update(spun_at=timezone.now() - timedelta(days=1))
        self.assertEqual(self.client.post(f'/api/gamification/spin/{self.child.id}/').status_code, 200)
        self.assertEqual(LuckySpinHistory.objects.filter(child_profile=self.child).count(), 2)

    def test_cannot_spin_for_another_parents_child(self):
        other = User.objects.create_user(username='parent2', password='Password123!')
        self.client.force_authenticate(user=other)
        res = self.client.post(f'/api/gamification/spin/{self.child.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(LuckySpinHistory.objects.exists())

    def test_prize_is_credited_exactly_once_to_the_wallet(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(f'/api/gamification/spin/{self.child.id}/')
        self.client.post(f'/api/gamification/spin/{self.child.id}/')  # blocked
        wallet = ChildWallet.objects.get(child_profile=self.child)
        prize = res.data['prize']
        if prize['type'] == 'coins':
            self.assertEqual(wallet.total_coins, prize['value'])
        else:
            self.assertEqual(wallet.total_stars, prize['value'])

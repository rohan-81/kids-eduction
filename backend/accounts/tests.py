from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from child_profiles.models import ChildProfile


class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_success_with_child_profile(self):
        payload = {
            'username': 'parent_sarah',
            'email': 'sarah@example.com',
            'password': 'Sunflower#2026',
            'parent_name': 'Sarah Jenkins',
            'child_nickname': 'Leo',
            'child_age_group': '4-6',
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'parent_sarah')
        self.assertEqual(response.data['user']['first_name'], 'Sarah Jenkins')

        # Check user created in DB
        user = User.objects.get(username='parent_sarah')
        self.assertTrue(user.check_password('Sunflower#2026'))

        # Check child profile linked
        child = ChildProfile.objects.filter(parent=user).first()
        self.assertIsNotNone(child)
        self.assertEqual(child.nickname, 'Leo')
        self.assertEqual(child.age_group, '4-6')

    def test_register_duplicate_username(self):
        User.objects.create_user(username='existing_parent', password='password123')
        payload = {
            'username': 'existing_parent',
            'password': 'Sunflower#2026x',
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('username', response.data)

    def test_register_duplicate_email(self):
        User.objects.create_user(username='user1', email='test@example.com', password='password123')
        payload = {
            'username': 'user2',
            'email': 'test@example.com',
            'password': 'Sunflower#2026x',
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    def test_register_short_password(self):
        payload = {
            'username': 'new_parent',
            'password': '123',
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)

    def test_login_with_username(self):
        user = User.objects.create_user(username='john_doe', email='john@example.com', password='secretpassword')
        payload = {
            'username': 'john_doe',
            'password': 'secretpassword',
        }
        response = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['id'], user.id)

    def test_login_with_username_case_insensitive(self):
        user = User.objects.create_user(username='Ravi_Parent', email='ravi@example.com', password='secretpassword')
        # Login with all lowercase username
        payload = {
            'username': 'ravi_parent',
            'password': 'secretpassword',
        }
        response = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'Ravi_Parent')

    def test_login_with_email(self):
        user = User.objects.create_user(username='priya_sharma', email='priya@example.com', password='mypassword')
        payload = {
            'username': 'priya@example.com',
            'password': 'mypassword',
        }
        response = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'priya_sharma')

    def test_login_invalid_password(self):
        User.objects.create_user(username='valid_user', password='correct_password')
        payload = {
            'username': 'valid_user',
            'password': 'wrong_password',
        }
        response = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_user_me_authenticated(self):
        user = User.objects.create_user(username='auth_user', password='password123')
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['username'], 'auth_user')

    def test_user_me_unauthenticated(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, 401)

    def test_logout(self):
        user = User.objects.create_user(username='logout_user', password='password123')
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.post('/api/auth/logout/')
        self.assertEqual(response.status_code, 200)
        # Token should now be deleted
        self.assertFalse(Token.objects.filter(user=user).exists())

    def test_child_profile_authenticated_scoping(self):
        user = User.objects.create_user(username='parent_mark', password='password123')
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # Create child profile
        create_res = self.client.post('/api/profiles/', {'nickname': 'Mila', 'age_group': '2-4'}, format='json')
        self.assertEqual(create_res.status_code, 201)

        # Check DB parent
        profile = ChildProfile.objects.get(id=create_res.data['id'])
        self.assertEqual(profile.parent, user)



class AuthHardeningTests(TestCase):
    """Audit P1-8: password validators run on registration; login is rate limited."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.client = APIClient()

    def test_common_password_rejected(self):
        res = self.client.post('/api/auth/register/', {'username': 'weakling', 'password': 'password'}, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('password', res.data)

    def test_numeric_password_rejected(self):
        res = self.client.post('/api/auth/register/', {'username': 'numbers', 'password': '83920174'}, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('password', res.data)

    def test_login_is_throttled(self):
        from unittest import mock
        from rest_framework.throttling import ScopedRateThrottle
        rates = dict(ScopedRateThrottle.THROTTLE_RATES, login='3/min')
        with mock.patch.object(ScopedRateThrottle, 'THROTTLE_RATES', rates):
            codes = [
                self.client.post('/api/auth/login/', {'username': 'x', 'password': 'y'}, format='json').status_code
                for _ in range(5)
            ]
        self.assertEqual(codes[:3], [400, 400, 400])
        self.assertEqual(codes[3:], [429, 429])

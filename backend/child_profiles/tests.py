from django.test import TestCase
from django.contrib.auth.models import User
from child_profiles.models import ChildProfile

class ChildProfilePermissionTest(TestCase):
    def setUp(self):
        self.parent_a = User.objects.create_user(username='parent_a', password='Password123!')
        self.parent_b = User.objects.create_user(username='parent_b', password='Password123!')

        self.child_a = ChildProfile.objects.create(
            parent=self.parent_a,
            nickname='Child A',
            age_group='2-4',
        )
        self.child_b = ChildProfile.objects.create(
            parent=self.parent_b,
            nickname='Child B',
            age_group='4-6',
        )

    def test_parent_isolation(self):
        """CRITICAL SECURITY: Verify Parent A only sees Child A and CANNOT see Child B"""
        self.client.force_login(self.parent_a)
        res = self.client.get('/api/profiles/')
        self.assertEqual(res.status_code, 200)
        raw = res.json()
        results = raw.get('results', []) if isinstance(raw, dict) else raw
        ids = [c['id'] for c in results]
        self.assertIn(self.child_a.id, ids)
        self.assertNotIn(self.child_b.id, ids)

    def test_parent_cannot_delete_other_child(self):
        self.client.force_login(self.parent_a)
        res = self.client.delete(f'/api/profiles/{self.child_b.id}/')
        # Should be 404 or 403 because queryset isolates to parent's children
        self.assertIn(res.status_code, [403, 404])
        self.assertTrue(ChildProfile.objects.filter(id=self.child_b.id).exists())


class ChildProfileHardeningTest(TestCase):
    """Audit P1-7: no anonymous profile writes, PINs hashed and never returned."""

    def setUp(self):
        from rest_framework.test import APIClient
        self.parent = User.objects.create_user(username='pin_parent', password='Password123!')
        self.api = APIClient()
        self.api.force_authenticate(self.parent)

    def test_anonymous_profile_creation_is_rejected(self):
        from rest_framework.test import APIClient
        res = APIClient().post('/api/profiles/', {'nickname': 'Spam', 'age_group': '2-4'}, format='json')
        self.assertEqual(res.status_code, 401)
        self.assertFalse(ChildProfile.objects.filter(parent__isnull=True).exists())

    def test_spoofed_parent_verified_header_grants_nothing(self):
        from rest_framework.test import APIClient
        child = ChildProfile.objects.create(parent=self.parent, nickname='Kid', age_group='2-4')
        res = APIClient().delete(f'/api/profiles/{child.id}/', HTTP_X_PARENT_VERIFIED='true')
        self.assertEqual(res.status_code, 401)
        self.assertTrue(ChildProfile.objects.filter(id=child.id).exists())

    def test_pin_is_hashed_write_only_and_checkable(self):
        res = self.api.post('/api/profiles/', {'nickname': 'Kid', 'age_group': '4-6', 'pin_code': '4821'}, format='json')
        self.assertEqual(res.status_code, 201)
        body = res.json()
        self.assertNotIn('pin_code', body)
        self.assertTrue(body['has_pin'])

        child = ChildProfile.objects.get(id=body['id'])
        self.assertNotEqual(child.pin_code, '4821')
        self.assertTrue(child.check_pin('4821'))
        self.assertFalse(child.check_pin('0000'))
        self.assertEqual(child.parent, self.parent)

    def test_pin_must_be_digits(self):
        res = self.api.post('/api/profiles/', {'nickname': 'Kid', 'age_group': '4-6', 'pin_code': 'abcd'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_blank_pin_clears_it(self):
        res = self.api.post('/api/profiles/', {'nickname': 'Kid', 'age_group': '4-6', 'pin_code': '4821'}, format='json')
        pid = res.json()['id']
        res = self.api.patch(f'/api/profiles/{pid}/', {'pin_code': ''}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()['has_pin'])

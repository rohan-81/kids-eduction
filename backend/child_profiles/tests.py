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

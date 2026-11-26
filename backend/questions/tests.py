from django.test import TestCase
from questions.models import Question

class QuestionSecurityAndSubmissionTest(TestCase):
    def setUp(self):
        self.question = Question.objects.create(
            stable_id='q-sec-1',
            question_text='Find the letter K',
            question_type='find-letter',
            category='gujarati',
            language='gu',
            options=[{'id': '1', 'label': 'ક'}, {'id': '2', 'label': 'ખ'}],
            correct_answer='1',
            explanation='ક stands for Kamad',
            points=10,
        )

    def test_quiz_security_correct_answer_hidden(self):
        """CRITICAL SECURITY: Verify correct_answer is NEVER exposed in question list API"""
        res = self.client.get('/api/questions/')
        self.assertEqual(res.status_code, 200)
        raw = res.json()
        data = raw.get('results', []) if isinstance(raw, dict) else raw
        self.assertGreaterEqual(len(data), 1)
        # Verify correct_answer field is absent
        self.assertNotIn('correct_answer', data[0])

    def test_answer_submission_success(self):
        res = self.client.post('/api/questions/submit/', {
            'question_id': self.question.id,
            'selected_answer': '1',
        }, content_type='application/json')
        self.assertEqual(res.status_code, 200)
        json_data = res.json()
        self.assertTrue(json_data['is_correct'])
        self.assertEqual(json_data['points_awarded'], 10)

    def test_answer_submission_wrong(self):
        res = self.client.post('/api/questions/submit/', {
            'question_id': self.question.id,
            'selected_answer': '2',
        }, content_type='application/json')
        self.assertEqual(res.status_code, 200)
        json_data = res.json()
        self.assertFalse(json_data['is_correct'])
        self.assertEqual(json_data['points_awarded'], 0)

    def test_question_validation_catches_invalid_types_and_options(self):
        from questions.validation import validate_question_data
        from django.core.exceptions import ValidationError

        # Invalid type
        valid, errors, _ = validate_question_data({
            'question_type': 'completely-unknown-type',
            'question_text': 'Hello',
            'options': [{'id': '1', 'label': 'A'}],
            'correct_answer': '1',
        })
        self.assertFalse(valid)
        self.assertTrue(any('Invalid question_type' in e for e in errors))

        # Option mismatch
        valid, errors, _ = validate_question_data({
            'question_type': 'missing-letter',
            'question_text': 'Missing letter in word',
            'options': [{'id': '1', 'label': 'A'}, {'id': '2', 'label': 'B'}],
            'correct_answer': '99',
        })
        self.assertFalse(valid)
        self.assertTrue(any('does not match' in e for e in errors))

        # Model clean() raises ValidationError
        bad_q = Question(
            question_type='find-letter',
            question_text='Broken Question',
            options='not-a-list',
            correct_answer='1',
        )
        with self.assertRaises(ValidationError):
            bad_q.clean()


class WrongAnswerLoggingTest(TestCase):
    """Regression: the old ownership check read child.user (no such field) and silently failed."""

    def setUp(self):
        from django.contrib.auth.models import User
        from rest_framework.test import APIClient
        from child_profiles.models import ChildProfile
        self.question = Question.objects.create(
            stable_id='q-log-1', question_text='Pick K', question_type='find-letter', category='gujarati',
            language='gu', options=[{'id': '1', 'label': 'ક'}, {'id': '2', 'label': 'ખ'}], correct_answer='1',
        )
        self.parent = User.objects.create_user(username='log_parent', password='Password123!')
        self.other = User.objects.create_user(username='log_other', password='Password123!')
        self.child = ChildProfile.objects.create(parent=self.parent, nickname='A', age_group='2-4')
        self.other_child = ChildProfile.objects.create(parent=self.other, nickname='B', age_group='2-4')
        self.api = APIClient()

    def _submit(self, child_id):
        return self.api.post('/api/questions/submit/', {
            'question_id': self.question.id, 'selected_answer': '2', 'child_profile_id': child_id,
        }, format='json')

    def test_owner_wrong_answer_is_logged(self):
        from parent_controls.models import WrongAnswerLog
        self.api.force_authenticate(self.parent)
        self.assertEqual(self._submit(self.child.id).status_code, 200)
        self.assertEqual(WrongAnswerLog.objects.filter(child_profile=self.child).count(), 1)

    def test_anonymous_or_foreign_child_is_never_logged(self):
        from parent_controls.models import WrongAnswerLog
        self.assertEqual(self._submit(self.other_child.id).status_code, 200)  # anonymous
        self.api.force_authenticate(self.parent)
        self.assertEqual(self._submit(self.other_child.id).status_code, 200)  # foreign child
        self.assertFalse(WrongAnswerLog.objects.exists())

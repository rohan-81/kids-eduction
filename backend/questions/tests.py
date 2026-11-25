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

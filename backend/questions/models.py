from django.db import models
from django.core.exceptions import ValidationError
from lessons.models import Lesson
from .validation import validate_question_data

class Question(models.Model):
    QUESTION_TYPES = [
        ('find-letter', 'Find the Correct Letter'),
        ('picture-matching', 'Picture Matching'),
        ('counting', 'Counting Game'),
        ('memory-match', 'Memory Match'),
        ('missing-letter', 'Missing Letter'),
        ('colors-shapes', 'Colors & Shapes'),
        ('listen-choose', 'Listen & Choose'),
        ('balloon-pop', 'Balloon Pop'),
        ('math-quiz', 'Math Quiz'),
        ('logic-reasoning', 'Logic Reasoning'),
        ('shadow-match', 'Shadow Match'),
        ('odd-one-out', 'Odd One Out'),
        ('rhyme-match', 'Rhyme Match'),
        ('letter-tracing', 'Letter Tracing'),
        ('picture-puzzle', 'Picture Puzzle'),
        ('find-object', 'Find Object'),
        ('duel', 'Duel Quiz'),
        ('daily-challenge', 'Daily Challenge'),
        ('shop-math', 'Shop Math Game'),
        ('word-builder', 'Word Builder'),
        ('adventure', 'Adventure Level Question'),
        ('quiz', 'General Quiz'),
    ]

    AGE_GROUP_CHOICES = [
        ('2-4', 'Ages 2–4'),
        ('4-6', 'Ages 4–6'),
        ('6-8', 'Ages 6–8'),
        ('all', 'All Ages'),
    ]

    stable_id = models.CharField(max_length=120, unique=True, null=True, blank=True, db_index=True)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='questions', null=True, blank=True)
    category = models.CharField(max_length=60, default='general', db_index=True)
    language = models.CharField(max_length=10, default='gu', db_index=True)
    age_group = models.CharField(max_length=10, choices=AGE_GROUP_CHOICES, default='all', db_index=True)
    question_text = models.CharField(max_length=255)
    audio_text = models.CharField(max_length=255, blank=True)
    display_visual = models.CharField(max_length=255, blank=True)
    count_target = models.PositiveSmallIntegerField(null=True, blank=True)
    question_type = models.CharField(max_length=40, choices=QUESTION_TYPES, default='find-letter', db_index=True)
    options = models.JSONField(help_text="List of choices: [{'id': '1', 'label': 'A', 'image': '...'}]")
    correct_answer = models.CharField(max_length=100, help_text="Correct option id or value")
    correct_option_id = models.CharField(max_length=50, blank=True, help_text="Option id matching correct answer for client games")
    explanation = models.CharField(max_length=255, blank=True)
    hint = models.CharField(max_length=255, blank=True)
    image = models.CharField(max_length=255, blank=True)
    audio = models.CharField(max_length=255, blank=True)
    difficulty = models.PositiveSmallIntegerField(default=1)
    points = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def clean(self):
        super().clean()
        data = {
            'question_type': self.question_type,
            'language': self.language,
            'age_group': self.age_group,
            'question_text': self.question_text,
            'options': self.options,
            'correct_answer': self.correct_answer,
            'correct_option_id': self.correct_option_id,
            'image': self.image,
            'audio': self.audio,
            'difficulty': self.difficulty,
            'points': self.points,
        }
        is_valid, errors, sanitized = validate_question_data(data)
        if not is_valid:
            raise ValidationError({'options': errors})

        # Apply sanitized fields to avoid data discrepancies
        self.options = sanitized['options']
        self.correct_answer = sanitized['correct_answer']
        self.correct_option_id = sanitized['correct_option_id']
        self.age_group = sanitized['age_group']

    def __str__(self):
        return f"[{self.question_type}] {self.question_text[:40]}"

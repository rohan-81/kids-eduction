from django.db import models
from django.utils import timezone
from child_profiles.models import ChildProfile
from lessons.models import Lesson

class LessonProgress(models.Model):
    child_profile = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='lesson_progress', null=True, blank=True)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress', null=True, blank=True)
    lesson_slug = models.CharField(max_length=120, blank=True, db_index=True, help_text="Frontend lesson ID or slug")
    completed = models.BooleanField(default=True)
    stars = models.PositiveSmallIntegerField(default=3)
    best_score = models.IntegerField(default=1)
    times_played = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        unique_together = ('child_profile', 'lesson_slug')

    def __str__(self):
        title = self.lesson.title if self.lesson else self.lesson_slug
        return f"{self.child_profile}: {title} ({self.stars}★)"


class GameResult(models.Model):
    child_profile = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='game_results', null=True, blank=True)
    game_type = models.CharField(max_length=60, db_index=True)
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=5)
    time_spent_seconds = models.PositiveIntegerField(default=0)
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-played_at']

    def __str__(self):
        return f"{self.game_type}: {self.score}/{self.total_questions} ({self.child_profile})"


class DailyActivity(models.Model):
    child_profile = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='daily_activities')
    date = models.DateField(db_index=True)
    lessons_completed = models.PositiveIntegerField(default=0)
    games_played = models.PositiveIntegerField(default=0)
    minutes_active = models.PositiveIntegerField(default=0)
    stars_earned = models.PositiveIntegerField(default=0)
    coins_earned = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        unique_together = ('child_profile', 'date')

    def __str__(self):
        return f"{self.child_profile} on {self.date}: {self.minutes_active}m active"

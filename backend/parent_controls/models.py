from django.db import models
from child_profiles.models import ChildProfile

class ScreenTimeSetting(models.Model):
    child_profile = models.OneToOneField(ChildProfile, on_delete=models.CASCADE, related_name='screen_time_setting')
    daily_limit_minutes = models.PositiveIntegerField(default=60)
    session_limit_minutes = models.PositiveIntegerField(default=30)
    bedtime_start = models.TimeField(null=True, blank=True)
    bedtime_end = models.TimeField(null=True, blank=True)
    is_enabled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.child_profile.nickname}'s Limits: {self.daily_limit_minutes}m daily ({'Active' if self.is_enabled else 'Disabled'})"


class ScreenTimeLog(models.Model):
    child_profile = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='screen_time_logs')
    date = models.DateField(db_index=True)
    minutes_used = models.PositiveIntegerField(default=0)
    session_count = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        unique_together = ('child_profile', 'date')

    def __str__(self):
        return f"{self.child_profile} on {self.date}: {self.minutes_used}m used"


class WrongAnswerLog(models.Model):
    child_profile = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='wrong_answers')
    question_text = models.CharField(max_length=255)
    user_answer = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=255)
    category = models.CharField(max_length=60, blank=True)
    game_type = models.CharField(max_length=60, blank=True)
    reviewed = models.BooleanField(default=False)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-logged_at']

    def __str__(self):
        return f"{self.child_profile} wrong in {self.game_type or self.category}: {self.question_text[:30]}"

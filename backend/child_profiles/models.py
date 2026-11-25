from django.db import models
from django.contrib.auth.models import User

class ChildProfile(models.Model):
    AGE_GROUP_CHOICES = [
        ('2-4', 'Ages 2–4'),
        ('4-6', 'Ages 4–6'),
        ('6-8', 'Ages 6–8'),
        ('all', 'All Ages'),
    ]

    LANGUAGE_CHOICES = [
        ('gu', 'Gujarati'),
        ('en', 'English'),
        ('hi', 'Hindi'),
    ]

    parent = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='child_profiles')
    nickname = models.CharField(max_length=60, default='Little Learner')
    age_group = models.CharField(max_length=10, choices=AGE_GROUP_CHOICES, default='2-4')
    avatar = models.CharField(max_length=60, default='fox')
    gender = models.CharField(max_length=20, blank=True)
    language_preference = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='gu')
    daily_goal_minutes = models.PositiveIntegerField(default=20)
    pin_code = models.CharField(max_length=10, blank=True, help_text="Optional parental or profile PIN")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.nickname} ({self.age_group}) - Parent: {self.parent.username if self.parent else 'Guest'}"

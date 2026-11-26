from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password

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
    # Stored as a Django password hash (never plaintext); see ChildProfileSerializer.validate_pin_code.
    pin_code = models.CharField(max_length=128, blank=True, help_text="Hashed optional parental or profile PIN")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    @property
    def has_pin(self) -> bool:
        return bool(self.pin_code)

    def check_pin(self, raw_pin: str) -> bool:
        return bool(self.pin_code) and check_password(str(raw_pin or ''), self.pin_code)

    def __str__(self):
        return f"{self.nickname} ({self.age_group}) - Parent: {self.parent.username if self.parent else 'Guest'}"

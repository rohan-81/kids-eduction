from django.db import models
from child_profiles.models import ChildProfile

class Badge(models.Model):
    slug = models.SlugField(max_length=60, primary_key=True)
    title = models.CharField(max_length=120)
    name_gu = models.CharField(max_length=120, blank=True)
    name_hi = models.CharField(max_length=120, blank=True)
    name_en = models.CharField(max_length=120, blank=True)
    description = models.CharField(max_length=255, blank=True)
    desc_gu = models.CharField(max_length=255, blank=True)
    desc_hi = models.CharField(max_length=255, blank=True)
    desc_en = models.CharField(max_length=255, blank=True)
    req_gu = models.CharField(max_length=255, blank=True)
    req_hi = models.CharField(max_length=255, blank=True)
    req_en = models.CharField(max_length=255, blank=True)
    icon = models.CharField(max_length=50, default='🏆')
    reward_coins = models.PositiveIntegerField(default=20)
    category = models.CharField(max_length=60, default='general')
    requirement_type = models.CharField(max_length=60, default='lessons_count')
    requirement_value = models.IntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'slug']

    def __str__(self):
        return f"{self.icon} {self.title}"


class Sticker(models.Model):
    """Collectible sticker shown in the Sticker Album (app/stickers.tsx)."""
    slug = models.SlugField(max_length=60, primary_key=True)
    emoji = models.CharField(max_length=16)
    category = models.CharField(max_length=40, default='animals', db_index=True)
    name_en = models.CharField(max_length=120)
    name_gu = models.CharField(max_length=120, blank=True)
    name_hi = models.CharField(max_length=120, blank=True)
    default_unlocked = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'slug']

    def __str__(self):
        return f"{self.emoji} {self.name_en}"


class Reward(models.Model):
    child_profile = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='rewards', null=True, blank=True)
    badge = models.ForeignKey(Badge, on_delete=models.SET_NULL, null=True, blank=True)
    reward_type = models.CharField(max_length=60, default='badge')
    title = models.CharField(max_length=120)
    icon = models.CharField(max_length=50, default='⭐')
    points = models.IntegerField(default=10)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.reward_type}: {self.title} ({self.child_profile})"

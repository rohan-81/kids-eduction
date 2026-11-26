from django.db import models
from child_profiles.models import ChildProfile

class AdventureLevel(models.Model):
    level_number = models.PositiveIntegerField(primary_key=True)
    world_name = models.CharField(max_length=60, default='World 1')
    title = models.CharField(max_length=120)
    required_stars = models.PositiveIntegerField(default=0)
    reward_coins = models.PositiveIntegerField(default=10)
    reward_stars = models.PositiveIntegerField(default=3)
    questions_data = models.JSONField(default=list, blank=True, help_text="Level-specific challenges or question list")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['level_number']

    def __str__(self):
        return f"Level {self.level_number}: {self.title} ({self.world_name})"


class ChildAdventureProgress(models.Model):
    child_profile = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='adventure_progress')
    level = models.ForeignKey(AdventureLevel, on_delete=models.CASCADE, related_name='player_progress')
    completed = models.BooleanField(default=False)
    stars_earned = models.PositiveSmallIntegerField(default=0)
    unlocked = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['level__level_number']
        unique_together = ('child_profile', 'level')

    def __str__(self):
        return f"{self.child_profile} - Level {self.level.level_number}: {self.stars_earned}★"


class ChildWallet(models.Model):
    child_profile = models.OneToOneField(ChildProfile, on_delete=models.CASCADE, related_name='wallet')
    total_coins = models.PositiveIntegerField(default=0)
    total_stars = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.child_profile.nickname}'s Wallet: {self.total_coins} Coins, {self.total_stars} Stars"


class CoinTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('lesson_reward', 'Lesson Completion Reward'),
        ('game_reward', 'Game Victory Reward'),
        ('shop_purchase', 'Shop Purchase'),
        ('device_spend', 'In-App Spending (synced)'),
        ('lucky_spin', 'Lucky Wheel Spin'),
        ('daily_streak', 'Daily Streak Bonus'),
        ('adventure_reward', 'Adventure Level Reward'),
        ('manual_adjustment', 'Parent or Admin Adjustment'),
    ]

    child_profile = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='coin_transactions')
    amount = models.IntegerField(help_text="Positive for addition, negative for deduction")
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES, default='lesson_reward')
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.child_profile}: {self.amount:+d} coins ({self.transaction_type})"


class DailyStreak(models.Model):
    child_profile = models.OneToOneField(ChildProfile, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.child_profile.nickname}: {self.current_streak} days streak"


class LuckySpinHistory(models.Model):
    child_profile = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='spin_history')
    prize_type = models.CharField(max_length=50, default='coins')
    prize_value = models.PositiveIntegerField(default=0)
    spun_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-spun_at']

    def __str__(self):
        return f"{self.child_profile}: Won {self.prize_value} {self.prize_type}"

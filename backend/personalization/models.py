from django.db import models
from child_profiles.models import ChildProfile

class AvatarItem(models.Model):
    ITEM_TYPES = [
        ('hat', 'Hat'),
        ('glasses', 'Glasses'),
        ('outfit', 'Outfit'),
        ('backpack', 'Backpack'),
        ('accessory', 'Accessory'),
    ]

    item_id = models.SlugField(max_length=60, primary_key=True)
    name = models.CharField(max_length=120)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES, default='hat')
    icon = models.CharField(max_length=50, default='🧢')
    price_coins = models.PositiveIntegerField(default=50)
    is_premium = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['item_type', 'price_coins']

    def __str__(self):
        return f"{self.icon} {self.name} ({self.item_type}) - {self.price_coins} Coins"


class ChildAvatar(models.Model):
    child_profile = models.OneToOneField(ChildProfile, on_delete=models.CASCADE, related_name='avatar_state')
    base_avatar = models.CharField(max_length=50, default='fox')
    equipped_hat = models.CharField(max_length=60, blank=True)
    equipped_glasses = models.CharField(max_length=60, blank=True)
    equipped_outfit = models.CharField(max_length=60, blank=True)
    equipped_backpack = models.CharField(max_length=60, blank=True)
    unlocked_items = models.JSONField(default=list, blank=True, help_text="List of unlocked AvatarItem item_ids")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.child_profile.nickname}'s Avatar ({self.base_avatar})"


class GardenPlant(models.Model):
    STAGE_CHOICES = [
        ('seed', 'Seed'),
        ('sprout', 'Sprout'),
        ('seedling', 'Seedling'),
        ('blooming', 'Blooming'),
        ('harvested', 'Harvested'),
    ]

    child_profile = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='garden_plants')
    slot_index = models.PositiveSmallIntegerField(default=0)
    plant_type = models.CharField(max_length=50, default='sunflower')
    stage = models.CharField(max_length=30, choices=STAGE_CHOICES, default='seed')
    water_count = models.PositiveIntegerField(default=0)
    sun_count = models.PositiveIntegerField(default=0)
    last_watered = models.DateTimeField(null=True, blank=True)
    planted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['child_profile', 'slot_index']
        unique_together = ('child_profile', 'slot_index')

    def __str__(self):
        return f"{self.child_profile} Slot {self.slot_index}: {self.plant_type} ({self.stage})"

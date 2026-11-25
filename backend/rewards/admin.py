from django.contrib import admin
from .models import Badge, Reward, Sticker


@admin.register(Sticker)
class StickerAdmin(admin.ModelAdmin):
    list_display = ('order', 'slug', 'emoji', 'name_en', 'name_gu', 'name_hi', 'category', 'default_unlocked', 'is_active')
    list_editable = ('default_unlocked', 'is_active')
    search_fields = ('slug', 'name_en', 'name_gu', 'name_hi')
    list_filter = ('category', 'default_unlocked', 'is_active')
    ordering = ('order', 'slug')

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('order', 'slug', 'title', 'name_gu', 'name_hi', 'icon', 'reward_coins', 'is_active')
    search_fields = ('slug', 'title', 'name_gu', 'name_hi', 'name_en', 'description')
    list_filter = ('category', 'is_active')
    ordering = ('order', 'slug')

@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'reward_type', 'title', 'icon', 'points', 'earned_at')
    list_filter = ('reward_type',)
    search_fields = ('title', 'child_profile__nickname')

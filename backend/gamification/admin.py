from django.contrib import admin
from .models import AdventureLevel, ChildAdventureProgress, ChildWallet, CoinTransaction, DailyStreak, LuckySpinHistory

@admin.register(AdventureLevel)
class AdventureLevelAdmin(admin.ModelAdmin):
    list_display = ('level_number', 'world_name', 'title', 'required_stars', 'reward_coins', 'reward_stars', 'is_active')
    search_fields = ('title', 'world_name')
    list_filter = ('world_name', 'is_active')

@admin.register(ChildAdventureProgress)
class ChildAdventureProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'level', 'stars_earned', 'completed', 'unlocked', 'updated_at')
    list_filter = ('completed', 'unlocked')
    search_fields = ('child_profile__nickname',)

@admin.register(ChildWallet)
class ChildWalletAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'total_coins', 'total_stars', 'updated_at')
    search_fields = ('child_profile__nickname',)

@admin.register(CoinTransaction)
class CoinTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'amount', 'transaction_type', 'description', 'created_at')
    list_filter = ('transaction_type',)
    search_fields = ('child_profile__nickname', 'description')

@admin.register(DailyStreak)
class DailyStreakAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'current_streak', 'longest_streak', 'last_active_date', 'updated_at')
    search_fields = ('child_profile__nickname',)

@admin.register(LuckySpinHistory)
class LuckySpinHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'prize_type', 'prize_value', 'spun_at')
    list_filter = ('prize_type',)
    search_fields = ('child_profile__nickname',)

from rest_framework import serializers
from .models import AdventureLevel, ChildAdventureProgress, ChildWallet, CoinTransaction, DailyStreak, LuckySpinHistory

class AdventureLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdventureLevel
        fields = [
            'level_number',
            'world_name',
            'title',
            'required_stars',
            'reward_coins',
            'reward_stars',
            'questions_data',
            'is_active',
        ]


class ChildAdventureProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildAdventureProgress
        fields = [
            'id',
            'child_profile',
            'level',
            'completed',
            'stars_earned',
            'unlocked',
            'updated_at',
        ]


class ChildWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildWallet
        fields = [
            'child_profile',
            'total_coins',
            'total_stars',
            'updated_at',
        ]
        read_only_fields = ['total_coins', 'total_stars', 'updated_at']


class CoinTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoinTransaction
        fields = [
            'id',
            'child_profile',
            'amount',
            'transaction_type',
            'description',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class DailyStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStreak
        fields = [
            'child_profile',
            'current_streak',
            'longest_streak',
            'last_active_date',
            'updated_at',
        ]


class LuckySpinHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LuckySpinHistory
        fields = [
            'id',
            'child_profile',
            'prize_type',
            'prize_value',
            'spun_at',
        ]
        read_only_fields = ['id', 'spun_at']

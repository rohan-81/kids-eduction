from rest_framework import serializers
from .models import Badge, Reward, Sticker


class StickerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sticker
        fields = [
            'slug',
            'emoji',
            'category',
            'name_en',
            'name_gu',
            'name_hi',
            'default_unlocked',
            'order',
            'is_active',
        ]

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = [
            'slug',
            'title',
            'name_gu',
            'name_hi',
            'name_en',
            'description',
            'desc_gu',
            'desc_hi',
            'desc_en',
            'req_gu',
            'req_hi',
            'req_en',
            'icon',
            'reward_coins',
            'category',
            'requirement_type',
            'requirement_value',
            'order',
            'is_active',
        ]


class RewardSerializer(serializers.ModelSerializer):
    badge_details = BadgeSerializer(source='badge', read_only=True)

    class Meta:
        model = Reward
        fields = [
            'id',
            'child_profile',
            'badge',
            'badge_details',
            'reward_type',
            'title',
            'icon',
            'points',
            'earned_at',
        ]
        read_only_fields = ['id', 'earned_at']

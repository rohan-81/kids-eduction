from rest_framework import serializers
from .models import ChildProfile

class ChildProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildProfile
        fields = [
            'id',
            'nickname',
            'age_group',
            'avatar',
            'gender',
            'language_preference',
            'daily_goal_minutes',
            'pin_code',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

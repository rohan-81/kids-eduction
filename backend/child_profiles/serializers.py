import re
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import ChildProfile


class ChildProfileSerializer(serializers.ModelSerializer):
    # The PIN is write-only and hashed; clients only ever learn whether one is set.
    pin_code = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=8)
    has_pin = serializers.BooleanField(read_only=True)

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
            'has_pin',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_pin_code(self, value):
        raw = (value or '').strip()
        if not raw:
            return ''  # blank clears the PIN
        if not re.fullmatch(r'\d{4,8}', raw):
            raise serializers.ValidationError('PIN must be 4 to 8 digits.')
        return make_password(raw)

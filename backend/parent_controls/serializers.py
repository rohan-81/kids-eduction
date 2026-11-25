from rest_framework import serializers
from .models import ScreenTimeSetting, ScreenTimeLog, WrongAnswerLog

class ScreenTimeSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreenTimeSetting
        fields = [
            'child_profile',
            'daily_limit_minutes',
            'session_limit_minutes',
            'bedtime_start',
            'bedtime_end',
            'is_enabled',
        ]


class ScreenTimeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreenTimeLog
        fields = [
            'id',
            'child_profile',
            'date',
            'minutes_used',
            'session_count',
            'updated_at',
        ]


class WrongAnswerLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WrongAnswerLog
        fields = [
            'id',
            'child_profile',
            'question_text',
            'user_answer',
            'correct_answer',
            'category',
            'game_type',
            'reviewed',
            'logged_at',
        ]

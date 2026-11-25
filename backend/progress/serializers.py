from rest_framework import serializers
from .models import LessonProgress, GameResult, DailyActivity

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = [
            'id',
            'child_profile',
            'lesson',
            'lesson_slug',
            'completed',
            'stars',
            'best_score',
            'times_played',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GameResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameResult
        fields = [
            'id',
            'child_profile',
            'game_type',
            'score',
            'total_questions',
            'time_spent_seconds',
            'played_at',
        ]
        read_only_fields = ['id', 'played_at']


class DailyActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyActivity
        fields = [
            'id',
            'child_profile',
            'date',
            'lessons_completed',
            'games_played',
            'minutes_active',
            'stars_earned',
            'coins_earned',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

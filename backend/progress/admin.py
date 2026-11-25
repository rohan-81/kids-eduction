from django.contrib import admin
from .models import LessonProgress, GameResult, DailyActivity

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'lesson_slug', 'completed', 'stars', 'best_score', 'times_played', 'updated_at')
    list_filter = ('completed', 'stars')
    search_fields = ('child_profile__nickname', 'lesson_slug')

@admin.register(GameResult)
class GameResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'game_type', 'score', 'total_questions', 'time_spent_seconds', 'played_at')
    list_filter = ('game_type',)
    search_fields = ('child_profile__nickname', 'game_type')

@admin.register(DailyActivity)
class DailyActivityAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'date', 'lessons_completed', 'games_played', 'minutes_active', 'stars_earned', 'coins_earned')
    list_filter = ('date',)
    search_fields = ('child_profile__nickname',)

from django.contrib import admin
from .models import ScreenTimeSetting, ScreenTimeLog, WrongAnswerLog

@admin.register(ScreenTimeSetting)
class ScreenTimeSettingAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'daily_limit_minutes', 'session_limit_minutes', 'bedtime_start', 'bedtime_end', 'is_enabled')
    list_filter = ('is_enabled',)
    search_fields = ('child_profile__nickname',)

@admin.register(ScreenTimeLog)
class ScreenTimeLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'date', 'minutes_used', 'session_count', 'updated_at')
    list_filter = ('date',)
    search_fields = ('child_profile__nickname',)

@admin.register(WrongAnswerLog)
class WrongAnswerLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'child_profile', 'game_type', 'category', 'question_text', 'user_answer', 'correct_answer', 'reviewed', 'logged_at')
    list_filter = ('game_type', 'category', 'reviewed')
    search_fields = ('child_profile__nickname', 'question_text')

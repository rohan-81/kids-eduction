from django.contrib import admin
from .models import ChildProfile

@admin.register(ChildProfile)
class ChildProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'nickname', 'parent', 'age_group', 'avatar', 'language_preference', 'daily_goal_minutes', 'is_active', 'created_at')
    list_filter = ('age_group', 'language_preference', 'is_active')
    search_fields = ('nickname', 'parent__username', 'parent__email')
    ordering = ('id',)

from django.contrib import admin
from .models import Story, StoryScene

class StorySceneInline(admin.StackedInline):
    model = StoryScene
    extra = 1

@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ('slug', 'title', 'title_gujarati', 'title_hindi', 'category', 'reading_time_mins', 'order', 'is_active')
    search_fields = ('slug', 'title', 'title_gujarati', 'title_hindi', 'moral')
    list_filter = ('category', 'is_active')
    inlines = [StorySceneInline]

@admin.register(StoryScene)
class StorySceneAdmin(admin.ModelAdmin):
    list_display = ('id', 'story', 'scene_number')
    list_filter = ('story',)

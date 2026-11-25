from django.contrib import admin
from .models import Rhyme

@admin.register(Rhyme)
class RhymeAdmin(admin.ModelAdmin):
    list_display = ('slug', 'title', 'title_gujarati', 'title_hindi', 'category', 'duration_seconds', 'order', 'is_active')
    search_fields = ('slug', 'title', 'title_gujarati', 'title_hindi', 'lyrics_english')
    list_filter = ('category', 'is_active')

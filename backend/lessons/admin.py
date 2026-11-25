from django.contrib import admin
from .models import Category, Lesson, CharacterAsset

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('slug', 'title', 'title_gujarati', 'title_hindi', 'icon', 'order', 'is_active')
    search_fields = ('slug', 'title', 'title_gujarati', 'title_hindi')
    list_filter = ('is_active',)
    ordering = ('order', 'slug')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('id', 'stable_id', 'title', 'category', 'language', 'age_group', 'difficulty', 'symbol', 'is_active')
    list_filter = ('category', 'language', 'age_group', 'difficulty', 'is_active')
    search_fields = ('title', 'stable_id', 'example_word', 'symbol', 'subtitle')
    ordering = ('order', 'id')


@admin.register(CharacterAsset)
class CharacterAssetAdmin(admin.ModelAdmin):
    list_display = ('asset_key', 'title', 'category', 'width', 'height', 'is_active', 'updated_at')
    list_filter = ('category', 'is_active')
    search_fields = ('asset_key', 'title')
    ordering = ('asset_key',)

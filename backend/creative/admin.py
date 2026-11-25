from django.contrib import admin
from .models import ColoringTemplate, Worksheet

@admin.register(ColoringTemplate)
class ColoringTemplateAdmin(admin.ModelAdmin):
    list_display = ('slug', 'title', 'category', 'difficulty', 'default_color', 'order', 'is_active')
    search_fields = ('slug', 'title', 'category')
    list_filter = ('category', 'difficulty', 'is_active')

@admin.register(Worksheet)
class WorksheetAdmin(admin.ModelAdmin):
    list_display = ('slug', 'title', 'category', 'grade_level', 'is_active')
    search_fields = ('slug', 'title', 'category')
    list_filter = ('category', 'grade_level', 'is_active')

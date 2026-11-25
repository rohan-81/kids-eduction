from django.contrib import admin
from .models import Question

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'stable_id', 'question_type', 'category', 'language', 'question_text', 'correct_answer', 'is_active')
    list_filter = ('question_type', 'category', 'language', 'difficulty', 'is_active')
    search_fields = ('question_text', 'stable_id', 'correct_answer', 'explanation')
    ordering = ('id',)

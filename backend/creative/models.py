from django.db import models

class ColoringTemplate(models.Model):
    slug = models.SlugField(max_length=100, primary_key=True)
    title = models.CharField(max_length=120)
    category = models.CharField(max_length=60, default='animals', db_index=True)
    svg_path = models.TextField(help_text="SVG path or vector drawing commands")
    view_box = models.CharField(max_length=50, default='0 0 200 200')
    thumbnail = models.CharField(max_length=255, blank=True)
    difficulty = models.PositiveSmallIntegerField(default=1)
    default_color = models.CharField(max_length=30, blank=True)
    palette = models.JSONField(default=list, blank=True, help_text="Suggested colors: ['#FF5722', '#4CAF50']")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'slug']

    def __str__(self):
        return f"{self.title} ({self.category})"


class Worksheet(models.Model):
    slug = models.SlugField(max_length=100, primary_key=True)
    title = models.CharField(max_length=120)
    category = models.CharField(max_length=60, default='alphabet', db_index=True)
    grade_level = models.CharField(max_length=20, default='nursery')
    image_url = models.CharField(max_length=255, blank=True)
    pdf_url = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['slug']

    def __str__(self):
        return f"{self.title} - {self.grade_level}"

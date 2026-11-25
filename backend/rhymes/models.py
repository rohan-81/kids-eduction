from django.db import models

class Rhyme(models.Model):
    slug = models.SlugField(max_length=100, primary_key=True)
    title = models.CharField(max_length=150)
    title_gujarati = models.CharField(max_length=150, blank=True)
    title_hindi = models.CharField(max_length=150, blank=True)
    category = models.CharField(max_length=60, default='nursery', db_index=True)
    lyrics_english = models.TextField(blank=True)
    lyrics_gujarati = models.TextField(blank=True)
    lyrics_hindi = models.TextField(blank=True)
    audio_url = models.CharField(max_length=255, blank=True)
    video_url = models.CharField(max_length=255, blank=True)
    cover_image = models.CharField(max_length=255, blank=True)
    duration_seconds = models.PositiveIntegerField(default=120)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'slug']

    def __str__(self):
        return f"{self.title} ({self.slug})"

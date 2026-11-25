from django.db import models

class Story(models.Model):
    slug = models.SlugField(max_length=100, primary_key=True)
    title = models.CharField(max_length=150)
    title_gujarati = models.CharField(max_length=150, blank=True)
    title_hindi = models.CharField(max_length=150, blank=True)
    category = models.CharField(max_length=60, default='moral', db_index=True)
    moral = models.CharField(max_length=255, blank=True)
    moral_gujarati = models.CharField(max_length=255, blank=True)
    moral_hindi = models.CharField(max_length=255, blank=True)
    cover_image = models.CharField(max_length=255, blank=True)
    reading_time_mins = models.PositiveSmallIntegerField(default=3)
    age_group = models.CharField(max_length=10, default='all')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'slug']
        verbose_name_plural = 'Stories'

    def __str__(self):
        return f"{self.title} ({self.slug})"


class StoryScene(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='scenes')
    scene_number = models.PositiveSmallIntegerField(default=1)
    text_english = models.TextField(blank=True)
    text_gujarati = models.TextField(blank=True)
    text_hindi = models.TextField(blank=True)
    illustration = models.CharField(max_length=255, blank=True)
    audio_prompt = models.CharField(max_length=255, blank=True)
    choices = models.JSONField(default=list, blank=True, help_text="Interactive choices: [{'text': '...', 'next_scene': 2}]")

    class Meta:
        ordering = ['story', 'scene_number']
        unique_together = ('story', 'scene_number')

    def __str__(self):
        return f"{self.story.slug} - Scene {self.scene_number}"

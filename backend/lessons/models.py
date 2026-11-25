from django.db import models

class Category(models.Model):
    slug = models.SlugField(max_length=60, primary_key=True)
    title = models.CharField(max_length=120)
    title_gujarati = models.CharField(max_length=120, blank=True)
    title_hindi = models.CharField(max_length=120, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=30, blank=True)
    gradient_start = models.CharField(max_length=30, blank=True)
    gradient_end = models.CharField(max_length=30, blank=True)
    description = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'slug']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.title} ({self.slug})"


class Lesson(models.Model):
    LANGUAGE_CHOICES = [
        ('gu', 'Gujarati'),
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('all', 'Universal'),
    ]

    AGE_GROUP_CHOICES = [
        ('2-4', 'Ages 2–4'),
        ('4-6', 'Ages 4–6'),
        ('6-8', 'Ages 6–8'),
        ('all', 'All Ages'),
    ]

    stable_id = models.CharField(max_length=120, unique=True, null=True, blank=True, db_index=True)
    title = models.CharField(max_length=120)
    category = models.CharField(max_length=60, db_index=True)
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='gu', db_index=True)
    age_group = models.CharField(max_length=10, choices=AGE_GROUP_CHOICES, default='2-4', db_index=True)
    difficulty = models.PositiveSmallIntegerField(default=1)
    symbol = models.CharField(max_length=20, default='★')
    subtitle = models.CharField(max_length=120, blank=True)
    phonetic = models.CharField(max_length=60, blank=True)
    example_word = models.CharField(max_length=100, blank=True)
    example_meaning = models.CharField(max_length=120, blank=True)
    example_image = models.CharField(max_length=255, blank=True)
    audio_prompt = models.CharField(max_length=200, blank=True)
    visual_color = models.CharField(max_length=30, blank=True)
    tracing_path = models.TextField(blank=True, help_text="Stroke coordinates or SVG outline")
    words = models.JSONField(default=list, blank=True, help_text="Vocabulary items")
    rhyme_text = models.TextField(blank=True)
    lesson_data = models.JSONField(default=dict, blank=True, help_text="Flexible extra properties")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.title} ({self.category} - {self.language})"


class CharacterAsset(models.Model):
    """
    A shared 3D Pixar/clay render (e.g. 3d_lion) served from MEDIA_ROOT/characters/.

    The app resolves renders by `asset_key` (the file stem), so one image can back many
    lessons, rhymes and story characters. Lessons that use a render also carry its media
    path in `Lesson.example_image` (set by scripts/migrate_assets_to_db.py).
    """

    asset_key = models.SlugField(max_length=80, unique=True, help_text="File stem, e.g. '3d_lion'")
    title = models.CharField(max_length=120, blank=True)
    image_file = models.ImageField(upload_to='characters/', max_length=255)
    category = models.CharField(max_length=40, blank=True, db_index=True, help_text="animals, nature, extra, rhymes...")
    tags = models.JSONField(default=list, blank=True, help_text="Lesson ids / emoji this render is used for")
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['asset_key']

    def __str__(self):
        return self.asset_key

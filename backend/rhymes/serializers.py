from rest_framework import serializers
from .models import Rhyme
from lessons.serializers import AbsoluteMediaUrlMixin

class RhymeSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    absolute_media_fields = ('cover_image', 'audio_url')

    class Meta:
        model = Rhyme
        fields = [
            'slug',
            'title',
            'title_gujarati',
            'title_hindi',
            'category',
            'lyrics_english',
            'lyrics_gujarati',
            'lyrics_hindi',
            'audio_url',
            'video_url',
            'cover_image',
            'duration_seconds',
            'order',
            'is_active',
        ]

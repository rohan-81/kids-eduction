from rest_framework import serializers
from .models import Story, StoryScene
from lessons.serializers import AbsoluteMediaUrlMixin

class StorySceneSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    absolute_media_fields = ('illustration',)

    class Meta:
        model = StoryScene
        fields = [
            'scene_number',
            'text_english',
            'text_gujarati',
            'text_hindi',
            'illustration',
            'audio_prompt',
            'choices',
        ]


class StorySerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    absolute_media_fields = ('cover_image',)
    scenes = StorySceneSerializer(many=True, read_only=True)

    class Meta:
        model = Story
        fields = [
            'slug',
            'title',
            'title_gujarati',
            'title_hindi',
            'category',
            'moral',
            'moral_gujarati',
            'moral_hindi',
            'cover_image',
            'reading_time_mins',
            'age_group',
            'order',
            'is_active',
            'scenes',
        ]

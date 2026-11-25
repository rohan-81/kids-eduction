from rest_framework import serializers
from .models import Category, Lesson, CharacterAsset
from .media_urls import absolute_media_url


class AbsoluteMediaUrlMixin:
    """
    Rewrites the listed CharField media paths (e.g. 'characters/3d_lion.webp' or
    '/media/characters/3d_lion.webp') into absolute URLs using the current request,
    so the app can load them directly. Values that are already absolute (https://...)
    are returned unchanged.
    """

    absolute_media_fields: tuple = ()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        for field in self.absolute_media_fields:
            if data.get(field):
                data[field] = absolute_media_url(data[field], request)
        return data


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'slug',
            'title',
            'title_gujarati',
            'title_hindi',
            'icon',
            'color',
            'gradient_start',
            'gradient_end',
            'description',
            'order',
            'is_active',
        ]


class LessonSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    absolute_media_fields = ('example_image',)

    class Meta:
        model = Lesson
        fields = [
            'id',
            'stable_id',
            'title',
            'category',
            'language',
            'age_group',
            'difficulty',
            'symbol',
            'subtitle',
            'phonetic',
            'example_word',
            'example_meaning',
            'example_image',
            'audio_prompt',
            'visual_color',
            'tracing_path',
            'words',
            'rhyme_text',
            'lesson_data',
            'order',
            'is_active',
            'created_at',
        ]


class CharacterAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = CharacterAsset
        fields = ['asset_key', 'title', 'category', 'tags', 'width', 'height', 'url', 'updated_at']

    def get_url(self, obj):
        if not obj.image_file:
            return ''
        return absolute_media_url(obj.image_file.url, self.context.get('request'))

from rest_framework import serializers
from lessons.serializers import AbsoluteMediaUrlMixin
from .models import ColoringTemplate, Worksheet


class ColoringTemplateSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    absolute_media_fields = ('thumbnail',)

    class Meta:
        model = ColoringTemplate
        fields = [
            'slug',
            'title',
            'category',
            'svg_path',
            'view_box',
            'thumbnail',
            'difficulty',
            'default_color',
            'palette',
            'order',
            'is_active',
        ]


class WorksheetSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    absolute_media_fields = ('image_url', 'pdf_url')

    class Meta:
        model = Worksheet
        fields = [
            'slug',
            'title',
            'category',
            'grade_level',
            'image_url',
            'pdf_url',
            'is_active',
        ]

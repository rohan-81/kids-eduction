from rest_framework import serializers
from .models import ColoringTemplate, Worksheet

class ColoringTemplateSerializer(serializers.ModelSerializer):
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


class WorksheetSerializer(serializers.ModelSerializer):
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

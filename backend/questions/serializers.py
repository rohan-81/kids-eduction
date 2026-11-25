from rest_framework import serializers
from .models import Question

class QuestionSerializer(serializers.ModelSerializer):
    """
    Public student serializer. Strictly excludes correct_answer to prevent client-side inspection.
    """
    class Meta:
        model = Question
        fields = [
            'id',
            'stable_id',
            'lesson',
            'category',
            'language',
            'age_group',
            'question_text',
            'question_type',
            'audio_text',
            'display_visual',
            'count_target',
            'options',
            'explanation',
            'hint',
            'image',
            'audio',
            'difficulty',
            'points',
        ]


class GameQuestionSerializer(serializers.ModelSerializer):
    """
    Game runner serializer. Includes correct_option_id for instant tactile feedback on device.
    """
    class Meta:
        model = Question
        fields = [
            'id',
            'stable_id',
            'category',
            'language',
            'age_group',
            'question_text',
            'question_type',
            'audio_text',
            'display_visual',
            'count_target',
            'options',
            'correct_option_id',
            'hint',
            'image',
            'audio',
            'difficulty',
            'points',
        ]


class AnswerSubmissionSerializer(serializers.Serializer):
    question_id = serializers.CharField(required=True)
    selected_answer = serializers.CharField(required=True)
    child_profile_id = serializers.IntegerField(required=False, allow_null=True)

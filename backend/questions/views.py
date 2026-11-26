from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Question
from .serializers import QuestionSerializer, GameQuestionSerializer, AnswerSubmissionSerializer
from parent_controls.models import WrongAnswerLog
from child_profiles.utils import resolve_child_profile

class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public questions endpoint. Strips correct answers to prevent cheating.
    Validates answers securely via the submit action.
    """
    serializer_class = QuestionSerializer
    pagination_class = None
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Question.objects.filter(is_active=True)
        lesson_id = self.request.query_params.get('lesson_id')
        question_type = self.request.query_params.get('question_type') or self.request.query_params.get('game_type')
        category = self.request.query_params.get('category')
        language = self.request.query_params.get('language')
        age_group = self.request.query_params.get('age_group')
        difficulty = self.request.query_params.get('difficulty')

        if lesson_id:
            # A non-numeric id used to raise ValueError (HTTP 500); unknown ids simply match nothing.
            queryset = queryset.filter(lesson_id=lesson_id) if str(lesson_id).isdigit() else queryset.none()
        if question_type:
            queryset = queryset.filter(question_type=question_type)
        if category:
            queryset = queryset.filter(category=category)
        if language:
            queryset = queryset.filter(language__in=[language, 'all'])
        if age_group:
            queryset = queryset.filter(age_group__in=[age_group, 'all'])
        if difficulty:
            try:
                queryset = queryset.filter(difficulty=int(difficulty))
            except (ValueError, TypeError):
                pass

        return queryset.order_by('id')

    @action(detail=False, methods=['get'], url_path='game-questions')
    def game_questions(self, request):
        """
        Dynamic game questions endpoint for mobile/web game runner.
        Returns full option details and correct_option_id for real-time offline feedback.
        """
        queryset = self.get_queryset()
        serializer = GameQuestionSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='submit')
    def submit_answer(self, request):
        serializer = AnswerSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        qid = serializer.validated_data['question_id']
        selected = str(serializer.validated_data['selected_answer']).strip()
        child_profile_id = serializer.validated_data.get('child_profile_id')

        # Find question by ID or stable_id
        question = Question.objects.filter(id=qid).first() if str(qid).isdigit() else None
        if not question:
            question = Question.objects.filter(stable_id=qid).first()

        if not question:
            return Response({'detail': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_correct = (str(question.correct_answer).strip().lower() == selected.lower())

        # If child profile provided, log wrong answers for parental review
        # Only the owning, signed-in parent's child gets a log entry; guests are never logged.
        if not is_correct and child_profile_id and request.user.is_authenticated:
            try:
                child = resolve_child_profile(request, child_profile_id)
                if child:
                    WrongAnswerLog.objects.create(
                        child_profile=child,
                        question_text=question.question_text,
                        user_answer=selected,
                        correct_answer=question.correct_answer,
                        category=question.category,
                        game_type=question.question_type,
                    )
            except Exception:
                pass

        return Response({
            'question_id': qid,
            'is_correct': is_correct,
            'correct_answer': question.correct_answer,
            'explanation': question.explanation,
            'points_awarded': question.points if is_correct else 0,
        }, status=status.HTTP_200_OK)

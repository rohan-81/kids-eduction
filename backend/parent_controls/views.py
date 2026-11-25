from datetime import date
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ScreenTimeSetting, ScreenTimeLog, WrongAnswerLog
from .serializers import ScreenTimeSettingSerializer, ScreenTimeLogSerializer, WrongAnswerLogSerializer
from child_profiles.models import ChildProfile

class ScreenTimeSettingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, child_id):
        child = ChildProfile.objects.filter(id=child_id).first()
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        if child.parent:
            if not request.user.is_authenticated or child.parent != request.user:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        settings, _ = ScreenTimeSetting.objects.get_or_create(child_profile=child)
        return Response(ScreenTimeSettingSerializer(settings).data)

    def put(self, request, child_id):
        child = ChildProfile.objects.filter(id=child_id).first()
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        if child.parent:
            if not request.user.is_authenticated or child.parent != request.user:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        settings, _ = ScreenTimeSetting.objects.get_or_create(child_profile=child)
        for field in ['daily_limit_minutes', 'session_limit_minutes', 'bedtime_start', 'bedtime_end', 'is_enabled']:
            if field in request.data:
                setattr(settings, field, request.data[field])
        settings.save()
        return Response(ScreenTimeSettingSerializer(settings).data)


class ScreenTimeLogView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, child_id):
        child = ChildProfile.objects.filter(id=child_id).first()
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        if child.parent:
            if not request.user.is_authenticated or child.parent != request.user:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        minutes = int(request.data.get('minutes', 1))
        today = date.today()

        log, created = ScreenTimeLog.objects.get_or_create(
            child_profile=child,
            date=today,
            defaults={'minutes_used': minutes, 'session_count': 1}
        )
        if not created:
            log.minutes_used += minutes
            log.session_count += 1
            log.save()

        return Response(ScreenTimeLogSerializer(log).data)


class WrongAnswerLogViewSet(viewsets.ModelViewSet):
    serializer_class = WrongAnswerLogSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        child_id = self.request.query_params.get('child_id')
        queryset = WrongAnswerLog.objects.all().order_by('-logged_at')
        if user.is_authenticated:
            queryset = queryset.filter(child_profile__parent=user)
        else:
            queryset = queryset.filter(child_profile__parent__isnull=True)
        if child_id:
            queryset = queryset.filter(child_profile_id=child_id)
        return queryset

    def create(self, request, *args, **kwargs):
        child_id = request.data.get('child_profile') or request.data.get('child_profile_id')
        child = ChildProfile.objects.filter(id=child_id).first() if child_id else None
        if child and child.parent:
            if not request.user.is_authenticated or child.parent != request.user:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

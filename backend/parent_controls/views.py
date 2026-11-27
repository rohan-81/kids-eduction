from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ScreenTimeSetting, ScreenTimeLog, WrongAnswerLog
from .serializers import ScreenTimeSettingSerializer, ScreenTimeLogSerializer, WrongAnswerLogSerializer
from child_profiles.utils import resolve_child_profile, safe_int

# Parental controls act on a specific child, so they always require the owning parent's login.
PARENT_ONLY = [permissions.IsAuthenticated]


def _not_found():
    return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)


class ScreenTimeSettingView(APIView):
    permission_classes = PARENT_ONLY

    def get(self, request, child_id):
        child = resolve_child_profile(request, child_id)
        if not child:
            return _not_found()
        settings, _ = ScreenTimeSetting.objects.get_or_create(child_profile=child)
        return Response(ScreenTimeSettingSerializer(settings).data)

    def put(self, request, child_id):
        child = resolve_child_profile(request, child_id)
        if not child:
            return _not_found()
        settings, _ = ScreenTimeSetting.objects.get_or_create(child_profile=child)
        serializer = ScreenTimeSettingSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(child_profile=child)
        return Response(serializer.data)


class ScreenTimeLogView(APIView):
    permission_classes = PARENT_ONLY

    def post(self, request, child_id):
        child = resolve_child_profile(request, child_id)
        if not child:
            return _not_found()

        minutes = safe_int(request.data.get('minutes'), default=1, lo=0, hi=24 * 60)
        today = timezone.localdate()
        with transaction.atomic():
            log, created = ScreenTimeLog.objects.select_for_update().get_or_create(
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
    permission_classes = PARENT_ONLY
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = WrongAnswerLog.objects.filter(child_profile__parent=self.request.user).order_by('-logged_at')
        child_id = self.request.query_params.get('child_id')
        if child_id:
            queryset = queryset.filter(child_profile_id=safe_int(child_id, default=-1, lo=-1, hi=2**62))
        return queryset

    def perform_create(self, serializer):
        child_id = self.request.data.get('child_profile') or self.request.data.get('child_profile_id')
        child = resolve_child_profile(self.request, child_id)
        if not child:
            from rest_framework.exceptions import NotFound
            raise NotFound('Child profile not found.')
        serializer.save(child_profile=child)

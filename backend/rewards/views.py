from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from child_profiles.models import ChildProfile
from .models import Badge, Reward, Sticker
from .serializers import BadgeSerializer, RewardSerializer, StickerSerializer


class StickerViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/rewards/stickers/ (optionally ?category=animals) and /api/rewards/stickers/<slug>/."""
    serializer_class = StickerSerializer
    pagination_class = None
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Sticker.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset.order_by('order', 'slug')

class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Badge.objects.filter(is_active=True).order_by('slug')
    serializer_class = BadgeSerializer
    pagination_class = None
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class RewardViewSet(viewsets.ModelViewSet):
    serializer_class = RewardSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        profile_id = self.request.query_params.get('profile_id') or self.request.query_params.get('child_id')
        queryset = Reward.objects.all().order_by('-earned_at')
        if user.is_authenticated:
            queryset = queryset.filter(child_profile__parent=user)
        else:
            queryset = queryset.filter(child_profile__parent__isnull=True)
        if profile_id:
            queryset = queryset.filter(child_profile_id=profile_id)
        return queryset

    def create(self, request, *args, **kwargs):
        child_id = request.data.get('child_profile') or request.data.get('child_profile_id')
        child = ChildProfile.objects.filter(id=child_id).first() if child_id else None
        if child and child.parent:
            if not request.user.is_authenticated or child.parent != request.user:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

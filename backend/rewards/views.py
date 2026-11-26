from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from child_profiles.utils import resolve_child_profile, safe_int
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
    """A parent's children's earned rewards. Guests keep rewards on-device only."""
    serializer_class = RewardSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        profile_id = self.request.query_params.get('profile_id') or self.request.query_params.get('child_id')
        queryset = Reward.objects.filter(child_profile__parent=self.request.user).order_by('-earned_at')
        if profile_id:
            queryset = queryset.filter(child_profile_id=safe_int(profile_id, default=-1, lo=-1, hi=2**62))
        return queryset

    def perform_create(self, serializer):
        child_id = self.request.data.get('child_profile') or self.request.data.get('child_profile_id')
        child = resolve_child_profile(self.request, child_id)
        if not child:
            raise NotFound('Child profile not found.')
        serializer.save(child_profile=child)

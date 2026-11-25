from rest_framework import viewsets, permissions
from .models import Story
from .serializers import StorySerializer

class StoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Story.objects.filter(is_active=True).prefetch_related('scenes').order_by('order', 'slug')
    serializer_class = StorySerializer
    pagination_class = None
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

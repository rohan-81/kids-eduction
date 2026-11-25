from rest_framework import viewsets, permissions
from .models import Rhyme
from .serializers import RhymeSerializer

class RhymeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rhyme.objects.filter(is_active=True).order_by('order', 'slug')
    serializer_class = RhymeSerializer
    pagination_class = None
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

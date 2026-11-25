from rest_framework import viewsets, permissions
from .models import ColoringTemplate, Worksheet
from .serializers import ColoringTemplateSerializer, WorksheetSerializer

class ColoringTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ColoringTemplate.objects.filter(is_active=True).order_by('order', 'slug')
    serializer_class = ColoringTemplateSerializer
    pagination_class = None
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class WorksheetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Worksheet.objects.filter(is_active=True).order_by('slug')
    serializer_class = WorksheetSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

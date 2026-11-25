from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ColoringTemplateViewSet, WorksheetViewSet

router = DefaultRouter()
router.register(r'coloring', ColoringTemplateViewSet, basename='coloring')
router.register(r'worksheets', WorksheetViewSet, basename='worksheets')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LessonProgressViewSet, GameResultViewSet, DailyActivityViewSet, CloudSyncView

router = DefaultRouter()
router.register(r'lessons', LessonProgressViewSet, basename='lesson-progress-nested')
router.register(r'games', GameResultViewSet, basename='game-results-nested')
router.register(r'activity', DailyActivityViewSet, basename='daily-activity')

# Root router for backward compatibility with existing frontend endpoints
root_router = DefaultRouter()
root_router.register(r'progress', LessonProgressViewSet, basename='lesson-progress-root')
root_router.register(r'game-results', GameResultViewSet, basename='game-results-root')

urlpatterns = [
    path('sync/', CloudSyncView.as_view(), name='cloud-sync'),
    path('', include(root_router.urls)),
    path('progress/', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LessonViewSet, CategoryViewSet, AnimalAudioView, CharacterAssetViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
# Must be registered before the catch-all '' lesson route, whose <pk> pattern would swallow 'assets/'
router.register(r'assets', CharacterAssetViewSet, basename='character-asset')
router.register(r'', LessonViewSet, basename='lesson')

urlpatterns = [
    path('animal-audio/<str:key>/', AnimalAudioView.as_view(), name='animal-audio'),
    path('', include(router.urls)),
]

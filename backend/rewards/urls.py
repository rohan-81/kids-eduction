from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RewardViewSet, BadgeViewSet, StickerViewSet

router = DefaultRouter()
router.register(r'badges', BadgeViewSet, basename='badges')
# Must be registered before the catch-all '' reward route below.
router.register(r'stickers', StickerViewSet, basename='stickers')
router.register(r'', RewardViewSet, basename='reward')

urlpatterns = [
    path('', include(router.urls)),
]

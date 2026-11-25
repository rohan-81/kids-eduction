from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdventureLevelViewSet, WalletView, DailyStreakView, LuckySpinView

router = DefaultRouter()
router.register(r'levels', AdventureLevelViewSet, basename='adventure-levels')

urlpatterns = [
    path('wallet/<int:child_id>/', WalletView.as_view(), name='child-wallet'),
    path('streak/<int:child_id>/', DailyStreakView.as_view(), name='child-streak'),
    path('spin/<int:child_id>/', LuckySpinView.as_view(), name='child-spin'),
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScreenTimeSettingView, ScreenTimeLogView, WrongAnswerLogViewSet

router = DefaultRouter()
router.register(r'wrong-answers', WrongAnswerLogViewSet, basename='wrong-answers')

urlpatterns = [
    path('screen-time/settings/<int:child_id>/', ScreenTimeSettingView.as_view(), name='screen-time-settings'),
    path('screen-time/log/<int:child_id>/', ScreenTimeLogView.as_view(), name='screen-time-log'),
    path('', include(router.urls)),
]

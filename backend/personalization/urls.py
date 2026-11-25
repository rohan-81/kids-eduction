from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AvatarItemViewSet, ChildAvatarView, PurchaseAvatarItemView, GardenPlantViewSet

router = DefaultRouter()
router.register(r'items', AvatarItemViewSet, basename='avatar-items')
router.register(r'plants', GardenPlantViewSet, basename='garden-plants')

urlpatterns = [
    path('avatar/<int:child_id>/', ChildAvatarView.as_view(), name='child-avatar'),
    path('purchase/<int:child_id>/', PurchaseAvatarItemView.as_view(), name='purchase-avatar-item'),
    path('', include(router.urls)),
]

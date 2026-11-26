from rest_framework import viewsets, permissions
from .models import ChildProfile
from .serializers import ChildProfileSerializer
from .permissions import ParentalProtectedPermission

class ChildProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ChildProfileSerializer
    permission_classes = [ParentalProtectedPermission]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated:
            return ChildProfile.objects.filter(parent=user, is_active=True)
        # Unauthenticated / guest requests should never be exposed to other users' profiles
        return ChildProfile.objects.none()

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)

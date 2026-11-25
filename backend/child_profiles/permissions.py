from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied


class ParentalProtectedPermission(permissions.BasePermission):
    """
    COPPA & GDPR-K Compliance Permission:
    - Safe methods (GET, HEAD, OPTIONS): Allowed for reading own children.
    - Profile Creation (POST): Allowed for authenticated parent or guest.
    - Sensitive Actions (DELETE, PUT, PATCH): Requires either:
      1. An authenticated parent user (request.user.is_authenticated), OR
      2. Verified parental gate challenge (header: X-Parent-Verified: 'true')
    """
    message = "Parental authorization required for modifying or deleting child profiles."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.method == 'POST':
            return True

        if request.user and request.user.is_authenticated:
            return True

        parent_verified = request.headers.get('X-Parent-Verified') or request.META.get('HTTP_X_PARENT_VERIFIED')
        if parent_verified and str(parent_verified).lower() in ['true', '1', 'yes']:
            return True

        raise PermissionDenied(self.message)

    def has_object_permission(self, request, view, obj):
        # Strict parent-child ownership protection
        if obj.parent is not None:
            if not request.user or not request.user.is_authenticated:
                return False
            return obj.parent == request.user
        return True

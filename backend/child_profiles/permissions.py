from rest_framework import permissions
from rest_framework.exceptions import NotAuthenticated


class ParentalProtectedPermission(permissions.BasePermission):
    """
    COPPA & GDPR-K Compliance Permission:
    - Every action (read, create, update, delete) requires the authenticated parent account.
      Guest profiles live only on the device; the server stores no ownerless child data.
    - Objects are additionally restricted to the requesting parent (has_object_permission).
    - A client-supplied header (e.g. the old `X-Parent-Verified`) is never trusted as authorization:
      any HTTP client can set it.
    """
    message = "Parental authorization required for child profiles."

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return True
        raise NotAuthenticated(self.message)

    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated and obj.parent_id == request.user.id)

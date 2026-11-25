from .models import ChildProfile

def resolve_child_profile(request, child_id=None):
    """
    Safely resolves a ChildProfile for the given request and child_id.
    - If child exists and matches the parent (or has no parent), returns it.
    - If child belongs to another parent or is not found:
      - For authenticated parents, returns/creates their own child profile.
      - For unauthenticated/guest users, returns/creates an unowned guest profile.
    This prevents 403 Forbidden errors when children play games without logging in.
    """
    child = None
    if child_id:
        try:
            child = ChildProfile.objects.filter(id=int(child_id)).first()
        except (ValueError, TypeError):
            child = None

    if not child or (child.parent and (not request.user.is_authenticated or child.parent != request.user)):
        if request.user.is_authenticated:
            child = ChildProfile.objects.filter(parent=request.user).first()
            if not child:
                nickname = getattr(request.user, 'first_name', '') or request.user.username or 'Little Star'
                child, _ = ChildProfile.objects.get_or_create(
                    parent=request.user,
                    defaults={'nickname': nickname, 'age_group': '2-4', 'avatar': 'avatar_3d_boy'}
                )
        else:
            child = ChildProfile.objects.filter(parent__isnull=True).first()
            if not child:
                child, _ = ChildProfile.objects.get_or_create(
                    nickname='Guest Learner',
                    parent__isnull=True,
                    defaults={'age_group': '2-4', 'avatar': 'avatar_3d_boy'}
                )
    return child

from .models import ChildProfile


def resolve_child_profile(request, child_id=None):
    """
    Resolves a ChildProfile owned by the authenticated parent, or None.

    - Unauthenticated requests ALWAYS get None. Guest progress lives only on the device; the
      server never shares or invents an ownerless "guest" profile (audit P0-2: every guest used
      to read and overwrite the same row, and one guest's reset wiped all guests' progress).
    - An explicit child_id must belong to the requesting parent; a foreign, unknown or malformed
      id returns None instead of silently writing to the parent's first child.
    - With no child_id, the parent's first active child is used (single-child families).
    """
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return None

    owned = ChildProfile.objects.filter(parent=user, is_active=True)
    if child_id in (None, ''):
        return owned.order_by('id').first()
    try:
        return owned.filter(id=int(child_id)).first()
    except (TypeError, ValueError):
        return None


def safe_int(value, default=0, lo=0, hi=10_000):
    """Parses an int from untrusted input and clamps it to [lo, hi]; never raises."""
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, parsed))

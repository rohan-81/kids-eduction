"""Helpers for turning stored media paths into absolute URLs for the app."""
import re

from django.conf import settings

# Only values that look like an image/audio file path are rewritten. Fields such as
# Story.cover_image also hold emoji ("🦅") and must pass through untouched.
_MEDIA_FILE_RE = re.compile(r'^[\w./-]+\.(png|jpe?g|webp|gif|svg|mp3|m4a|wav)(\?.*)?$', re.IGNORECASE)


def is_media_path(value: str) -> bool:
    return bool(value) and bool(_MEDIA_FILE_RE.match(value))


def absolute_media_url(value: str, request=None) -> str:
    """
    'characters/3d_lion.webp'          -> 'https://api.example.com/media/characters/3d_lion.webp'
    '/media/characters/3d_lion.webp'   -> same
    'https://cdn.example.com/x.webp'   -> unchanged

    If MEDIA_CDN_URL is configured (e.g. a CloudFront/Cloudflare origin in front of
    /media/), it is used instead of the request host.
    """
    if not value:
        return value
    if value.startswith(('http://', 'https://', 'data:')) or not is_media_path(value):
        return value

    media_url = settings.MEDIA_URL if settings.MEDIA_URL.endswith('/') else settings.MEDIA_URL + '/'
    path = value if value.startswith((media_url, '/static/')) else media_url + value.lstrip('/')

    cdn = getattr(settings, 'MEDIA_CDN_URL', '')
    if cdn and path.startswith(media_url):
        return cdn.rstrip('/') + '/' + path[len(media_url):]
    if request is not None:
        return request.build_absolute_uri(path)
    return path

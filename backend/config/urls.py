from django.contrib import admin
import re

from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static
from lessons.views import TTSAudioView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/tts/', TTSAudioView.as_view(), name='tts-audio'),
    path('api/tts/audio.mp3', TTSAudioView.as_view(), name='tts-audio-mp3'),
    path('api/auth/', include('accounts.urls')),
    path('api/lessons/', include('lessons.urls')),
    path('api/questions/', include('questions.urls')),
    path('api/profiles/', include('child_profiles.urls')),
    path('api/', include('progress.urls')),
    path('api/rewards/', include('rewards.urls')),
    path('api/stories/', include('stories.urls')),
    path('api/rhymes/', include('rhymes.urls')),
    path('api/creative/', include('creative.urls')),
    path('api/gamification/', include('gamification.urls')),
    path('api/personalization/', include('personalization.urls')),
    path('api/parent/', include('parent_controls.urls')),
]

def _serve_media_cached(request, path):
    """Serves a media file with long-lived cache headers so CDNs and the app's disk cache keep it."""
    response = serve(request, path, document_root=settings.MEDIA_ROOT)
    response['Cache-Control'] = f'public, max-age={settings.MEDIA_CACHE_MAX_AGE}'
    response['Access-Control-Allow-Origin'] = '*'  # web build loads renders cross-origin
    return response


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
elif getattr(settings, 'SERVE_MEDIA', False) and settings.MEDIA_URL.startswith('/'):
    # django.conf.urls.static.static() is a no-op when DEBUG is False, so production needs this route.
    urlpatterns += [
        re_path(r'^%s(?P<path>.*)$' % re.escape(settings.MEDIA_URL.lstrip('/')), _serve_media_cached),
    ]

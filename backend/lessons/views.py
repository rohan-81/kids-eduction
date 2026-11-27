from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from django.http import HttpResponse, FileResponse
from django.conf import settings
from pathlib import Path
import re
import threading
import urllib.request
import urllib.parse
import logging
from .models import Category, Lesson, CharacterAsset
from .serializers import CategorySerializer, LessonSerializer, CharacterAssetSerializer

logger = logging.getLogger(__name__)
_TTS_CACHE = {}
_TTS_CACHE_LOCK = threading.Lock()
_SAFE_AUDIO_KEY_RE = re.compile(r'^[a-z0-9_-]+$')


class AnimalAudioView(APIView):
    """
    Streams original authentic animal voice recordings (MP3/WAV) directly from the backend database/server.
    Supports caching, byte-range requests, and instant playback for kids.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, key):
        clean_key = (key or '').strip().lower()
        if clean_key.endswith('.mp3'):
            clean_key = clean_key[:-4]
        elif clean_key.endswith('.wav'):
            clean_key = clean_key[:-4]
        if not clean_key or not _SAFE_AUDIO_KEY_RE.match(clean_key):
            return Response({'error': 'Invalid audio key.'}, status=status.HTTP_400_BAD_REQUEST)

        media_dir = (Path(settings.MEDIA_ROOT) / 'audio' / 'animals').resolve()

        target_file = (media_dir / f"{clean_key}.mp3").resolve()
        content_type = 'audio/mpeg'
        if not target_file.is_relative_to(media_dir) or not target_file.exists():
            target_file = (media_dir / f"{clean_key}.wav").resolve()
            content_type = 'audio/wav'

        if not target_file.is_relative_to(media_dir) or not target_file.exists():
            return Response({'error': f'Audio for animal "{clean_key}" not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            with open(target_file, 'rb') as f:
                content = f.read()

            response = HttpResponse(content, content_type=content_type)
            response['Cache-Control'] = 'public, max-age=604800'
            response['Content-Length'] = str(len(content))
            response['Accept-Ranges'] = 'bytes'
            response['Content-Disposition'] = f'inline; filename="{target_file.name}"'
            return response
        except OSError:
            logger.exception('Failed to read animal audio %s', target_file.name)
            return Response({'error': 'Audio could not be loaded.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TTSAudioView(APIView):
    """
    Proxies native audio pronunciation from Google TTS for the web build.

    Hardening (audit P1-6):
    - `lang` is restricted to the app's three languages (it is interpolated into the upstream URL).
    - Text length is capped and requests are rate limited (`tts` throttle scope), so the endpoint
      cannot be used as an open relay.
    - Upstream errors are not echoed back to the caller.
    - The client masks the child's name before calling this endpoint (see audioService).
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'tts'

    ALLOWED_LANGS = {'gu', 'hi', 'en'}
    MAX_TEXT_CHARS = 190
    MAX_CACHE_ENTRIES = 500

    def get(self, request):
        text = (request.query_params.get('text') or '').strip()
        lang = (request.query_params.get('lang') or 'gu').strip().lower()
        if not text:
            return Response({'error': 'text parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        if lang not in self.ALLOWED_LANGS:
            return Response({'error': 'Unsupported language.'}, status=status.HTTP_400_BAD_REQUEST)
        text = text[: self.MAX_TEXT_CHARS]

        cache_key = f"{lang}:{text}"
        with _TTS_CACHE_LOCK:
            content = _TTS_CACHE.get(cache_key)
        if content is None:
            query = urllib.parse.urlencode({'ie': 'UTF-8', 'client': 'tw-ob', 'tl': lang, 'q': text})
            url = f"https://translate.google.com/translate_tts?{query}"
            try:
                req = urllib.request.Request(
                    url,
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                )
                with urllib.request.urlopen(req, timeout=4.0) as res:
                    upstream_ct = (res.headers.get('Content-Type') or '').lower()
                    if upstream_ct and not (upstream_ct.startswith('audio/') or upstream_ct.startswith('application/octet-stream')):
                        return Response({'error': 'Speech service unavailable.'}, status=status.HTTP_502_BAD_GATEWAY)
                    content = res.read(2 * 1024 * 1024)  # an utterance is a few KB; cap runaway bodies
                    if not content:
                        return Response({'error': 'Speech service unavailable.'}, status=status.HTTP_502_BAD_GATEWAY)
            except Exception:
                logger.warning('TTS upstream request failed', exc_info=True)
                return Response({'error': 'Speech service unavailable.'}, status=status.HTTP_502_BAD_GATEWAY)
            with _TTS_CACHE_LOCK:
                if len(_TTS_CACHE) >= self.MAX_CACHE_ENTRIES:
                    _TTS_CACHE.pop(next(iter(_TTS_CACHE)))  # evict oldest (dicts keep insertion order)
                _TTS_CACHE[cache_key] = content

        response = HttpResponse(content, content_type='audio/mpeg')
        response['Cache-Control'] = 'public, max-age=604800'
        response['Content-Length'] = str(len(content))
        response['Accept-Ranges'] = 'bytes'
        response['Content-Disposition'] = 'inline; filename="tts.mp3"'
        return response


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True).order_by('order', 'slug')
    serializer_class = CategorySerializer
    pagination_class = None
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LessonSerializer
    pagination_class = None
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'example_word', 'subtitle', 'phonetic']

    def get_queryset(self):
        queryset = Lesson.objects.filter(is_active=True)

        category = self.request.query_params.get('category')
        language = self.request.query_params.get('language')
        age_group = self.request.query_params.get('age_group')
        difficulty = self.request.query_params.get('difficulty')

        if category:
            queryset = queryset.filter(category=category)
        if language:
            queryset = queryset.filter(language__in=[language, 'all'])
        if age_group and not category:
            queryset = queryset.filter(age_group__in=[age_group, 'all'])
        if difficulty:
            try:
                diff_val = int(difficulty)
                if 0 <= diff_val <= 32767:
                    queryset = queryset.filter(difficulty=diff_val)
                else:
                    queryset = queryset.none()
            except (ValueError, TypeError):
                pass

        return queryset.order_by('order', 'id')

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<stable_id>[^/.]+)')
    def get_by_stable_id(self, request, stable_id=None):
        try:
            lesson = Lesson.objects.get(stable_id=stable_id, is_active=True)
            serializer = self.get_serializer(lesson)
            return Response(serializer.data)
        except Lesson.DoesNotExist:
            return Response({'detail': 'Lesson not found.'}, status=404)


class CharacterAssetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Manifest of shared 3D renders: GET /api/lessons/assets/ -> [{asset_key, url, ...}].
    Lets the app (or tooling) discover/prefetch renders and pick up new ones without a release.
    """
    serializer_class = CharacterAssetSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'asset_key'
    pagination_class = None

    def get_queryset(self):
        qs = CharacterAsset.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs

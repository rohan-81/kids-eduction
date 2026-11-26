from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from django.http import HttpResponse, FileResponse
from django.conf import settings
from pathlib import Path
import urllib.request
import urllib.parse
import logging
from .models import Category, Lesson, CharacterAsset
from .serializers import CategorySerializer, LessonSerializer, CharacterAssetSerializer

logger = logging.getLogger(__name__)
_TTS_CACHE = {}


class AnimalAudioView(APIView):
    """
    Streams original authentic animal voice recordings (MP3/WAV) directly from the backend database/server.
    Supports caching, byte-range requests, and instant playback for kids.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, key):
        clean_key = (key or '').strip().lower().replace('.mp3', '').replace('.wav', '')
        media_dir = Path(settings.MEDIA_ROOT) / 'audio' / 'animals'

        target_file = media_dir / f"{clean_key}.mp3"
        content_type = 'audio/mpeg'
        if not target_file.exists():
            target_file = media_dir / f"{clean_key}.wav"
            content_type = 'audio/wav'

        if not target_file.exists():
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
                    content = res.read(2 * 1024 * 1024)  # an utterance is a few KB; cap runaway bodies
            except Exception:
                logger.warning('TTS upstream request failed', exc_info=True)
                return Response({'error': 'Speech service unavailable.'}, status=status.HTTP_502_BAD_GATEWAY)
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
                queryset = queryset.filter(difficulty=int(difficulty))
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

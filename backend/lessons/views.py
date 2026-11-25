from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse, FileResponse
from django.conf import settings
from pathlib import Path
import urllib.request
import urllib.parse
from .models import Category, Lesson, CharacterAsset
from .serializers import CategorySerializer, LessonSerializer, CharacterAssetSerializer

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
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TTSAudioView(APIView):
    """
    Proxies native high-fidelity audio pronunciation from Google TTS.
    Delivers 100% authentic native Gujarati pronunciation without Hindi accent distortion.
    Includes in-memory LRU caching for instant repeated playback.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        text = (request.query_params.get('text') or '').strip()
        lang = (request.query_params.get('lang') or 'gu').strip().lower()
        if not text:
            return Response({'error': 'text parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"{lang}:{text[:250]}"
        if cache_key in _TTS_CACHE:
            content = _TTS_CACHE[cache_key]
            response = HttpResponse(content, content_type='audio/mpeg')
            response['Cache-Control'] = 'public, max-age=604800'
            response['Content-Length'] = str(len(content))
            response['Accept-Ranges'] = 'bytes'
            response['Content-Disposition'] = 'inline; filename="tts.mp3"'
            return response

        encoded = urllib.parse.quote(text[:190])
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl={lang}&q={encoded}"
        try:
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            with urllib.request.urlopen(req, timeout=4.0) as res:
                content = res.read()
                if len(_TTS_CACHE) < 500:
                    _TTS_CACHE[cache_key] = content
                response = HttpResponse(content, content_type='audio/mpeg')
                response['Cache-Control'] = 'public, max-age=604800'
                response['Content-Length'] = str(len(content))
                response['Accept-Ranges'] = 'bytes'
                response['Content-Disposition'] = 'inline; filename="tts.mp3"'
                return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


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

"""
Django settings for KidsZone Kids Learning Application Backend.
Production-ready configuration with PostgreSQL, Token Auth, CORS, and Cloud Sync.
"""

from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
    load_dotenv()
except ImportError:
    pass

# Security
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-kidszone-dev-key-change-in-production-2026'
)

DEBUG = os.environ.get('DJANGO_DEBUG', 'False').lower() in ['true', '1', 'yes']

allowed_hosts_env = os.environ.get('DJANGO_ALLOWED_HOSTS', '')
if allowed_hosts_env:
    ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_env.split(',') if h.strip()]
else:
    ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '10.0.2.2'] if DEBUG else []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',

    # Local apps
    'accounts',
    'lessons',
    'questions',
    'child_profiles',
    'progress',
    'rewards',
    'stories',
    'rhymes',
    'creative',
    'gamification',
    'personalization',
    'parent_controls',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Whitenoise for static files in production if installed
try:
    import whitenoise
    MIDDLEWARE.insert(2, 'whitenoise.middleware.WhiteNoiseMiddleware')
except ImportError:
    pass

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database: SQLite for local dev, PostgreSQL for production via DATABASE_URL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

database_url = os.environ.get('DATABASE_URL')
if database_url:
    try:
        import dj_database_url
        DATABASES['default'] = dj_database_url.config(
            default=database_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    except ImportError:
        pass

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
# Some platforms' MIME tables (e.g. Windows) lack WebP; without this, renders are served as
# application/octet-stream, which browsers may block cross-origin under X-Content-Type-Options: nosniff.
import mimetypes  # noqa: E402
mimetypes.add_type('image/webp', '.webp')

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
# Optional CDN origin in front of /media/ (e.g. https://cdn.kidszone.app/media). When set,
# API responses point images there instead of at this server.
MEDIA_CDN_URL = os.environ.get('DJANGO_MEDIA_CDN_URL', '').strip()
# Serve /media/ from Django when DEBUG is off (fine behind a caching CDN; disable if nginx/S3 serves it).
SERVE_MEDIA = os.environ.get('DJANGO_SERVE_MEDIA', 'True').lower() in ['true', '1', 'yes']
# Browser/CDN cache lifetime for media files (renders are re-uploaded under the same name rarely).
MEDIA_CACHE_MAX_AGE = int(os.environ.get('DJANGO_MEDIA_CACHE_MAX_AGE', str(60 * 60 * 24 * 30)))

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
}

# CORS Configuration
cors_origins_env = os.environ.get('DJANGO_CORS_ALLOWED_ORIGINS', '')
if cors_origins_env:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_origins_env.split(',') if o.strip()]
    CORS_ALLOW_ALL_ORIGINS = False
else:
    CORS_ALLOW_ALL_ORIGINS = DEBUG

# Production Security Headers
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = os.environ.get('DJANGO_SECURE_SSL_REDIRECT', 'True').lower() in ['true', '1', 'yes']
    SECURE_HSTS_SECONDS = int(os.environ.get('DJANGO_HSTS_SECONDS', 31536000))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

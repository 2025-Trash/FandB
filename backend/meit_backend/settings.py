"""
Django settings for meit_backend project.

사용: Django 4.2 LTS + DRF + SimpleJWT + CORS
로컬 개발에 맞춘 기본값(React와 연동 용이)
"""

from pathlib import Path
import os
from datetime import timedelta

# .env 로드 (pip install python-dotenv 필요)
from dotenv import load_dotenv
load_dotenv()

# BASE_DIR
BASE_DIR = Path(__file__).resolve().parent.parent

# =========================
# 기본 보안/디버그 설정 (.env로 관리)
# =========================
# 예) .env:
# DJANGO_SECRET_KEY=change-me
# DEBUG=1
# ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-only-for-local")
DEBUG = os.getenv("DEBUG", "1") == "1"

# 개발 편의상 와일드카드 허용 (배포 시 도메인 명시)
ALLOWED_HOSTS = ["*"]

# CORS 허용 Origin (배포 시 특정 도메인만)
# 쉼표로 구분된 문자열 -> 리스트
_ALLOWED = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
CORS_ALLOWED_ORIGINS = [o.strip() for o in _ALLOWED.split(",") if o.strip()]
# 빠른 개발용 전체 허용 (위 목록과 병행 가능) - 배포에서 False 권장
CORS_ALLOW_ALL_ORIGINS = True

# CSRF (DRF + JWT만 쓰면 크게 영향은 적지만, 브라우저 POST 테스트 시 필요할 수 있음)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# =========================
# 앱 등록
# =========================
INSTALLED_APPS = [
    # Django 기본
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 3rd-party
    'rest_framework',
    'corsheaders',

    # 로컬 앱
    'accounts',
    'trees',
]

# =========================
# 미들웨어
# =========================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',     # ← CORS 항상 위쪽에
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'meit_backend.urls'

# =========================
# 템플릿
# =========================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],           # 필요 시 React 빌드 템플릿 경로 추가 가능
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

WSGI_APPLICATION = 'meit_backend.wsgi.application'

# =========================
# 데이터베이스 (로컬: SQLite)
# =========================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# =========================
# 비밀번호 정책 (기본)
# =========================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

# =========================
# 국제화/시간대
# =========================
LANGUAGE_CODE = 'ko-kr'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True

# =========================
# 정적/미디어
# =========================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'   # collectstatic 시 사용 (배포용)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =========================
# DRF & JWT 설정
# =========================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",   # 개발 중엔 열어두고, 필요 시 IsAuthenticated로 조정
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=6),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

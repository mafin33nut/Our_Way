from pathlib import Path
import os
from dotenv import load_dotenv
import dj_database_url
from datetime import timedelta

# Base dir
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from BASE_DIR (file: /path/to/backend/.env)
load_dotenv(BASE_DIR / ".env")

# SECURITY
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "replace-me-for-dev-only")
DEBUG = os.getenv("DEBUG", "False").lower() in ("1", "true", "yes")
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost").split(",")

# Database configuration
# Priority:
# 1) If USE_SQLITE is true -> sqlite local file
# 2) Else if DATABASE_URL provided -> parse it with dj_database_url
# 3) Else build DATABASE_URL from DB_* variables
use_sqlite = os.getenv("USE_SQLITE", "False").lower() in ("1", "true", "yes")
db_url = os.getenv("DATABASE_URL")

if use_sqlite:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    # Clean up db_url if it contains stray b'...' or surrounding quotes
    if db_url:
        if isinstance(db_url, bytes):
            db_url = db_url.decode()
        db_url = db_url.strip()
        if (db_url.startswith("b'") and db_url.endswith("'")) or (
            db_url.startswith('b"') and db_url.endswith('"')
        ):
            db_url = db_url[2:-1]
        if (db_url.startswith("'") and db_url.endswith("'")) or (
            db_url.startswith('"') and db_url.endswith('"')
        ):
            db_url = db_url[1:-1]
        if db_url:
            DATABASES = {"default": dj_database_url.parse(db_url)}
        else:
            db_url = None

    if not db_url:
        # Build from DB_* vars if possible
        DB_NAME = os.getenv("DB_NAME")
        DB_USER = os.getenv("DB_USER")
        DB_PASSWORD = os.getenv("DB_PASSWORD", "")
        DB_HOST = os.getenv("DB_HOST", "localhost")
        DB_PORT = os.getenv("DB_PORT", "5432")

        if DB_NAME and DB_USER:
            # percent-encode password if needed is not handled here; avoid special chars in password or provide DATABASE_URL directly
            constructed = f"postgres://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            DATABASES = {"default": dj_database_url.parse(constructed)}
        else:
            # Fallback to local sqlite if nothing provided
            DATABASES = {
                "default": {
                    "ENGINE": "django.db.backends.sqlite3",
                    "NAME": BASE_DIR / "db.sqlite3",
                }
            }

# Application definition
INSTALLED_APPS = [
    # Django builtin apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    "rest_framework",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",

    # Project apps — adjust names to actual apps
    "app.core",
    "app.api",
    "app.activities",
    "app.clans",
    "app.focus",
    "app.user",
    "app.achievements",
    "app.notifications",
    "app.goals",
    # add others...
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be high in the chain
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization / timezone
LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("TIME_ZONE", "UTC")
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "static/"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Custom user model
AUTH_USER_MODEL = "user.User"

# Django REST framework + Simple JWT config
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", 30))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", 7))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# CORS settings (adjust as needed)
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL", "True").lower() in ("1", "true", "yes")
# or specify whitelist:
# CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Email settings (basic)
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.example.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))

# Additional environment debug helpers (optional)
# print("DEBUG:", DEBUG)
# print("DATABASES:", DATABASES)
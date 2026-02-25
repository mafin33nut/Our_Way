import re
import random

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
from app.user.serializers import UserSerializer
from django.utils import timezone
from threading import Thread
from app.notifications.services import send_notification_to_user

User = get_user_model()


def _validate_password_rules(password: str):
    if not password:
        return 'Password is required'
    if len(password) < 8:
        return 'Password must be at least 8 characters long.'
    if not re.fullmatch(r'[A-Za-z0-9]+', password):
        return 'Password must contain only English letters and digits.'
    if not re.search(r'[a-z]', password):
        return 'Password must contain at least one lowercase letter.'
    if not re.search(r'[A-Z]', password):
        return 'Password must contain at least one uppercase letter.'
    if not re.search(r'[0-9]', password):
        return 'Password must contain at least one digit.'
    return None

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        username = (data.get('username') or '').strip()
        password = data.pop('password', None)
        password2 = data.pop('password2', None)

        if not username:
            return Response({'username': ['Username is required']}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce case-insensitive uniqueness for usernames.
        if User.objects.filter(username__iexact=username).exists():
            return Response({'username': ['A user with that username already exists.']}, status=status.HTTP_400_BAD_REQUEST)

        if password != password2:
            return Response({'detail': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        if not password:
            return Response({'password': ['Password is required']}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'password': ['Password must be at least 8 characters long.']}, status=status.HTTP_400_BAD_REQUEST)

        # Password must contain only English letters and digits, with at least
        # one lowercase letter, one uppercase letter, and one digit.
        if not re.fullmatch(r'[A-Za-z0-9]+', password):
            return Response({'password': ['Password must contain only English letters and digits.']}, status=status.HTTP_400_BAD_REQUEST)
        if not re.search(r'[a-z]', password):
            return Response({'password': ['Password must contain at least one lowercase letter.']}, status=status.HTTP_400_BAD_REQUEST)
        if not re.search(r'[A-Z]', password):
            return Response({'password': ['Password must contain at least one uppercase letter.']}, status=status.HTTP_400_BAD_REQUEST)
        if not re.search(r'[0-9]', password):
            return Response({'password': ['Password must contain at least one digit.']}, status=status.HTTP_400_BAD_REQUEST)

        data['username'] = username

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        try:
            today = timezone.localdate()
            if request.user.last_daily_login_email != today:
                request.user.last_daily_login_email = today
                request.user.save(update_fields=['last_daily_login_email'])
                def _send_login_note():
                    try:
                        send_notification_to_user(
                            request.user,
                            subject='Добро пожаловать обратно в Our_Way',
                            body='Вы вошли в Our_Way. Желаем продуктивного дня!',
                        )
                    except Exception:
                        pass
                Thread(target=_send_login_note, daemon=True).start()
        except Exception:
            pass
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        data = request.data.copy()
        if data.get('avatar') == '':
            data.pop('avatar', None)
            try:
                request.user.avatar.delete(save=False)
            except Exception:
                pass
            request.user.avatar = None
            request.user.save(update_fields=['avatar'])
        serializer = UserSerializer(request.user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response(status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Восстановление пароля всегда отправляется на email,
        # привязанный к аккаунту. Во фронтенде мы используем имя пользователя,
        # чтобы не давать вводить произвольную почту.
        username = (request.data.get('username') or '').strip()
        raw_email = (request.data.get('email') or '').strip().lower()

        if not username and not raw_email:
            return Response(
                {'detail': 'Username or email is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = None
        if username:
            user = User.objects.filter(username__iexact=username).first()
        elif raw_email:
            user = User.objects.filter(email__iexact=raw_email).first()

        if user and user.email:
            email = user.email.strip().lower()
            code = f'{random.randint(100000, 999999)}'

            # Новый ключ, привязанный к user_id (используется новым фронтендом).
            cache.set(
                f'pwd_reset_uid:{user.id}',
                {'code': code, 'user_id': user.id},
                timeout=15 * 60,
            )
            # Для обратной совместимости сохраняем и старый ключ по email.
            cache.set(
                f'pwd_reset:{email}',
                {'code': code, 'user_id': user.id},
                timeout=15 * 60,
            )

            try:
                send_notification_to_user(
                    user,
                    subject='Восстановление пароля Our_Way',
                    body=(
                        'Вы запросили восстановление пароля.\n'
                        f'Код подтверждения: {code}\n'
                        'Код действует 15 минут.'
                    ),
                )
            except Exception:
                # Не раскрываем детали на клиенте, даже если почта недоступна.
                pass

        return Response(
            {'detail': 'Если аккаунт с таким email существует, код отправлен на почту.'},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = (request.data.get('username') or '').strip()
        email = (request.data.get('email') or '').strip().lower()
        code = (request.data.get('code') or '').strip()
        password = request.data.get('password') or ''
        password2 = request.data.get('password2') or ''

        if not code:
            return Response({'code': ['Code is required']}, status=status.HTTP_400_BAD_REQUEST)
        if password != password2:
            return Response({'detail': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        password_error = _validate_password_rules(password)
        if password_error:
            return Response({'password': [password_error]}, status=status.HTTP_400_BAD_REQUEST)

        cached = None
        cache_key = None
        user = None

        # Новый поток: идентификация по username, без ввода произвольного email.
        if username:
            user = User.objects.filter(username__iexact=username).first()
            if not user:
                return Response({'detail': 'Invalid reset request'}, status=status.HTTP_400_BAD_REQUEST)
            cache_key = f'pwd_reset_uid:{user.id}'
            cached = cache.get(cache_key)
        # Обратная совместимость: старые клиенты могут по‑прежнему присылать email.
        elif email:
            cache_key = f'pwd_reset:{email}'
            cached = cache.get(cache_key)
        else:
            return Response({'detail': 'Invalid reset request'}, status=status.HTTP_400_BAD_REQUEST)

        if not cached or cached.get('code') != code:
            return Response({'code': ['Invalid or expired confirmation code']}, status=status.HTTP_400_BAD_REQUEST)

        if not user:
            user = User.objects.filter(id=cached.get('user_id')).first()
        if not user:
            return Response({'detail': 'Invalid reset request'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save(update_fields=['password'])
        if cache_key:
            cache.delete(cache_key)
        return Response({'detail': 'Пароль успешно обновлен.'}, status=status.HTTP_200_OK)

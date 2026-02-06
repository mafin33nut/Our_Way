import re

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from app.user.serializers import UserSerializer
from django.utils import timezone
from threading import Thread
from app.notifications.services import send_notification_to_user

User = get_user_model()

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

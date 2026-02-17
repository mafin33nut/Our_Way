from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import permissions
from .views import (
    RegisterView,
    UserView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

# Create custom token views with explicit AllowAny permission and CSRF exemption
class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

urlpatterns = [
    path('token/', csrf_exempt(CustomTokenObtainPairView.as_view()), name='token_obtain_pair'),
    path('token/refresh/', csrf_exempt(CustomTokenRefreshView.as_view()), name='token_refresh'),
    path('register/', csrf_exempt(RegisterView.as_view()), name='auth_register'),
    path('password-reset/request/', csrf_exempt(PasswordResetRequestView.as_view()), name='password_reset_request'),
    path('password-reset/confirm/', csrf_exempt(PasswordResetConfirmView.as_view()), name='password_reset_confirm'),
    path('user/', UserView.as_view(), name='auth_user'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]
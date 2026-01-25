from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import permissions
from .views import RegisterView, UserView, LogoutView

# Create custom token views with explicit AllowAny permission
class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('user/', UserView.as_view(), name='auth_user'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]
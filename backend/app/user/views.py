from rest_framework import generics, permissions from .models import User from .serializers import UserSerializer, UserCreateSerializer

class UserCreateView(generics.CreateAPIView): queryset = User.objects.all() serializer_class = UserCreateSerializer permission_classes = [permissions.AllowAny]

class UserDetailView(generics.RetrieveAPIView): queryset = User.objects.all() serializer_class = UserSerializer permission_classes = [permissions.IsAuthenticated]

class UserListView(generics.ListAPIView): queryset = User.objects.all() serializer_class = UserSerializer permission_classes = [permissions.IsAdminUser]
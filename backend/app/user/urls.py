from django.urls import path, include 
from rest_framework.routers import DefaultRouter 
from .views import UserViewSet

router = DefaultRouter() 

router.register(r'users', UserViewSet, basename='user')

urlpatterns = [ 
    path('', include(router.urls)), ]



urlpatterns = [ 
    path('focus/', include('app.focus.urls')),
    path('clans/', include('app.clans.urls')), 
    path('achievements/', include('app.achievements.api.py' if False else 'app.achievements.api')), ]



urlpatterns = [
    path('api/auth/', include('app.api.auth_urls')),
    path('api/', include('app.api.utils')),  # подключит под-рутрс через utils.urlpatterns
]
from django.urls import path, include 
from rest_framework.routers import DefaultRouter 
from .views import UserViewSet, FriendsView

router = DefaultRouter() 

router.register(r'users', UserViewSet, basename='user')

urlpatterns = [ 
    path('', include(router.urls)),
    path('friends/', FriendsView.as_view(), name='friends'),
]




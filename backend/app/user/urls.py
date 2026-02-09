from django.urls import path, include 
from rest_framework.routers import DefaultRouter 
from .views import FriendRequestViewSet, FriendsView, UserViewSet

router = DefaultRouter() 

router.register(r'users', UserViewSet, basename='user')
router.register(r'friend-requests', FriendRequestViewSet, basename='friend-request')

urlpatterns = [ 
    path('', include(router.urls)),
    path('friends/', FriendsView.as_view(), name='friends'),
]



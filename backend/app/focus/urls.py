from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FocusProjectViewSet, FocusMissionViewSet, FocusMemberProgressViewSet

router = DefaultRouter()
router.register(r'projects', FocusProjectViewSet, basename='focus-project')
router.register(r'missions', FocusMissionViewSet, basename='focus-mission')
router.register(r'members', FocusMemberProgressViewSet, basename='focus-member-progress')

urlpatterns = [
    path('', include(router.urls)),
]

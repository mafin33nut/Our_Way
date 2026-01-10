from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClanViewSet, ClanMemberViewSet, ClanQuestViewSet

router = DefaultRouter()
router.register(r'clans', ClanViewSet, basename='clan')
router.register(r'members', ClanMemberViewSet, basename='clan-member')
router.register(r'quests', ClanQuestViewSet, basename='clan-quest')

urlpatterns = [
    path('', include(router.urls)),
]

"""
API namespace for achievements app (optional, can be used for custom endpoints).
"""
from rest_framework.routers import DefaultRouter
from .views import AchievementViewSet, UserAchievementViewSet

router = DefaultRouter()
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'user-achievements', UserAchievementViewSet, basename='user-achievement')

urlpatterns = router.urls

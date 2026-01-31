from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivityCategoryViewSet,
    ActivityLogViewSet,
    ActivityRewardViewSet,
    ActivityTimerViewSet,
    ActivityViewSet,
    QuestStepViewSet,
    QuestViewSet,
    UserFocusViewSet,
)

router = DefaultRouter()
router.register(r'categories', ActivityCategoryViewSet, basename='activity-category')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'logs', ActivityLogViewSet, basename='activity-log')
router.register(r'rewards', ActivityRewardViewSet, basename='activity-reward')
router.register(r'timers', ActivityTimerViewSet, basename='activity-timer')
router.register(r'quests', QuestViewSet, basename='quest')
router.register(r'focuses', UserFocusViewSet, basename='user-focus')
router.register(r'quest-steps', QuestStepViewSet, basename='quest-step')

urlpatterns = [
    path('', include(router.urls)),
]
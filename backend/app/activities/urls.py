from django.urls import path, include 
from rest_framework.routers import DefaultRouter 
from .views import ( ActivityCategoryViewSet, ActivityViewSet, ActivityLogViewSet, ActivityRewardViewSet, ActivityTimerViewSet )
router = DefaultRouter() 
router.register(r'categories', ActivityCategoryViewSet, basename='activity-category') 
router.register(r'activities', ActivityViewSet, basename='activity') 
router.register(r'logs', ActivityLogViewSet, basename='activity-log') 
router.register(r'rewards', ActivityRewardViewSet, basename='activity-reward') 
router.register(r'timers', ActivityTimerViewSet, basename='activity-timer')
urlpatterns = [ path('', include(router.urls)), ]
from .views import QuestViewSet
router.register(r'quests', QuestViewSet, basename='quest')
# если хотите expose clan quests из app.clans, можно зарегистрировать их здесь или в app/clans.urls
urlpatterns = [
    path('', include(router.urls)),
]
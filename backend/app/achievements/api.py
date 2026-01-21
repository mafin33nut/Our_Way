<<<<<<< HEAD
from rest_framework.routers import DefaultRouter
=======
""" API namespace for achievements app (optional, can be used for custom endpoints). """ 
from rest_framework.routers import DefaultRouter 
>>>>>>> eae13e1a12ce63f15fc92ad7990b0782b76a26a9
from .views import AchievementViewSet, UserAchievementViewSet

router = DefaultRouter() 
router.register(r'achievements', AchievementViewSet, basename='achievement') 
router.register(r'user-achievements', UserAchievementViewSet, basename='user-achievement')
urlpatterns = router.urls

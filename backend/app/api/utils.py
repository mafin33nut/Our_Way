from rest_framework.routers import DefaultRouter
from django.urls import include, path

# Import app submodules' url patterns or routers
from app.achievements import api as ach_api
from app.user import urls as user_urls
from app.focus import urls as focus_urls
from app.clans import urls as clans_urls
from app.activities import urls as activities_urls

router = DefaultRouter()

urlpatterns = [
    path('', include(user_urls)),
    path('achievements/', include(ach_api)),
    path('focus/', include(focus_urls)),
    path('clans/', include(clans_urls)),
    path('activities/', include(activities_urls)),
]

api_router = router
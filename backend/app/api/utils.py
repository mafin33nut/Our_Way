from django.urls import include, path 
from app.achievements import api as achievements_api 
from app.user import urls as user_urls 
from app.focus import urls as focus_urls 
from app.clans import urls as clans_urls 
from app.activities import urls as activities_urls
urlpatterns = [
    path('', include('app.user.urls')),
    path('achievements/', include('app.achievements.api')),
    path('focus/', include('app.focus.urls')),
    path('clans/', include('app.clans.urls')),
    path('activities/', include('app.activities.urls')),
]
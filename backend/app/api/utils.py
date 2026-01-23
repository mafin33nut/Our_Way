from django.urls import include, path 
from app.achievements import api as achievements_api 
from app.user import urls as user_urls 
from app.focus import urls as focus_urls 
from app.clans import urls as clans_urls 
from app.activities import urls as activities_urls
urlpatterns = [
    # Users (e.g. /api/users/)
    path('', include('app.user.urls')),

    # Achievements (e.g. /api/achievements/)
    path('achievements/', include('app.achievements.api')),

    # Focus (e.g. /api/focus/)
    path('focus/', include('app.focus.urls')),

    # Clans (e.g. /api/clans/)
    path('clans/', include('app.clans.urls')),

    # Activities (e.g. /api/activities/)
    path('activities/', include('app.activities.urls')),
]
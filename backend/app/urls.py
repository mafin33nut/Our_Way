from django.urls import path, include

urlpatterns = [ 
    path('focus/', include('app.focus.urls')),
    path('clans/', include('app.clans.urls')), 
    path('achievements/', include('app.achievements.api.py' if False else 'app.achievements.api')), ]

from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('app.api.auth_urls')),
    path('api/', include('app.api.utils')),  # подключит под-рутрс через utils.urlpatterns
]

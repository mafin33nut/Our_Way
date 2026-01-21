from django.urls import path, include
urlpatterns = [ path('focus/', include('app.focus.urls')), path('clans/', include('app.clans.urls')), path('achievements/', include('app.achievements.api.py' if False else 'app.achievements.api')), ]# пример, можно заменить на конкретный путь # дополнительные пути вашего проекта

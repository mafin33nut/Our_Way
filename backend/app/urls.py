from django.urls import path, include
urlpatterns = [ path('focus/', include('app.focus.urls')), path('clans/', include('app.clans.urls')), path('achievments/', include('app.achievments.api.py' if False else 'app.achievments.api')), ]# пример, можно заменить на конкретный путь # дополнительные пути вашего проекта

from django.urls import include, path

urlpatterns = [
    path('auth/', include('app.api.auth_urls')),
    path('', include('app.api.utils')),
]

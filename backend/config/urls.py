from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth endpoints (JWT, registration, user info, logout)
    path('api/auth/', include('app.api.auth_urls')),

    # Main API namespace: app.api.utils aggregates app subroutes
    path('api/', include('app.api.utils')),

    # Temporary health endpoint for quick checks (can be removed later)
    path('api/health/', lambda request: JsonResponse({'ok': True})),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
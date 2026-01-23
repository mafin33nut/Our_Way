from django.urls import path, include
from django.http import JsonResponse

urlpatterns = [
    # Auth endpoints (JWT, registration, user info, logout)
    path('api/auth/', include('app.api.auth_urls')),

    # Main API namespace: app.api.utils aggregates app subroutes
    path('api/', include('app.api.utils')),

    # Temporary health endpoint for quick checks (can be removed later)
    path('api/health/', lambda request: JsonResponse({'ok': True})),
]
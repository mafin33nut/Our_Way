from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner_fields = ('created_by', 'user', 'owner')
        for f in owner_fields:
            if hasattr(obj, f):
                try:
                    related = getattr(obj, f)
                except Exception:
                    related = None
                if related == request.user:
                    return True
        return bool(request.user and request.user.is_staff)
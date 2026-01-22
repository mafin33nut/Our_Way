from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    # Use default Django UserAdmin configuration; add list_display for convenience
    list_display = ('username', 'email', 'is_staff', 'is_active')
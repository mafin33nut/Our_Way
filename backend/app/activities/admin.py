from django.contrib import admin 
from .models import ActivityCategory, Activity, ActivityLog, ActivityReward, ActivityTimer

@admin.register(ActivityCategory) 
class ActivityCategoryAdmin(admin.ModelAdmin): 
    list_display = ('id', 'name', 'slug',) 
    search_fields = ('name',)
@admin.register(Activity) 
class ActivityAdmin(admin.ModelAdmin): 
    list_display = ('id', 'title', 'owner', 'category', 'points', 'active', 'created_at') 
    list_filter = ('category', 'active') 
    search_fields = ('title', 'description')
@admin.register(ActivityLog) 
class ActivityLogAdmin(admin.ModelAdmin): 
    list_display = ('id', 'activity', 'user', 'status', 'created_at') 
    list_filter = ('status',)
@admin.register(ActivityReward) 
class ActivityRewardAdmin(admin.ModelAdmin): 
    list_display = ('id', 'activity', 'type', 'value', 'claimed')
@admin.register(ActivityTimer) 
class ActivityTimerAdmin(admin.ModelAdmin): 
    list_display = ('id', 'user', 'activity', 'started_at', 'stopped_at', 'active')

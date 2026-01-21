from django.contrib import admin 
from django.contrib.auth import get_user_model
from app.activities.models import Task, Achievement 
from app.clans.models import Clan, Leaderboard

User = get_user_model()

@admin.register(User) 
class UserAdmin(admin.ModelAdmin): list_display = ("username", "email", "points")

@admin.register(Task) 
class TaskAdmin(admin.ModelAdmin): list_display = ("title", "points")

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin): list_display = ("user", "name", "awarded_at")

@admin.register(Clan) 
class ClanAdmin(admin.ModelAdmin): list_display = ("name", "score")

@admin.register(Leaderboard) 
class LeaderboardAdmin(admin.ModelAdmin): list_display = ("user", "score")
from app.activities.models import Task, Achievement 
from app.clans.models import Clan, Leaderboard

User = get_user_model()

@admin.register(User) 
class UserAdmin(admin.ModelAdmin): 
    list_display = ("username", "email", "points")

@admin.register(Task) 
class TaskAdmin(admin.ModelAdmin): 
    list_display = ("title", "points")

@admin.register(Achievement) 
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "awarded_at")

@admin.register(Clan) 
class ClanAdmin(admin.ModelAdmin): 
    list_display = ("name", "score")

@admin.register(Leaderboard) 
class LeaderboardAdmin(admin.ModelAdmin): 
    list_display = ("user", "score") 
    open(p,"w").write(content) 
    print("wrote", p) 
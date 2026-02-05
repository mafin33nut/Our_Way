from datetime import timedelta

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.utils import timezone
from app.achievements.models import Achievement, UserAchievement
from app.clans.models import Clan, LeaderboardEntry

User = get_user_model()

# Если модель уже зарегистрирована — отменяем регистрацию
if User in admin.site._registry:
    admin.site.unregister(User)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "email",
        "get_points",
        "get_online",
        "is_staff",
        "is_active",
        "last_login",
        "date_joined",
    )
    list_filter = ("is_staff", "is_active")
    search_fields = ("username", "email")

    def get_points(self, obj):
        # Попытка получить поле points напрямую
        if hasattr(obj, "points"):
            return getattr(obj, "points") or 0

        # Если у вас есть связанная модель профиля: user.profile.points
        profile = getattr(obj, "profile", None)
        if profile and hasattr(profile, "points"):
            return getattr(profile, "points") or 0

        # Пример: суммируем очки из выполненных задач (при желании)
        # Uncomment and adjust if you store task points linked to user
        # total = obj.tasks.filter(completed=True).aggregate(total=Sum('points'))['total'] or 0
        # return total

        return 0
    get_points.short_description = "points"
    get_points.admin_order_field = "points"  # если есть поле points, можно сортировать

    def get_online(self, obj):
        cutoff = timezone.now() - timedelta(minutes=5)
        return bool(obj.last_login and obj.last_login >= cutoff)
    get_online.short_description = "online"
    get_online.boolean = True


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("name", "points", "created_by", "created_at")


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ("user", "achievement", "unlocked_at")


@admin.register(Clan)
class ClanAdmin(admin.ModelAdmin):
    list_display = ("name", "created_by", "get_member_count", "is_public", "created_at", "get_score")
    list_filter = ("is_public", "created_at")
    search_fields = ("name", "created_by__username")

    def get_member_count(self, obj):
        return obj.members.count()
    get_member_count.short_description = "members"

    def get_score(self, obj):
        entry = getattr(obj, "leaderboard", None)
        return entry.score if entry else 0
    get_score.short_description = "score"
    get_score.admin_order_field = "leaderboard__score"


@admin.register(LeaderboardEntry)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ("clan", "score", "rank")
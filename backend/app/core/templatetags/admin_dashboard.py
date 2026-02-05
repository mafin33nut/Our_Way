from datetime import timedelta

from django import template
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone

register = template.Library()


@register.inclusion_tag("admin/_user_status_panel.html")
def user_status_panel():
    User = get_user_model()
    users = list(User.objects.all().order_by("username"))

    from app.activities.models import Quest
    try:
        from app.clans.models import ClanQuestParticipant
    except Exception:
        ClanQuestParticipant = None

    palette = [
        "#38bdf8",
        "#f472b6",
        "#a78bfa",
        "#f59e0b",
        "#22c55e",
        "#fb7185",
        "#60a5fa",
        "#f97316",
    ]

    def avatar_color(username: str) -> str:
        if not username:
            return palette[0]
        idx = sum(ord(ch) for ch in username) % len(palette)
        return palette[idx]

    cutoff = timezone.now() - timedelta(minutes=5)
    user_rows = []

    for user in users:
        quests_xp = Quest.objects.filter(user=user, completed=True).aggregate(
            total=Sum("xp_reward")
        )["total"] or 0
        clan_xp = 0
        if ClanQuestParticipant is not None:
            clan_xp = ClanQuestParticipant.objects.filter(
                user=user,
                quest__completed=True,
                contribution__gt=0,
            ).aggregate(total=Sum("quest__xp_reward"))["total"] or 0
        total_xp = quests_xp + clan_xp
        is_online = bool(user.last_login and user.last_login >= cutoff)
        user_rows.append(
            {
                "username": user.username,
                "email": user.email,
                "xp": total_xp,
                "is_online": is_online,
                "letter": (user.username[:1] or "?").upper(),
                "color": avatar_color(user.username),
                "last_login": user.last_login,
            }
        )

    return {"users": user_rows}

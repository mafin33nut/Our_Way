from django.dispatch import receiver
from .signals import activity_completed, reward_claimed
from app.achievements.models import UserAchievement
from django.utils import timezone

@receiver(activity_completed)
def on_activity_completed(sender, activity_log=None, **kwargs):
    # Example receiver: create a UserAchievement when a user completes 10 activities (simple heuristic)
    user = getattr(activity_log, 'user', None)
    if not user:
        return

    # Count completed logs
    from .models import ActivityLog

    completed_count = ActivityLog.objects.filter(user=user, status='completed').count()
    if completed_count and completed_count % 10 == 0:
        # create a simple achievement if exists with slug 'completed-10'
        try:
            ach = None
            from app.achievements.models import Achievement

            ach = Achievement.objects.filter(name__icontains='Completed 10').first()
            if ach:
                UserAchievement.objects.get_or_create(user=user, achievement=ach)
        except Exception:
            pass


@receiver(reward_claimed)
def on_reward_claimed(sender, reward=None, user=None, **kwargs):
    # notify user
    try:
        from app.core.services import NotificationService

        NotificationService.send(
            user,
            f'Reward claimed: {reward.type} for activity {getattr(reward.activity, "title", "?")}'
        )
    except Exception:
        pass
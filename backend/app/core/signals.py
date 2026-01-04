from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Task, Achievement, Leaderboard, Clan

@receiver(post_save, sender=Task)
def update_points_on_task_completion(sender, instance, created, **kwargs):
    if created:
        for user in instance.completed_by.all():
            user.points = models.F('points') + instance.points
            user.save(update_fields=['points'])
            Leaderboard.objects.update_or_create(user=user, defaults={"score": user.points})

@receiver(post_save, sender=Achievement)
def honor_achievement(sender, instance, created, **kwargs):
    if created:
        user = instance.user
        clans = user.clans.all()
        for clan in clans:
            clan.score = clan.score + 5
            clan.save(update_fields=["score"])
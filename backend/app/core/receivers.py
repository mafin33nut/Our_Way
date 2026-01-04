from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Task, Achievement, Leaderboard, Clan

User = get_user_model()

@receiver(post_save, sender=User)
def ensure_leaderboard_entry(sender, instance, created, **kwargs):
    if created:
        Leaderboard.objects.create(user=instance, score=0)

@receiver(post_save, sender=User)
def user_named_event(sender, instance, created, **kwargs):
    # Пример: можно автоматом создать приветственное достижение
    if created:
        Achievement.objects.create(user=instance, name="Welcome Aboard", description="Добро пожаловать в сообщество!")
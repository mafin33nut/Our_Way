from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.conf import settings
from datetime import timedelta

from app.notifications.models import EmailNotification
from app.activities.models import Activity
from app.focus.models import FocusMission
from app.clans.models import ClanQuest

# время до дедлайна, за которое отправлять напоминание (можно сделать настраиваемым)
REMINDER_DELTA = getattr(settings, 'NOTIFICATION_REMINDER_DELTA', timedelta(hours=1))

def schedule_deadline_notification(user, subject, body, scheduled_for):
    # Create or update existing pending notification for same user+subject+scheduled_for
    EmailNotification.objects.create(user=user, subject=subject, body=body, scheduled_for=scheduled_for)

# Activity reminders
@receiver(post_save, sender=Activity)
def activity_deadline_notification(sender, instance: Activity, created, **kwargs):
    if instance.due_date:
        scheduled_for = instance.due_date - REMINDER_DELTA
        if scheduled_for <= timezone.now():
            # если уже близко/просрочено — поставить как ASAP (сейчас)
            scheduled_for = timezone.now()
        subject = f'Напоминание: задача "{instance.title}" скоро будет завершена'
        body = f'Ваша задача "{instance.title}" имеет дедлайн {instance.due_date}. Пожалуйста, завершите её вовремя.'
        try:
            schedule_deadline_notification(instance.owner, subject, body, scheduled_for)
        except Exception:
            pass

# FocusMission reminders
@receiver(post_save, sender=FocusMission)
def focus_mission_deadline_notification(sender, instance: FocusMission, created, **kwargs):
    if instance.due_date:
        scheduled_for = instance.due_date - REMINDER_DELTA
        if scheduled_for <= timezone.now():
            scheduled_for = timezone.now()
        subject = f'Напоминание: миссия "{instance.title}" скоро завершится'
        body = f'Миссия "{instance.title}" проекта {instance.project.name} имеет дедлайн {instance.due_date}.'
        try:
            # отправляем пользователю, который создал проект
            schedule_deadline_notification(instance.project.created_by, subject, body, scheduled_for)
        except Exception:
            pass

# ClanQuest reminders
@receiver(post_save, sender=ClanQuest)
def clan_quest_deadline_notification(sender, instance: ClanQuest, created, **kwargs):
    if instance.due_date:
        scheduled_for = instance.due_date - REMINDER_DELTA
        if scheduled_for <= timezone.now():
            scheduled_for = timezone.now()
        subject = f'Напоминание: квест "{instance.title}" клана {instance.clan.name} скоро завершится'
        body = f'Квест "{instance.title}" в клане {instance.clan.name} имеет дедлайн {instance.due_date}.'
        try:
            schedule_deadline_notification(instance.clan.created_by, subject, body, scheduled_for)
        except Exception:
            pass
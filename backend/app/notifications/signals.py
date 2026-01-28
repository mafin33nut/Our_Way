from django.db.models.signals import post_save
from django.dispatch import receiver
from app.notifications.models import EmailNotification
from app.notifications.tasks import run_scheduled_notifications

# Пример: при создании EmailNotification можно попробовать немедленно выполнить отправку
@receiver(post_save, sender=EmailNotification)
def email_notification_created(sender, instance, created, **kwargs):
    if created and instance.scheduled_for <= instance.created_at:
        # если scheduled_for уже прошёл — отправляем немедленно
        try:
            from .tasks import run_scheduled_notifications
            run_scheduled_notifications()
        except Exception:
            pass
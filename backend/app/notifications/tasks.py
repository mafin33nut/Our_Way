"""
Простейшая задача для запуска периодически (через cron, celery beat или django-crontab).
Задача ищет несентные уведомления, время для которых наступило, и отправляет их.
"""
from django.utils import timezone
from .models import EmailNotification
from .services import send_email_notification

def run_scheduled_notifications():
    now = timezone.now()
    pending = EmailNotification.objects.filter(sent=False, scheduled_for__lte=now)
    for note in pending:
        try:
            send_email_notification(to_email=note.user.email, subject=note.subject, body=note.body)
            note.sent = True
            note.sent_at = timezone.now()
            note.save(update_fields=['sent', 'sent_at'])
        except Exception:
            # логирование можно тут добавить
            continue
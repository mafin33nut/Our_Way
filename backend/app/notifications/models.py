from django.db import models
from django.conf import settings

class EmailNotification(models.Model):
    """
    Запланированное уведомление по email.
    Можно использовать для одноразовых уведомлений о приближении дедлайна.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='email_notifications')
    subject = models.CharField(max_length=255)
    body = models.TextField()
    scheduled_for = models.DateTimeField()  # когда отправить
    sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-scheduled_for']
        indexes = [
            models.Index(fields=['scheduled_for']),
            models.Index(fields=['sent']),
        ]

    def __str__(self):
        return f'EmailNotification to {self.user} at {self.scheduled_for} (sent={self.sent})'
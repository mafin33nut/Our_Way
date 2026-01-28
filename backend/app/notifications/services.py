from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone

def send_email_notification(to_email: str, subject: str, body: str, html_message: str = None):
    """
    Отправляет простой email. Настройка EMAIL_BACKEND в settings.py требуется.
    """
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
    send_mail(
        subject=subject,
        message=body,
        from_email=from_email,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )

def send_notification_to_user(user, subject: str, body: str, html_template: str = None, context: dict = None):
    """
    Утилита: формирует сообщение (опционально с html шаблоном) и вызывает send_email_notification.
    """
    context = context or {}
    text = body
    html = None
    if html_template:
        html = render_to_string(html_template, context)
        # при необходимости можно также сгенерировать текстовую версию шаблона
        text = render_to_string(html_template, context)
    email = getattr(user, 'email', None)
    if not email:
        return False
    send_email_notification(to_email=email, subject=subject, body=text, html_message=html)
    return True
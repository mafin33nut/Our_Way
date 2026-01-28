from django.apps import AppConfig

class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.notifications'
    verbose_name = 'Notifications'

    def ready(self):
        # импорт receivers, чтобы регистрация сигналов сработала при старте
        try:
            import app.notifications.signals  # noqa: F401
        except Exception:
            pass
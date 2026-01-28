from django.apps import AppConfig

class ActivitiesConfig(AppConfig): 
    default_auto_field = 'django.db.models.BigAutoField' 
    name = 'app.activities' 
    verbose_name = 'Activities (RPG tasks & rewards)'

def ready(self):
    # import signals/receivers
    try:
        import app.activities.signals  # noqa
        import app.activities.receivers  # noqa
    except Exception:
        # avoid import errors during migrations/initial setup
        pass
# core/apps.py

from django.apps import AppConfig

class AppConfig(AppConfig):
    name = "core"
    verbose_name = "Core"

    def ready(self):
        import core.signals  # noqa: F401
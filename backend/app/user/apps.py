from django.apps import AppConfig import logging

logger = logging.getLogger(name)

class UsersConfig(AppConfig): name = "users" verbose_name = "Users"

def ready(self):
    try:
        import users.signals
        logger.info("Users app ready; signals loaded.")
    except Exception as e:
        logger.exception("Error during users app initialization: %s", e)
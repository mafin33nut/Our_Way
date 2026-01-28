from django.apps import AppConfig
from django.core.management import call_command
from django.db import connection, OperationalError
import sys
import os

class ClansConfig(AppConfig): 
    default_auto_field = 'django.db.models.BigAutoField' 
    name = 'app.clans' 
    verbose_name = 'Clans RPG – Гильдии и кланы'
    
    def ready(self):
        if 'migrate' in sys.argv or 'makemigrations' in sys.argv or 'test' in sys.argv:
            return
        
        if os.environ.get('RUN_MAIN') != 'true':
            return
        
        try:
            with connection.cursor() as cursor:
                if connection.vendor == 'sqlite':
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='clans_clan'")
                    table_exists = cursor.fetchone() is not None
                else:
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = 'clans_clan'
                        );
                    """)
                    table_exists = cursor.fetchone()[0]
                
                if not table_exists:
                    try:
                        call_command('migrate', 'clans', verbosity=0, interactive=False)
                    except Exception:
                        pass
        except (OperationalError, Exception):
            try:
                call_command('migrate', 'clans', verbosity=0, interactive=False)
            except Exception:
                pass

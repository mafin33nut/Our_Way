import os
import sys
from pathlib import Path

def main():
    """Run administrative tasks."""
    # Ensure backend directory is on sys.path so imports resolve
    here = Path(__file__).resolve().parent  # backend/
    if str(here) not in sys.path:
        sys.path.insert(0, str(here))
    repo_root = here.parent
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))

    # Use config.settings (file exists at backend/config/settings.py)
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
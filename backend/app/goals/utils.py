from django.utils import timezone

def today_str():
    return timezone.now().date().isoformat()
def slugify(value: str) -> str:
    from django.utils.text import slugify as dj_slugify
    return dj_slugify(value)

def format_datetime(dt):
    return dt.strftime("%Y-%m-%d %H:%M:%S") if dt else ""
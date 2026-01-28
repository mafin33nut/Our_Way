from django.db.models.signals import post_save 
from django.dispatch import receiver 
from django.conf import settings 
from .models import CoreSetting
@receiver(post_save, sender=settings.AUTH_USER_MODEL) 
def user_created(sender, instance, created, **kwargs): 
    if created: 
        CoreSetting.objects.get_or_create(key=f'profile_{instance.id}', defaults={'value': 'new'})

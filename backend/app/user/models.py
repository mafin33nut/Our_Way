from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return self.username
from django.db import models

class SampleModel(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
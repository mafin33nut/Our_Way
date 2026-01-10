from django.db import models
from django.conf import settings

class Clan(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clans_created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ClanMember(models.Model):
    clan = models.ForeignKey(Clan, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clan_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=50, default='member')

    class Meta:
        unique_together = ('clan', 'user')

class ClanQuest(models.Model):
    clan = models.ForeignKey(Clan, on_delete=models.CASCADE, related_name='quests')
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    points = models.PositiveIntegerField(default=20)
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.title} (clan {self.clan.name})'

from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password

class Clan(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clans_created')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    is_public = models.BooleanField(default=True)
    join_password = models.CharField(max_length=128, blank=True)

    def __str__(self):
        return self.name

    def set_join_password(self, raw_password: str | None):
        if raw_password:
            self.join_password = make_password(raw_password)
        else:
            self.join_password = ''

    def check_join_password(self, raw_password: str | None) -> bool:
        if not self.join_password:
            return False
        return check_password(raw_password or '', self.join_password)

class ClanMember(models.Model):
    clan = models.ForeignKey(Clan, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clan_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=50, default='member')

    class Meta:
        unique_together = ('clan', 'user')

class ClanQuest(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    clan = models.ForeignKey(Clan, on_delete=models.CASCADE, related_name='quests')
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    xp_reward = models.PositiveIntegerField(default=20)
    required_progress = models.PositiveIntegerField(default=100)
    total_progress = models.PositiveIntegerField(default=0)
    max_participants = models.PositiveIntegerField(default=1)
    completed = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title} (clan {self.clan.name})'


class ClanQuestParticipant(models.Model):
    quest = models.ForeignKey(ClanQuest, on_delete=models.CASCADE, related_name='participant_entries')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clan_quest_participations')
    contribution = models.PositiveIntegerField(default=0)
    contributed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('quest', 'user')

    def __str__(self):
        return f'{self.user.username} -> {self.quest.title}'


class ClanJoinRequest(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    clan = models.ForeignKey(Clan, on_delete=models.CASCADE, related_name='join_requests')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clan_join_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('clan', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} -> {self.clan.name} ({self.status})'


class ClanMessage(models.Model):
    clan = models.ForeignKey(Clan, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clan_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.user.username}: {self.content[:30]}'

class LeaderboardEntry(models.Model):
    clan = models.OneToOneField(Clan, on_delete=models.CASCADE, related_name='leaderboard')
    score = models.BigIntegerField(default=0, db_index=True)
    rank = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Leaderboard entry"
        verbose_name_plural = "Leaderboard entries"
        ordering = ['-score', 'rank']
        indexes = [
            models.Index(fields=['-score']),
            models.Index(fields=['rank']),
        ]

    def __str__(self):
        return f"{self.clan.name}: {self.score} (#{self.rank or '-'})"

    def recalc_score(self):
        total = self.clan.quests.filter(completed=True).aggregate(
            total=models.Sum('xp_reward')
        )['total'] or 0
        self.score = total
        self.save(update_fields=['score', 'updated_at'])

    @classmethod
    def recompute_ranks(cls):
        with transaction.atomic():
            entries = list(cls.objects.select_for_update().order_by('-score', 'updated_at'))
            for idx, entry in enumerate(entries, start=1):
                if entry.rank != idx:
                    entry.rank = idx
                    entry.save(update_fields=['rank'])

from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Clan)
def ensure_leaderboard_entry(sender, instance: Clan, created, **kwargs):
    if created:
        LeaderboardEntry.objects.get_or_create(clan=instance)
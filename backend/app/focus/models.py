from django.db import models
from django.conf import settings

class FocusProject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='focus_projects')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class FocusMission(models.Model):
    project = models.ForeignKey(FocusProject, on_delete=models.CASCADE, related_name='missions')
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    points = models.PositiveIntegerField(default=10)
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)

class Meta:
        ordering = ['-due_date', 'title']

    def __str__(self):
        return f'{self.title} ({self.project.name})'

class FocusMemberProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='focus_progress')
    project = models.ForeignKey(FocusProject, on_delete=models.CASCADE, related_name='member_progress')
    joined_at = models.DateTimeField(auto_now_add=True)
    total_points = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'project')

    def add_points(self, points: int):
        self.total_points = max(0, self.total_points + points)
        self.save()

    def __str__(self):
        return f'{self.user.username} in {self.project.name}'

class FocusLevel(models.Model):
    level = models.PositiveIntegerField(primary_key=True)
    required_points = models.PositiveIntegerField()

    def __str__(self):
        return f'Level {self.level} (requires {self.required_points} XP)'

class FocusExperience(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='focus_xp')
    points = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

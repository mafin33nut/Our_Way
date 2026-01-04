from django.utils import timezone
from .models import Task, Achievement, Leaderboard

def award_task(user, task: Task):
    """
    Пример функции-услуги: пользователь выполняет задачу.
    """
    if task not in user.completed_tasks.all():
        task.completed_by.add(user)
        task.save()
        # Обновляем очки пользователя
        user.points = user.points + task.points
        user.save(update_fields=["points"])
        Leaderboard.objects.update_or_create(user=user, defaults={"score": user.points})
        # Выдать достижение
        Achievement.objects.create(user=user, name=f"Completed: {task.title}", task=task)
        return True
    return False
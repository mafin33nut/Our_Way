from django.utils import timezone
from .models import Goal

def create_goal(user, title, description="", due_date=None):
    goal = Goal.objects.create(
        user=user,
        title=title,
        description=description,
        due_date=due_date
    )
    return goal

def mark_goal_complete(goal_id: int):
    goal = Goal.objects.get(id=goal_id)
    goal.completed = True
    goal.save()
    return goal
from rest_framework import serializers
from .models import Goal, Milestone

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ('id', 'title', 'due_date', 'completed')

class GoalSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = ('id', 'user', 'title', 'description', 'created_at', 'due_date', 'completed', 'milestones')
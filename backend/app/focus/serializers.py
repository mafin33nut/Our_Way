from rest_framework import serializers
from .models import FocusProject, FocusMission, FocusMemberProgress, FocusExperience

class FocusProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusProject
        fields = ['id', 'name', 'description', 'created_by', 'created_at']

class FocusMissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusMission
        fields = ['id', 'project', 'title', 'description', 'points', 'due_date', 'completed']

class FocusMemberProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusMemberProgress
        fields = ['id', 'user', 'project', 'joined_at', 'total_points']

class FocusExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusExperience
        fields = ['id', 'user', 'points', 'timestamp']

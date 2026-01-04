from rest_framework import serializers
from .models import User, Task, Clan, Achievement, Leaderboard

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "points")

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ("id", "title", "description", "points")

class ClanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clan
        fields = ("id", "name", "score")

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ("id", "name", "description", "awarded_at", "task")

class LeaderboardSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Leaderboard
        fields = ("user", "score")
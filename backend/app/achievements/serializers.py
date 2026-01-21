from rest_framework import serializers 
from .models import Achievement, UserAchievement

class AchievementSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = Achievement 
        fields = ['id', 'name', 'description', 'points', 'created_by', 'created_at']
class UserAchievementSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = UserAchievement 
        fields = ['id', 'user', 'achievement', 'unlocked_at']

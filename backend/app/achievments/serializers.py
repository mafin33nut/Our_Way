from rest_framework import serializers from .models import Character, Quest, Skill, Achievement

class SkillSerializer(serializers.ModelSerializer): class Meta: model = Skill fields = ("id", "name", "description")

class CharacterSerializer(serializers.ModelSerializer): skills = SkillSerializer(many=True, read_only=True)

class Meta:
    model = Character
    fields = ("id", "name", "level", "experience", "next_level_exp", "skills")
class QuestSerializer(serializers.ModelSerializer): class Meta: model = Quest fields = ("id", "title", "description", "experience_reward", "is_completed", "created_at")

class AchievementSerializer(serializers.ModelSerializer): class Meta: model = Achievement fields = ("id", "code", "name", "description", "points")
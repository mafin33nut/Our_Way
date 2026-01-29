from django.db import models
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)
    level = serializers.SerializerMethodField()
    xp = serializers.SerializerMethodField()
    xp_to_next_level = serializers.SerializerMethodField()
    total_quests_completed = serializers.SerializerMethodField()
    current_focus = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'avatar', 'has_seen_welcome', 'level', 'xp', 'xp_to_next_level',
            'total_quests_completed', 'current_focus',
            'password', 'password2',
        ]
        read_only_fields = ['id', 'level', 'xp', 'xp_to_next_level', 'total_quests_completed', 'current_focus']
    
    def _get_total_xp(self, obj) -> int:
        try:
            from app.activities.models import Quest
            return Quest.objects.filter(user=obj, completed=True).aggregate(
                total=models.Sum('xp_reward')
            )['total'] or 0
        except Exception:
            return 0

    def _level_from_xp(self, total_xp: int) -> int:
        if total_xp < 50:
            return 1
        if total_xp < 150:
            return 2
        if total_xp < 375:
            return 3
        return 4 + (total_xp - 375) // 300

    def _next_level_threshold(self, level: int) -> int:
        if level <= 1:
            return 50
        if level == 2:
            return 150
        if level == 3:
            return 375
        return 375 + (level - 3) * 300

    def get_level(self, obj):
        total_xp = self._get_total_xp(obj)
        return int(self._level_from_xp(total_xp))
    
    def get_xp(self, obj):
        return int(self._get_total_xp(obj))
    
    def get_xp_to_next_level(self, obj):
        level = self.get_level(obj)
        total_xp = self._get_total_xp(obj)
        next_threshold = self._next_level_threshold(level)
        return max(next_threshold - total_xp, 0)
    
    def get_total_quests_completed(self, obj):
        try:
            from app.activities.models import Quest
            return Quest.objects.filter(user=obj, completed=True).count()
        except Exception:
            return 0
    
    def get_current_focus(self, obj):
        return None

    def validate(self, attrs):
        p = attrs.get('password')
        p2 = attrs.get('password2')
        if p or p2:
            if p != p2:
                raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
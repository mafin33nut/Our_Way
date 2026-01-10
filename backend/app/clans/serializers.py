from rest_framework import serializers
from .models import Clan, ClanMember, ClanQuest

class ClanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clan
        fields = ['id', 'name', 'description', 'created_by', 'created_at']

class ClanMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClanMember
        fields = ['id', 'clan', 'user', 'joined_at', 'role']

class ClanQuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClanQuest
        fields = ['id', 'clan', 'title', 'description', 'points', 'due_date', 'completed']

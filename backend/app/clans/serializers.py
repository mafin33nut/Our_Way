from rest_framework import serializers 
from .models import Clan, ClanMember, ClanQuest
from django.db.models import Sum

class ClanMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    level = serializers.SerializerMethodField()
    contribution = serializers.IntegerField(default=0)
    
    class Meta: 
        model = ClanMember 
        fields = ['id', 'username', 'level', 'contribution']
    
    def get_level(self, obj):
        return getattr(obj.user, 'level', 1)

class ClanSerializer(serializers.ModelSerializer):
    level = serializers.SerializerMethodField()
    total_xp = serializers.SerializerMethodField()
    members = ClanMemberSerializer(source='members', many=True, read_only=True)
    
    class Meta: 
        model = Clan 
        fields = ['id', 'name', 'level', 'total_xp', 'members']
    
    def get_level(self, obj):
        return 1
    
    def get_total_xp(self, obj):
        from app.activities.models import Quest
        return Quest.objects.filter(
            user__clan_memberships__clan=obj,
            completed=True
        ).aggregate(total=Sum('xp_reward'))['total'] or 0

class ClanQuestParticipantSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    level = serializers.IntegerField()
    contribution = serializers.IntegerField()

class ClanQuestSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    expires_at = serializers.DateTimeField(source='due_date', read_only=True)
    
    class Meta: 
        model = ClanQuest 
        fields = ['id', 'clan', 'title', 'description', 'difficulty', 'xp_reward', 
                  'required_progress', 'total_progress', 'completed', 'expires_at', 'participants']
    
    def get_participants(self, obj):
        from app.clans.models import ClanMember
        members = ClanMember.objects.filter(clan=obj.clan)
        participants = []
        for member in members:
            participants.append({
                'id': member.user.id,
                'username': member.user.username,
                'level': getattr(member.user, 'level', 1),
                'contribution': 0,
            })
        return participants

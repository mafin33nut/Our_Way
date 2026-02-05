from rest_framework import serializers 
from .models import Clan, ClanMember, ClanQuest, ClanQuestParticipant, ClanJoinRequest, ClanMessage
from django.db.models import Sum

class ClanMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    level = serializers.SerializerMethodField()
    contribution = serializers.IntegerField(default=0)
    role = serializers.CharField(read_only=True)
    
    class Meta: 
        model = ClanMember 
        fields = ['id', 'username', 'level', 'contribution', 'role']
    
    def get_level(self, obj):
        try:
            from app.user.serializers import UserSerializer
            user_data = UserSerializer(obj.user).data
            return user_data.get('level', 1)
        except:
            return 1

class ClanSerializer(serializers.ModelSerializer):
    level = serializers.SerializerMethodField()
    total_xp = serializers.SerializerMethodField()
    members = ClanMemberSerializer(many=True, read_only=True)
    join_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    requires_password = serializers.SerializerMethodField()
    
    class Meta: 
        model = Clan 
        fields = [
            'id',
            'name',
            'description',
            'is_public',
            'join_password',
            'requires_password',
            'level',
            'total_xp',
            'members',
        ]
        read_only_fields = ['id', 'level', 'total_xp', 'members', 'requires_password']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True}
        }
    
    def get_level(self, obj):
        return 1
    
    def get_total_xp(self, obj):
        try:
            return ClanQuest.objects.filter(
                clan=obj,
                completed=True
            ).aggregate(total=Sum('xp_reward'))['total'] or 0
        except Exception as e:
            return 0

    def get_requires_password(self, obj):
        return not obj.is_public

    def validate(self, attrs):
        is_public = attrs.get('is_public', True)
        join_password = attrs.get('join_password', '')
        if not is_public and not join_password:
            raise serializers.ValidationError({'join_password': 'Для приватного клана нужен пароль.'})
        return attrs

    def create(self, validated_data):
        join_password = validated_data.pop('join_password', '')
        clan = Clan(**validated_data)
        if clan.is_public:
            clan.set_join_password(None)
        else:
            clan.set_join_password(join_password)
        clan.save()
        return clan

class ClanQuestParticipantSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    level = serializers.SerializerMethodField()

    class Meta:
        model = ClanQuestParticipant
        fields = ['id', 'username', 'level', 'contribution']

    def get_level(self, obj):
        try:
            from app.user.serializers import UserSerializer
            user_data = UserSerializer(obj.user).data
            return user_data.get('level', 1)
        except Exception:
            return 1

class ClanQuestSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    expires_at = serializers.DateTimeField(read_only=True)
    participant_count = serializers.SerializerMethodField()
    
    class Meta: 
        model = ClanQuest 
        fields = ['id', 'clan', 'title', 'description', 'difficulty', 'xp_reward',
                  'required_progress', 'total_progress', 'max_participants', 'completed', 'expires_at',
                  'participants', 'participant_count']
        read_only_fields = ['xp_reward', 'required_progress', 'total_progress', 'completed', 'expires_at']
    
    def get_participants(self, obj):
        participants = ClanQuestParticipant.objects.filter(quest=obj).select_related('user')
        return ClanQuestParticipantSerializer(participants, many=True).data

    def get_participant_count(self, obj):
        return ClanQuestParticipant.objects.filter(quest=obj).count()


class ClanJoinRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    clan_name = serializers.CharField(source='clan.name', read_only=True)

    class Meta:
        model = ClanJoinRequest
        fields = ['id', 'clan', 'clan_name', 'user', 'username', 'status', 'created_at']
        read_only_fields = ['id', 'user', 'username', 'status', 'created_at', 'clan_name']


class ClanMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ClanMessage
        fields = ['id', 'clan', 'user', 'username', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'username', 'created_at']

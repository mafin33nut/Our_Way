from rest_framework import viewsets, permissions, status, serializers
from datetime import timedelta
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from .models import Clan, ClanMember, ClanQuest, ClanQuestParticipant, ClanJoinRequest, ClanMessage
from .serializers import (
    ClanSerializer,
    ClanMemberSerializer,
    ClanQuestSerializer,
    ClanJoinRequestSerializer,
    ClanMessageSerializer,
)
import random

class ClanViewSet(viewsets.ModelViewSet): 
    queryset = Clan.objects.all() 
    serializer_class = ClanSerializer 
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Clan.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            clan = serializer.save(created_by=request.user)
            
            ClanMember.objects.get_or_create(
                clan=clan,
                user=request.user,
                defaults={'role': 'leader'}
            )
            
            clan.refresh_from_db()
            response_serializer = self.get_serializer(clan)
            headers = self.get_success_headers(response_serializer.data)
            return Response(response_serializer.data, status=201, headers=headers)
        except Exception as e:
            import traceback
            from django.core.management import call_command
            error_msg = str(e).lower()
            
            if 'no such table' in error_msg or 'does not exist' in error_msg or 'relation' in error_msg:
                try:
                    call_command('migrate', 'clans', verbosity=0, interactive=False)
                    serializer = self.get_serializer(data=request.data)
                    serializer.is_valid(raise_exception=True)
                    clan = serializer.save(created_by=request.user)
                    ClanMember.objects.get_or_create(
                        clan=clan,
                        user=request.user,
                        defaults={'role': 'leader'}
                    )
                    clan.refresh_from_db()
                    response_serializer = self.get_serializer(clan)
                    headers = self.get_success_headers(response_serializer.data)
                    return Response(response_serializer.data, status=201, headers=headers)
                except Exception as retry_error:
                    traceback.print_exc()
                    return Response({
                        'detail': 'Database migration required. Please run: python manage.py migrate clans',
                        'error': str(retry_error)
                    }, status=500)
            
            traceback.print_exc()
            return Response({'detail': str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def my(self, request):
        clans = Clan.objects.filter(members__user=request.user).distinct()
        serializer = self.get_serializer(clans, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        clan = self.get_object()
        member = ClanMember.objects.filter(clan=clan, user=request.user).first()
        if not member:
            return Response({'detail': 'Вы не состоите в этом клане.'}, status=status.HTTP_400_BAD_REQUEST)
        member_count = ClanMember.objects.filter(clan=clan).count()
        if member_count <= 1:
            clan.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        was_leader = member.role == 'leader'
        member.delete()
        if was_leader:
            new_leader = ClanMember.objects.filter(clan=clan).first()
            if new_leader and new_leader.role != 'leader':
                new_leader.role = 'leader'
                new_leader.save(update_fields=['role'])
        return Response(status=status.HTTP_204_NO_CONTENT)

class ClanMemberViewSet(viewsets.ModelViewSet): 
    queryset = ClanMember.objects.all() 
    serializer_class = ClanMemberSerializer 
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        return Response(
            {'detail': 'Отправьте запрос на вступление в клан.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def _can_manage(self, clan, user) -> bool:
        is_creator = clan.created_by == user
        is_leader = ClanMember.objects.filter(clan=clan, user=user, role='leader').exists()
        return is_creator or is_leader

    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        member = self.get_object()
        if not self._can_manage(member.clan, request.user):
            return Response({'detail': 'Только лидер клана может назначать лидеров.'}, status=403)
        member.role = 'leader'
        member.save(update_fields=['role'])
        return Response(self.get_serializer(member).data)

    @action(detail=True, methods=['post'])
    def remove(self, request, pk=None):
        member = self.get_object()
        if not self._can_manage(member.clan, request.user):
            return Response({'detail': 'Только лидер клана может исключать участников.'}, status=403)
        if member.clan.created_by_id == member.user_id:
            return Response({'detail': 'Нельзя исключить создателя клана.'}, status=400)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CurrentClanView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            clan_membership = request.user.clan_memberships.first()
            if not clan_membership:
                return Response({'detail': 'Not in a clan'}, status=404)
            
            clan = clan_membership.clan
            serializer = ClanSerializer(clan)
            return Response(serializer.data)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)

class ClanQuestViewSet(viewsets.ModelViewSet):
    queryset = ClanQuest.objects.all()
    serializer_class = ClanQuestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        clan_ids = user.clan_memberships.values_list('clan_id', flat=True)
        return self.queryset.filter(clan_id__in=clan_ids)

    def create(self, request, *args, **kwargs):
        clan_id = request.data.get('clan')
        if not clan_id:
            return Response({'detail': 'Клан обязателен.'}, status=status.HTTP_400_BAD_REQUEST)
        if not ClanMember.objects.filter(clan_id=clan_id, user=request.user).exists():
            return Response({'detail': 'Вы не состоите в выбранном клане.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        max_participants = max(serializer.validated_data.get('max_participants') or 1, 1)
        serializer.save(
            xp_reward=0,
            required_progress=max_participants,
            total_progress=0,
            completed=False,
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _calculate_xp_reward(participant_count: int) -> int:
        if participant_count <= 0:
            return 0
        if participant_count == 1:
            return 30
        if participant_count == 2:
            return 70
        if participant_count == 3:
            return 110
        if participant_count == 4:
            return 150
        return 150 + (participant_count - 4) * 60

    @action(detail=True, methods=['post'])
    def contribute(self, request, pk=None):
        quest = self.get_object()
        if quest.completed:
            return Response(ClanQuestSerializer(quest).data)
        participant, created = ClanQuestParticipant.objects.get_or_create(
            quest=quest,
            user=request.user,
            defaults={'contribution': 1},
        )
        participant_count = ClanQuestParticipant.objects.filter(quest=quest).count()
        quest.total_progress = participant_count
        quest.required_progress = max(quest.max_participants or 1, 1)
        if participant_count >= quest.required_progress:
            if quest.created_at and timezone.now() - quest.created_at < timedelta(seconds=30):
                quest.save(update_fields=['total_progress', 'required_progress'])
                return Response(ClanQuestSerializer(quest).data)
            quest.completed = True
            quest.xp_reward = self._calculate_xp_reward(participant_count)
        quest.save(update_fields=['total_progress', 'completed', 'xp_reward', 'required_progress'])
        return Response(ClanQuestSerializer(quest).data)


class ClanJoinRequestViewSet(viewsets.ModelViewSet):
    queryset = ClanJoinRequest.objects.select_related('clan', 'user')
    serializer_class = ClanJoinRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        clan_id = self.request.query_params.get('clan')
        if clan_id:
            if ClanMember.objects.filter(clan_id=clan_id, user=user).exists() or Clan.objects.filter(
                id=clan_id, created_by=user
            ).exists():
                return self.queryset.filter(clan_id=clan_id)
            return self.queryset.none()
        return self.queryset.filter(
            Q(user=user)
            | Q(clan__created_by=user)
            | Q(clan__members__user=user, clan__members__role='leader')
        ).distinct()

    def create(self, request, *args, **kwargs):
        clan_id = request.data.get('clan')
        join_password = request.data.get('join_password')
        if not clan_id:
            return Response({'detail': 'Клан обязателен.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            clan = Clan.objects.get(id=clan_id)
        except Clan.DoesNotExist:
            return Response({'detail': 'Клан не найден.'}, status=status.HTTP_404_NOT_FOUND)
        if ClanMember.objects.filter(clan=clan, user=request.user).exists():
            return Response({'detail': 'Вы уже состоите в клане.'}, status=status.HTTP_400_BAD_REQUEST)
        if not clan.is_public and not clan.check_join_password(join_password):
            return Response({'detail': 'Неверный пароль для клана.'}, status=status.HTTP_403_FORBIDDEN)

        join_request, created = ClanJoinRequest.objects.get_or_create(
            clan=clan,
            user=request.user,
            defaults={'status': ClanJoinRequest.STATUS_PENDING},
        )
        if not created and join_request.status == ClanJoinRequest.STATUS_APPROVED:
            return Response({'detail': 'Запрос уже одобрен.'}, status=status.HTTP_400_BAD_REQUEST)
        if not created and join_request.status == ClanJoinRequest.STATUS_REJECTED:
            join_request.status = ClanJoinRequest.STATUS_PENDING
            join_request.save(update_fields=['status', 'updated_at'])

        serializer = self.get_serializer(join_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _can_manage_request(user, clan) -> bool:
        if clan.created_by_id == getattr(user, 'id', None):
            return True
        if ClanMember.objects.filter(clan=clan, user=user, role='leader').exists():
            return True
        only_member = ClanMember.objects.filter(clan=clan).first()
        return only_member and only_member.user_id == getattr(user, 'id', None)

    def _get_join_request(self, pk):
        try:
            return ClanJoinRequest.objects.select_related('clan', 'user').get(pk=pk)
        except ClanJoinRequest.DoesNotExist:
            return None

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        join_request = self._get_join_request(pk)
        if not join_request:
            return Response({'detail': 'Запрос не найден.'}, status=404)
        if not self._can_manage_request(request.user, join_request.clan):
            return Response({'detail': 'Только лидер клана может одобрить запрос.'}, status=403)
        if join_request.status == ClanJoinRequest.STATUS_APPROVED:
            return Response(self.get_serializer(join_request).data)
        join_request.status = ClanJoinRequest.STATUS_APPROVED
        join_request.save(update_fields=['status', 'updated_at'])
        ClanMember.objects.get_or_create(
            clan=join_request.clan,
            user=join_request.user,
            defaults={'role': 'member'}
        )
        return Response(self.get_serializer(join_request).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        join_request = self._get_join_request(pk)
        if not join_request:
            return Response({'detail': 'Запрос не найден.'}, status=404)
        if not self._can_manage_request(request.user, join_request.clan):
            return Response({'detail': 'Только лидер клана может отклонить запрос.'}, status=403)
        join_request.status = ClanJoinRequest.STATUS_REJECTED
        join_request.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(join_request).data)


class ClanMessageViewSet(viewsets.ModelViewSet):
    queryset = ClanMessage.objects.select_related('clan', 'user')
    serializer_class = ClanMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        clan_ids = ClanMember.objects.filter(user=user).values_list('clan_id', flat=True)
        queryset = self.queryset.filter(clan_id__in=clan_ids)
        clan_id = self.request.query_params.get('clan')
        if clan_id:
            queryset = queryset.filter(clan_id=clan_id)
        return queryset

    def perform_create(self, serializer):
        clan_id = self.request.data.get('clan')
        if not clan_id:
            raise serializers.ValidationError({'clan': 'Клан обязателен.'})
        if not ClanMember.objects.filter(clan_id=clan_id, user=self.request.user).exists():
            raise serializers.ValidationError({'detail': 'Вы не состоите в этом клане.'})
        serializer.save(user=self.request.user)

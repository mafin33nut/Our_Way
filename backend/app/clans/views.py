from rest_framework import viewsets, permissions 
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Clan, ClanMember, ClanQuest 
from .serializers import ClanSerializer, ClanMemberSerializer, ClanQuestSerializer

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

class ClanMemberViewSet(viewsets.ModelViewSet): 
    queryset = ClanMember.objects.all() 
    serializer_class = ClanMemberSerializer 
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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

    @action(detail=True, methods=['post'])
    def contribute(self, request, pk=None):
        quest = self.get_object()
        contribution = int(request.data.get('contribution', 1))
        quest.total_progress = (quest.total_progress or 0) + contribution
        if quest.total_progress >= quest.required_progress:
            quest.completed = True
        quest.save()
        return Response(ClanQuestSerializer(quest).data)

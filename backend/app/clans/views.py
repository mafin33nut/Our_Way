from rest_framework import viewsets, permissions
from .models import Clan, ClanMember, ClanQuest
from .serializers import ClanSerializer, ClanMemberSerializer, ClanQuestSerializer

class ClanViewSet(viewsets.ModelViewSet):
    queryset = Clan.objects.all()
    serializer_class = ClanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ClanMemberViewSet(viewsets.ModelViewSet):
    queryset = ClanMember.objects.all()
    serializer_class = ClanMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

class ClanQuestViewSet(viewsets.ModelViewSet):
    queryset = ClanQuest.objects.all()
    serializer_class = ClanQuestSerializer
    permission_classes = [permissions.IsAuthenticated]

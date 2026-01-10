from rest_framework import viewsets, permissions
from .models import FocusProject, FocusMission, FocusMemberProgress
from .serializers import FocusProjectSerializer, FocusMissionSerializer, FocusMemberProgressSerializer

class FocusProjectViewSet(viewsets.ModelViewSet):
    queryset = FocusProject.objects.all()
    serializer_class = FocusProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class FocusMissionViewSet(viewsets.ModelViewSet):
    queryset = FocusMission.objects.all()
    serializer_class = FocusMissionSerializer
    permission_classes = [permissions.IsAuthenticated]

class FocusMemberProgressViewSet(viewsets.ModelViewSet):
    queryset = FocusMemberProgress.objects.all()
    serializer_class = FocusMemberProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

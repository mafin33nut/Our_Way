from rest_framework import viewsets from .models import Character, Quest, Achievement from .serializers import CharacterSerializer, QuestSerializer, AchievementSerializer

class CharacterViewSet(viewsets.ReadOnlyModelViewSet): queryset = Character.objects.all() serializer_class = CharacterSerializer

class QuestViewSet(viewsets.ReadOnlyModelViewSet): queryset = Quest.objects.all() serializer_class = QuestSerializer

class AchievementViewSet(viewsets.ReadOnlyModelViewSet): queryset = Achievement.objects.all() serializer_class = AchievementSerializer
from rest_framework import viewsets, permissions, status
from datetime import timedelta
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    ActivityCategory,
    Activity,
    ActivityLog,
    ActivityReward,
    ActivityTimer,
    Quest,
    QuestStep,
    UserFocus,
)
from .serializers import (
    ActivityCategorySerializer,
    ActivitySerializer,
    ActivityLogSerializer,
    ActivityRewardSerializer,
    ActivityTimerSerializer,
    QuestSerializer,
    QuestStepSerializer,
    UserFocusSerializer,
)
from .services import ActivityService
from app.api.permissions import IsOwnerOrReadOnly


class ActivityCategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD для категорий активностей.
    Read доступен всем (IsAuthenticatedOrReadOnly).
    """
    queryset = ActivityCategory.objects.all()
    serializer_class = ActivityCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ActivityViewSet(viewsets.ModelViewSet):
    """
    CRUD для активностей (tasks). Владелец может менять/удалять.
    """
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """
        Быстро пометить активность как выполненную:
        создаёт ActivityLog и вызывает ActivityService.complete_activity.
        """
        activity = self.get_object()

        # Создаём лог выполнения активности от имени текущего пользователя
        data = {'activity': activity.id}
        serializer = ActivityLogSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        log = serializer.save()

        ActivityService.complete_activity(log, award_points=True)

        return Response(ActivityLogSerializer(log).data)


class ActivityLogViewSet(viewsets.ModelViewSet):
    """
    Логи выполнения активностей. Обычные пользователи видят только свои записи.
    """
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(user=self.request.user)
        return qs

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Пометить конкретный лог как завершённый (вызовет сервис обработки).
        """
        log = self.get_object()
        ActivityService.complete_activity(log, award_points=True)
        return Response(ActivityLogSerializer(log).data)


class ActivityRewardViewSet(viewsets.ModelViewSet):
    """
    Награды, привязанные к активностям. Позволяет претендовать на reward.
    """
    queryset = ActivityReward.objects.all()
    serializer_class = ActivityRewardSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        """
        Претендовать на награду. Логика в ActivityService.claim_reward.
        """
        reward = self.get_object()
        if reward.claimed:
            return Response({'detail': 'Already claimed'}, status=status.HTTP_400_BAD_REQUEST)

        ActivityService.claim_reward(reward, request.user)
        return Response(ActivityRewardSerializer(reward).data)


class ActivityTimerViewSet(viewsets.ModelViewSet):
    """
    Таймеры сессий пользователя. Non-staff видят только свои таймеры.
    Поддерживается start/stop actions.
    """
    queryset = ActivityTimer.objects.all()
    serializer_class = ActivityTimerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()
        return self.queryset.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        timer = self.get_object()
        timer.stop()
        # потенциально начисляем XP и выполняем пост-обработку таймера
        ActivityService.process_timer(timer)
        return Response(ActivityTimerSerializer(timer).data)

    @action(detail=False, methods=['post'])
    def start(self, request):
        """
        Запустить новый таймер. В теле опционально можно передать activity (id).
        """
        activity_id = request.data.get('activity')
        activity = None
        if activity_id:
            activity = get_object_or_404(Activity, pk=activity_id)

        timer = ActivityTimer.objects.create(user=request.user, activity=activity)
        return Response(ActivityTimerSerializer(timer).data, status=status.HTTP_201_CREATED)

class UserFocusViewSet(viewsets.ModelViewSet):
    serializer_class = UserFocusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserFocus.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QuestStepViewSet(viewsets.ModelViewSet):
    serializer_class = QuestStepSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuestStep.objects.filter(quest__user=self.request.user, quest__is_custom=True)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        step = self.get_object()
        step.completed = True
        step.save(update_fields=['completed'])
        return Response(self.get_serializer(step).data)


# ---------------------------
# Quest viewset (в рамках activities)
# ---------------------------

class QuestViewSet(viewsets.ModelViewSet):
    """
    CRUD для пользовательских квестов (tasks).
    """
    queryset = Quest.objects.all()
    serializer_class = QuestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Quest.objects.filter(
            user=self.request.user,
            is_custom=True,
            deleted_at__isnull=True,
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Пометить квест как выполненный; при наличии полей у User начислить XP и увеличить счётчик.
        """
        quest = self.get_object()

        if quest.completed:
            return Response(self.get_serializer(quest).data)

        if quest.created_at and timezone.now() - quest.created_at < timedelta(seconds=30):
            return Response(
                {'detail': 'Задание можно завершить не раньше чем через 30 секунд после создания.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quest.steps.exists() and quest.steps.filter(completed=False).exists():
            return Response(
                {'detail': 'Нельзя завершить задание, пока не выполнены все этапы.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        quest.completed = True
        quest.completed_at = timezone.now()
        quest.save()

        # начисление очков пользователю (если поля есть)
        user = request.user
        if hasattr(user, 'xp'):
            user.xp = (user.xp or 0) + (quest.xp_reward or 0)
        if hasattr(user, 'total_quests_completed'):
            user.total_quests_completed = (user.total_quests_completed or 0) + 1

        try:
            user.save()
        except Exception:
            # если у модели нет этих полей, просто пропускаем
            pass

        return Response(self.get_serializer(quest).data)

    def destroy(self, request, *args, **kwargs):
        quest = self.get_object()
        quest.deleted_at = timezone.now()
        quest.save(update_fields=['deleted_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)
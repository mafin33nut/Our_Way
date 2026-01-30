import random
from rest_framework import viewsets, permissions, status
from django.db import models
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
)
from .serializers import (
    ActivityCategorySerializer,
    ActivitySerializer,
    ActivityLogSerializer,
    ActivityRewardSerializer,
    ActivityTimerSerializer,
    QuestSerializer,
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


# ---------------------------
# Quest viewset (в рамках activities)
# ---------------------------

class QuestViewSet(viewsets.ModelViewSet):
    """
    CRUD для пользовательских квестов (tasks) — интегрированы в activities.
    Предоставляют actions generate (создать набор задач по фокусу) и complete.
    """
    queryset = Quest.objects.all()
    serializer_class = QuestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # пользователи видят только свои задания
        now = timezone.now()
        qs = Quest.objects.filter(user=self.request.user, deleted_at__isnull=True)
        qs = qs.filter(models.Q(expires_at__isnull=True) | models.Q(completed=True) | models.Q(expires_at__gt=now))
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_by_focus(self, request):
        """
        Генерация заданий на основе выбранного фокуса.
        Простая примерная реализация — можно заменить более умной логикой.
        """
        focus = request.data.get('focus')
        today = timezone.now().date()
        if Quest.objects.filter(user=request.user, created_at__date=today).exists():
            return Response(
                {'detail': 'Новые задания можно генерировать только один раз в день.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        mapping = {
            'social': [
                ('Видеозвонок с близким', 'Обсудите планы и эмоции (60 мин).', 'medium', 100, 60),
                ('Мини-встреча для группы', 'Провести сессию для 4–6 человек (60 мин).', 'hard', 100, 60),
                ('Персональные сообщения', '8 персональных сообщений с поддержкой (60 мин).', 'medium', 100, 60),
                ('Офлайн-мероприятие', 'Посетить событие и установить 3 контакта (60 мин).', 'hard', 100, 60),
                ('Совместный коворкинг', 'Организовать 1 час работы с чек-инами (60 мин).', 'medium', 100, 60),
                ('Глубокая встреча', 'Развитие и план действий с ментором (90 мин).', 'hard', 150, 90),
                ('Мини-воркшоп', 'Провести воркшоп по хобби (90 мин).', 'hard', 150, 90),
                ('Нетворкинг-сессия', 'Собрать контакты и написать follow-up (90 мин).', 'hard', 150, 90),
            ],
            'work': [
                ('Крупный шаг в проекте', 'Реализовать и протестировать часть (60 мин).', 'hard', 100, 60),
                ('Сессия продуктивности', 'Pomodoro 50/10, закрыть 3 задачи (60 мин).', 'medium', 100, 60),
                ('Отчёт для руководства', 'Подготовить 1 страницу с метриками (60 мин).', 'medium', 100, 60),
                ('Анализ процессов', 'Собрать узкие места и 3 улучшения (60 мин).', 'hard', 100, 60),
                ('Обновить портфолио', 'Подготовить и задеплоить демо (60 мин).', 'medium', 100, 60),
                ('Мелкий фичер + тесты', 'Разработка + рефакторинг + тесты (90 мин).', 'hard', 150, 90),
                ('Встреча с протоколом', '45 мин встреча + 45 мин документ (90 мин).', 'hard', 150, 90),
                ('Глубокое ревью', '3–5 PR с подробными комментариями (90 мин).', 'hard', 150, 90),
            ],
            'learning': [
                ('Конспект материала', 'Глава/статья с 15 идеями (60 мин).', 'medium', 100, 60),
                ('Серия упражнений', '20–30 задач по теме (60 мин).', 'hard', 100, 60),
                ('Практический семинар', 'Теория + мини‑проект (60 мин).', 'medium', 100, 60),
                ('Флеш‑карты', '30–50 терминов (60 мин).', 'medium', 100, 60),
                ('Пилотная презентация', 'Подготовить 10 мин выступление (60 мин).', 'medium', 100, 60),
                ('Новая тема', '60 мин лекции + 30 мин практики (90 мин).', 'hard', 150, 90),
                ('Развёрнутое эссе', '500–800 слов с источниками (90 мин).', 'hard', 150, 90),
                ('Мини‑исследование', '5 источников и 10 выводов (90 мин).', 'hard', 150, 90),
            ],
            'health': [
                ('Комплексная тренировка', 'Разминка, силовая, растяжка (60 мин).', 'hard', 100, 60),
                ('Питание + план', 'Готовка и план на 3 дня (60 мин).', 'medium', 100, 60),
                ('Йога/пилатес', 'Сессия с фокусом на спину (60 мин).', 'medium', 100, 60),
                ('Контроль здоровья', 'Замеры и 3 цели на месяц (60 мин).', 'medium', 100, 60),
                ('План восстановления', 'Самомассаж + дыхание + прогулка (60 мин).', 'medium', 100, 60),
                ('Длинная кардио‑сессия', '60 мин кардио + 30 мин растяжки (90 мин).', 'hard', 150, 90),
                ('Полный чек‑ап', 'Подготовка к врачу и анализам (90 мин).', 'hard', 150, 90),
                ('3 здоровых рецепта', 'Тест и оценка для недели (90 мин).', 'hard', 150, 90),
            ],
            'personal': [
                ('SWOT‑самооценка', 'Сильные/слабые + 3 цели (60 мин).', 'medium', 100, 60),
                ('Утренняя рутина', '5–7 пунктов, выполнить и записать (60 мин).', 'medium', 100, 60),
                ('Книга по развитию', '10 практических шагов (60 мин).', 'medium', 100, 60),
                ('Сессия навыка', 'Фокус‑практика с обратной связью (60 мин).', 'medium', 100, 60),
                ('Старт 30‑дневного плана', 'Первые 7 дней и день 1 (60 мин).', 'medium', 100, 60),
                ('Тренировочное выступление', 'Подготовка + выступление (90 мин).', 'hard', 150, 90),
                ('Годовой план целей', 'Разбивка по кварталам (90 мин).', 'hard', 150, 90),
                ('Коучинг‑сессия', 'План действий и чек‑ины (90 мин).', 'hard', 150, 90),
            ],
            'home': [
                ('Организация комнаты', 'Уборка и список покупок (60 мин).', 'hard', 100, 60),
                ('План питания', 'Список и закупка продуктов (60 мин).', 'medium', 100, 60),
                ('Мелкий ремонт', 'Починить 3 мелочи (60 мин).', 'hard', 100, 60),
                ('Уборка техники', 'Холодильник/плита/микроволновка (60 мин).', 'medium', 100, 60),
                ('Система хранения', 'Организовать 4 категории вещей (60 мин).', 'medium', 100, 60),
                ('Генеральная уборка', '90 минут порядка и хранения (90 мин).', 'hard', 150, 90),
                ('Ревизия гардероба', 'Сортировка и список покупок (90 мин).', 'hard', 150, 90),
                ('Организация документов', 'Скан, папки, бэкап (90 мин).', 'hard', 150, 90),
            ],
        }

        items = mapping.get(focus)
        if not items:
            return Response(
                {'detail': 'Неизвестный фокус.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        selection_size = min(4, len(items))
        items_to_create = random.sample(items, k=selection_size) if items else []
        created = []

        for title, desc, diff, xp, duration in items_to_create:
            q = Quest.objects.create(
                title=title,
                description=desc,
                difficulty=diff,
                xp_reward=xp,
                duration_minutes=duration,
                user=request.user,
                focus_area=focus,
            )
            created.append(q)

        serializer = QuestSerializer(created, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Пометить квест как выполненный; при наличии полей у User начислить XP и увеличить счётчик.
        """
        quest = self.get_object()

        if quest.completed:
            return Response(self.get_serializer(quest).data)

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

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        quest = self.get_object()
        if quest.accepted_at:
            return Response(self.get_serializer(quest).data)
        now = timezone.now()
        quest.accepted_at = now
        quest.expires_at = now + timedelta(minutes=quest.duration_minutes or 60)
        quest.save(update_fields=['accepted_at', 'expires_at'])
        return Response(self.get_serializer(quest).data)

    def destroy(self, request, *args, **kwargs):
        quest = self.get_object()
        today = timezone.now().date()
        deleted_today = Quest.objects.filter(
            user=request.user,
            deleted_at__date=today,
        ).count()
        if deleted_today >= 3:
            return Response(
                {'detail': 'Лимит удаления заданий на сегодня достигнут (3).'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        quest.deleted_at = timezone.now()
        quest.save(update_fields=['deleted_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)
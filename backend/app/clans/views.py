from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Clan, ClanMember, ClanQuest, ClanQuestParticipant
from .serializers import ClanSerializer, ClanMemberSerializer, ClanQuestSerializer
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
        return self.queryset.filter(clan_id__in=clan_ids, deleted_at__isnull=True)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        membership = request.user.clan_memberships.select_related('clan').first()
        if not membership:
            return Response({'detail': 'Вы не состоите в клане.'}, status=status.HTTP_400_BAD_REQUEST)

        clan = membership.clan
        member_count = clan.members.count()
        if member_count == 0:
            return Response({'detail': 'В клане нет участников.'}, status=status.HTTP_400_BAD_REQUEST)

        active_count = ClanQuest.objects.filter(
            clan=clan,
            completed=False,
            deleted_at__isnull=True,
        ).count()
        if active_count >= 8:
            return Response(
                {'detail': 'Нельзя генерировать задания при 8+ активных заданиях.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tasks = [
            ('Видеозвонок с близким', 'Обсудите планы и эмоции (60 мин).', 'epic', 100),
            ('Мини-встреча для группы', 'Провести сессию для 4–6 человек (60 мин).', 'legendary', 100),
            ('Персональные сообщения', '8 персональных сообщений с поддержкой (60 мин).', 'epic', 100),
            ('Офлайн-мероприятие', 'Посетить событие и установить 3 контакта (60 мин).', 'legendary', 100),
            ('Совместный коворкинг', 'Организовать 1 час работы с чек-инами (60 мин).', 'epic', 100),
            ('Глубокая встреча', 'Развитие и план действий с ментором (90 мин).', 'legendary', 150),
            ('Мини-воркшоп', 'Провести воркшоп по хобби (90 мин).', 'legendary', 150),
            ('Нетворкинг-сессия', 'Собрать контакты и написать ответные сообщения (90 мин).', 'legendary', 150),
            ('Крупный шаг в проекте', 'Реализовать и протестировать часть (60 мин).', 'legendary', 100),
            ('Сессия продуктивности', 'Техника Помодоро 50/10, закрыть 3 задачи (60 мин).', 'epic', 100),
            ('Отчёт для руководства', '1 страница + ключевые метрики (60 мин).', 'epic', 100),
            ('Анализ процессов', 'Собрать узкие места и 3 улучшения (60 мин).', 'legendary', 100),
            ('Обновить портфолио', 'Подготовить и опубликовать демонстрацию проекта (60 мин).', 'epic', 100),
            ('Мелкий фичер + тесты', 'Разработка + рефакторинг + тесты (90 мин).', 'legendary', 150),
            ('Встреча с протоколом', '45 мин встреча + 45 мин документ (90 мин).', 'legendary', 150),
            ('Глубокое ревью', '3–5 пул‑реквестов с комментариями (90 мин).', 'legendary', 150),
            ('Конспект материала', 'Глава/статья с 15 идеями (60 мин).', 'epic', 100),
            ('Серия упражнений', '20–30 задач по теме (60 мин).', 'legendary', 100),
            ('Практический семинар', 'Теория + небольшой проект (60 мин).', 'epic', 100),
            ('Флеш‑карты', '30–50 терминов (60 мин).', 'epic', 100),
            ('Пилотная презентация', '10-минутное выступление (60 мин).', 'epic', 100),
            ('Новая тема', '60 мин лекции + 30 мин практики (90 мин).', 'legendary', 150),
            ('Развёрнутое эссе', '500–800 слов с источниками (90 мин).', 'legendary', 150),
            ('Мини‑исследование', '5 источников и 10 выводов (90 мин).', 'legendary', 150),
            ('Комплексная тренировка', 'Разминка, силовая, растяжка (60 мин).', 'legendary', 100),
            ('Питание + план', 'Готовка и план на 3 дня (60 мин).', 'epic', 100),
            ('Йога/пилатес', 'Фокус на спину и гибкость (60 мин).', 'epic', 100),
            ('Контроль здоровья', 'Замеры и 3 цели на месяц (60 мин).', 'epic', 100),
            ('План восстановления', 'Самомассаж + дыхание + прогулка (60 мин).', 'epic', 100),
            ('Длинная кардио‑сессия', '60 мин кардио + 30 мин растяжки (90 мин).', 'legendary', 150),
            ('Полный чек‑ап', 'Подготовка к врачу и анализам (90 мин).', 'legendary', 150),
            ('3 здоровых рецепта', 'Тест и оценка для недели (90 мин).', 'legendary', 150),
            ('SWOT‑самооценка', 'SWOT-анализ (сильные/слабые стороны, возможности, угрозы) + 3 цели (60 мин).', 'epic', 100),
            ('Утренняя рутина', '5–7 пунктов, выполнить и записать (60 мин).', 'epic', 100),
            ('Книга по развитию', '10 практических шагов (60 мин).', 'epic', 100),
            ('Сессия навыка', 'Практика навыка с обратной связью (60 мин).', 'epic', 100),
            ('Старт 30‑дневного плана', 'Первые 7 дней и день 1 (60 мин).', 'epic', 100),
            ('Тренировочное выступление', 'Подготовка + выступление с разбором (90 мин).', 'legendary', 150),
            ('Годовой план целей', 'Разбивка по кварталам (90 мин).', 'legendary', 150),
            ('Коучинг‑сессия', 'План действий и регулярные проверки (90 мин).', 'legendary', 150),
            ('Организация комнаты', 'Уборка и список покупок (60 мин).', 'legendary', 100),
            ('План питания', 'Список и закупка продуктов (60 мин).', 'epic', 100),
            ('Мелкий ремонт', 'Починить 3 мелочи (60 мин).', 'legendary', 100),
            ('Уборка техники', 'Холодильник/плита/микроволновка (60 мин).', 'epic', 100),
            ('Система хранения', 'Организовать 4 категории вещей (60 мин).', 'epic', 100),
            ('Генеральная уборка', '90 минут порядка и хранения (90 мин).', 'legendary', 150),
            ('Ревизия гардероба', 'Сортировка и список покупок (90 мин).', 'legendary', 150),
            ('Организация документов', 'Скан, папки, бэкап (90 мин).', 'legendary', 150),
        ]

        selection = random.sample(tasks, k=min(1, len(tasks)))
        created = []
        for title, description, difficulty, xp_reward in selection:
            created.append(ClanQuest.objects.create(
                clan=clan,
                title=title,
                description=description,
                difficulty=difficulty,
                xp_reward=xp_reward,
                required_progress=member_count,
                total_progress=0,
                completed=False,
                expires_at=None,
            ))
        serializer = self.get_serializer(created, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def contribute(self, request, pk=None):
        quest = self.get_object()
        contribution = int(request.data.get('contribution', 1))
        participant, _ = ClanQuestParticipant.objects.get_or_create(
            quest=quest,
            user=request.user,
            defaults={'contribution': 0},
        )
        participant.contribution = (participant.contribution or 0) + max(contribution, 0)
        participant.save(update_fields=['contribution', 'contributed_at'])

        quest.total_progress = (quest.total_progress or 0) + max(contribution, 0)

        member_ids = set(quest.clan.members.values_list('user_id', flat=True))
        participants_with_contrib = set(
            ClanQuestParticipant.objects.filter(quest=quest, contribution__gt=0)
            .values_list('user_id', flat=True)
        )
        if member_ids and member_ids.issubset(participants_with_contrib):
            quest.completed = True
        quest.save(update_fields=['total_progress', 'completed'])
        return Response(ClanQuestSerializer(quest).data)

    def destroy(self, request, *args, **kwargs):
        quest = self.get_object()
        today = timezone.now().date()
        deleted_today = ClanQuest.objects.filter(
            deleted_by=request.user,
            deleted_at__date=today,
        ).count()
        if deleted_today >= 5:
            return Response(
                {'detail': 'Лимит удаления клановых заданий на сегодня достигнут (5).'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        quest.deleted_at = timezone.now()
        quest.deleted_by = request.user
        quest.save(update_fields=['deleted_at', 'deleted_by'])
        return Response(status=status.HTTP_204_NO_CONTENT)

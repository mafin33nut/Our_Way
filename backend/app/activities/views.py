from rest_framework import viewsets, permissions, status
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
        qs = Quest.objects.filter(user=self.request.user)
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

        mapping = {
            'social': [
                ('Call a friend and arrange a meeting.', 'Reach out and agree on a time/place.', 'easy', 20),
                ('Send 3 warm messages to acquaintances.', 'Write short supportive messages to 3 people.', 'easy', 20),
                ('Go for a 30-minute walk with short conversations with 3 people.', 'Walk and have brief chats with 3 people.', 'medium', 30),
                ('Write an introductory post to an online community and reply to 2 comments.', 'Post and engage in the thread.', 'medium', 25),
                ('Plan a mini-meeting and invite participants.', 'Pick a topic and invite people.', 'medium', 25),
                ('Organize a virtual game/quiz for 2-4 people.', 'Set rules and invite participants.', 'hard', 30),
                ('Write a thank-you note to a colleague or mentor.', 'Be specific about what you appreciate.', 'easy', 15),
                ('Attend a local event (meetup) and meet 2 people.', 'Introduce yourself to at least 2 people.', 'hard', 30),
                ('Offer to help a neighbor or acquaintance with a small task.', 'Offer help and complete it.', 'easy', 20),
                ('Make a list of people you have not spoken to in a while and message the first 3.', 'Send short catch-up messages.', 'medium', 25),
            ],
            'work': [
                ('Break down a project into steps and identify the first 3 tasks.', 'Write the first three steps clearly.', 'easy', 20),
                ('30 minutes of deep work on one complex task.', 'Set a timer and focus without distractions.', 'medium', 30),
                ('Update your resume/LinkedIn profile (add your latest achievement).', 'Add one clear accomplishment.', 'easy', 20),
                ('Prepare a proposal for process improvement (problem-solution).', 'Describe the issue and your fix.', 'hard', 30),
                ('Clear your inbox and create three email templates.', 'Archive and draft reusable responses.', 'medium', 25),
                ('Conduct a quick productivity analysis: identify distractions and make three adjustments.', 'List distractions and adjustments.', 'medium', 25),
                ('Prepare a brief weekly report: achievements and plans.', 'Summarize wins and next steps.', 'medium', 25),
                ('Make a list of skills to develop and choose an online course for one of them.', 'Pick one course and note why.', 'easy', 20),
                ('Conduct a 15-minute sync with a colleague on current tasks.', 'Agree on next actions.', 'easy', 20),
                ('Set up automation for a routine task (macro, template, rule).', 'Create and test the automation.', 'hard', 30),
            ],
            'learning': [
                ('Read an article/chapter and write down 10 key ideas.', 'Summarize the main points.', 'medium', 25),
                ('Complete 10 exercises on the skill being studied.', 'Finish 10 practice items.', 'medium', 30),
                ('Take a short summary with three quizzes.', 'Summarize and answer 3 questions.', 'medium', 25),
                ('Watch a 25-30 minute lecture and write down five conclusions.', 'Note 5 conclusions.', 'medium', 25),
                ('Prepare a 5-minute mini-presentation on the topic.', 'Create a short outline.', 'hard', 30),
                ('Make a list of 10 words/concepts to memorize and review them.', 'Write and review the list.', 'easy', 20),
                ('Conduct a mini-experiment or practical exercise on the topic.', 'Document the result.', 'hard', 30),
                ('Find and read a review article on the topic and write down 5 references for further reading.', 'List 5 sources.', 'hard', 30),
                ('Create flashcards for key concepts (10-15 cards).', 'Make at least 10 cards.', 'medium', 25),
                ('Write a short essay (200-300 words) on the topic.', 'Draft a short essay.', 'hard', 30),
            ],
            'health': [
                ('30-minute interval cardio workout.', 'Do interval cardio for 30 minutes.', 'hard', 30),
                ('Analyze your diet and replace 3 unhealthy foods.', 'Swap 3 items for healthier options.', 'medium', 25),
                ('15 minutes of meditation + 15 minutes of stretching.', 'Do both back-to-back.', 'medium', 25),
                ('30-minute walk outdoors with a cool-down.', 'Walk and cool down afterward.', 'easy', 20),
                ('Make a list of doctors/tests and schedule one appointment.', 'Book one appointment.', 'medium', 25),
                ('Do a 30-minute strength training session with basic exercises.', 'Full-body basics.', 'hard', 30),
                ('Monitor your sleep: record your sleep schedule for a week and note any improvements.', 'Start a simple log.', 'easy', 20),
                ('Prepare a healthy lunch using a new recipe and evaluate how you feel after eating.', 'Try a new recipe.', 'medium', 25),
                ('Check your posture and do 10 minutes of back exercises.', 'Focus on posture and back.', 'easy', 20),
                ('Hydration check: create a daily water drinking plan and stick to it.', 'Plan and follow your intake.', 'easy', 20),
            ],
            'personal': [
                ('Read a motivational article and write down 5 takeaways.', 'List 5 takeaways.', 'easy', 20),
                ('Prepare and deliver a 5-minute mini-speech on a chosen topic, focusing on structure and content.', 'Write and speak it.', 'hard', 30),
                ('Review 3-12 month goals and break one down into steps.', 'Write the steps.', 'medium', 25),
                ('Write a short 30-day plan for developing one skill (specific daily actions).', 'Daily actions list.', 'medium', 25),
                ('Solve logic puzzles or play chess for 30 minutes.', 'Focus for 30 minutes.', 'medium', 25),
                ('Complete a self-assessment exercise: list 5 strengths and 5 weaknesses and come up with steps to address each weakness.', 'Write the list and steps.', 'hard', 30),
                ('Conduct a 20-minute deep reading session on a self-improvement topic and write down 3 ideas to implement.', 'List 3 ideas.', 'medium', 25),
                ('Find a mentor or someone to share feedback with and write them a proposal for mutual coaching.', 'Draft a short proposal.', 'hard', 30),
                ('Create a morning or evening routine (5-7 items) and test it out.', 'Write and try it.', 'medium', 25),
                ('Do a mini-project (write a plan, a short creative activity) and complete the first step.', 'Finish step one.', 'medium', 25),
            ],
            'home': [
                ('Clean and organize one area (shelf/table) in 30 minutes.', 'Pick one area and finish it.', 'medium', 25),
                ('Create a weekly menu and shopping list.', 'Plan meals and list items.', 'easy', 20),
                ('Make 3 minor repairs/repairs.', 'Complete three small fixes.', 'hard', 30),
                ('Sort items in one closet – keep/donate/throw away.', 'Sort and decide.', 'medium', 25),
                ('Create a checklist of routine chores and assign them to days.', 'Assign a schedule.', 'easy', 20),
                ('Do a quick bathroom clean: 30 minutes – cleaning, replacing consumables.', 'Clean and restock.', 'medium', 25),
                ('Organize electronic documents: folders, delete duplicates, make a backup.', 'Clean up and backup.', 'medium', 25),
                ('Prepare a weekly/monthly household budget and make adjustments.', 'Review and adjust.', 'medium', 25),
                ('Clean and organize appliances (refrigerator, microwave, etc.) according to the checklist.', 'Follow a checklist.', 'hard', 30),
                ('Plant/replant a houseplant and create a care plan.', 'Plan care steps.', 'easy', 20),
            ],
        }

        items = mapping.get(focus, [('Задание по фокусу', 'Описание', 'easy', 10)])
        created = []

        for title, desc, diff, xp in items:
            q = Quest.objects.create(
                title=title,
                description=desc,
                difficulty=diff,
                xp_reward=xp,
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
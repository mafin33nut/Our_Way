from rest_framework import serializers
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

QUEST_TRANSLATIONS = {
    # Social
    'Call a friend and arrange a meeting': (
        'Созвониться с другом и договориться о встрече',
        'Свяжитесь с другом и согласуйте время/место встречи.',
    ),
    'Send 3 warm messages to acquaintances': (
        'Отправить 3 тёплых сообщения знакомым',
        'Напишите 3 коротких поддерживающих сообщения.',
    ),
    'Go for a 30-minute walk with short conversations with 3 people': (
        '30-минутная прогулка с короткими разговорами с 3 людьми',
        'Прогуляйтесь и пообщайтесь с тремя людьми.',
    ),
    'Write an introductory post to an online community and reply to 2 comments': (
        'Сделать вступительный пост в сообществе и ответить на 2 комментария',
        'Опубликуйте пост и ответьте минимум на два комментария.',
    ),
    'Plan a mini-meeting and invite participants': (
        'Запланировать мини‑встречу и пригласить участников',
        'Выберите тему и пригласите людей.',
    ),
    'Organize a virtual game/quiz for 2-4 people': (
        'Организовать виртуальную игру/викторину на 2–4 человека',
        'Подготовьте правила и пригласите участников.',
    ),
    'Write a thank-you note to a colleague or mentor': (
        'Написать благодарственное сообщение коллеге или ментору',
        'Коротко и конкретно поблагодарите за помощь.',
    ),
    'Attend a local event (meetup) and meet 2 people': (
        'Посетить мероприятие и познакомиться с 2 людьми',
        'Заведите как минимум два новых контакта.',
    ),
    'Offer to help a neighbor or acquaintance with a small task': (
        'Предложить помощь соседу или знакомому в небольшом деле',
        'Предложите помощь и выполните небольшую задачу.',
    ),
    'Make a list of people you haven\'t spoken to in a while and message the first 3': (
        'Составить список людей, с кем давно не общались, и написать первым 3',
        'Сделайте список и отправьте три сообщения.',
    ),
    # Work
    'Break down a project into steps and identify the first 3 tasks': (
        'Разбить проект на шаги и определить первые 3 задачи',
        'Составьте план и выпишите первые три шага.',
    ),
    '30 minutes of deep work on one complex task': (
        '30 минут глубокого фокуса на одной сложной задаче',
        'Сфокусируйтесь без отвлечений в течение 30 минут.',
    ),
    'Update your resume/LinkedIn profile (add your latest achievement)': (
        'Обновить резюме/профиль LinkedIn (добавить последнее достижение)',
        'Добавьте одно важное достижение в резюме или профиль.',
    ),
    'Prepare a proposal for process improvement (problem-solution)': (
        'Подготовить предложение по улучшению процесса (проблема‑решение)',
        'Опишите проблему и предложите решение.',
    ),
    'Clear your inbox and create three email templates': (
        'Разобрать почту и создать 3 шаблона писем',
        'Очистите входящие и подготовьте шаблоны ответов.',
    ),
    'Conduct a quick productivity analysis: identify distractions and make three adjustments': (
        'Быстрый анализ продуктивности: выявить отвлечения и сделать 3 улучшения',
        'Определите отвлечения и внедрите три изменения.',
    ),
    'Prepare a brief weekly report: achievements and plans': (
        'Подготовить краткий недельный отчёт: достижения и планы',
        'Суммируйте результаты и планы на следующую неделю.',
    ),
    'Make a list of skills to develop and choose an online course for one of them': (
        'Составить список навыков для развития и выбрать курс по одному из них',
        'Выберите курс и запишите причины выбора.',
    ),
    'Conduct a 15-minute sync with a colleague on current tasks': (
        'Провести 15‑минутный синк с коллегой по текущим задачам',
        'Согласуйте статусы и следующие шаги.',
    ),
    'Set up automation for a routine task (macro, template, rule)': (
        'Настроить автоматизацию рутинной задачи (макрос, шаблон, правило)',
        'Создайте и протестируйте автоматизацию.',
    ),
    # Learning
    'Read an article/chapter and write down 10 key ideas': (
        'Прочитать статью/главу и выписать 10 ключевых идей',
        'Сделайте конспект с 10 ключевыми пунктами.',
    ),
    'Complete 10 exercises on the skill being studied': (
        'Выполнить 10 упражнений по изучаемому навыку',
        'Сделайте 10 практических заданий.',
    ),
    'Take a short summary with three quizzes': (
        'Сделать краткий конспект и пройти 3 мини‑теста',
        'Напишите краткое резюме и ответьте на три вопроса.',
    ),
    'Watch a 25-30 minute lecture and write down five conclusions': (
        'Посмотреть лекцию 25–30 минут и выписать 5 выводов',
        'Запишите пять ключевых выводов.',
    ),
    'Prepare a 5-minute mini-presentation on the topic': (
        'Подготовить 5‑минутную мини‑презентацию по теме',
        'Сделайте короткую структуру и примеры.',
    ),
    'Make a list of 10 words/concepts to memorize and review them': (
        'Составить список из 10 терминов/понятий и повторить их',
        'Запишите 10 терминов и повторите их.',
    ),
    'Conduct a mini-experiment or practical exercise on the topic': (
        'Провести мини‑эксперимент или практическое упражнение по теме',
        'Сделайте небольшую практику и зафиксируйте результат.',
    ),
    'Find and read a review article on the topic and write down 5 references for further reading': (
        'Найти обзорную статью и выписать 5 источников для изучения',
        'Прочитайте обзор и составьте список из 5 источников.',
    ),
    'Create flashcards for key concepts (10-15 cards)': (
        'Сделать карточки по ключевым понятиям (10–15 карточек)',
        'Создайте минимум 10 карточек.',
    ),
    'Write a short essay (200-300 words) on the topic': (
        'Написать короткое эссе (200–300 слов) по теме',
        'Сформулируйте основную мысль и выводы.',
    ),
    # Health
    '30-minute interval cardio workout': (
        '30‑минутная интервальная кардио‑тренировка',
        'Проведите интервальную кардио‑сессию 30 минут.',
    ),
    'Analyze your diet and replace 3 unhealthy foods': (
        'Проанализировать питание и заменить 3 вредных продукта',
        'Сделайте 3 более здоровые замены.',
    ),
    '15 minutes of meditation + 15 minutes of stretching': (
        '15 минут медитации + 15 минут растяжки',
        'Сделайте медитацию и растяжку подряд.',
    ),
    '30-minute walk outdoors with a cool-down': (
        '30‑минутная прогулка на улице с заминкой',
        'Прогуляйтесь и завершите лёгкой заминкой.',
    ),
    'Make a list of doctors/tests and schedule one appointment': (
        'Составить список врачей/анализов и записаться на один приём',
        'Запланируйте один визит.',
    ),
    'Do a 30-minute strength training session with basic exercises': (
        '30‑минутная силовая тренировка с базовыми упражнениями',
        'Выполните базовую силовую тренировку.',
    ),
    'Monitor your sleep: record your sleep schedule for a week and note any improvements': (
        'Отслеживание сна: записать режим сна на неделю и отметить улучшения',
        'Начните вести короткий дневник сна.',
    ),
    'Prepare a healthy lunch using a new recipe and evaluate how you feel after eating': (
        'Приготовить полезный обед по новому рецепту и оценить самочувствие',
        'Попробуйте новый рецепт и отметьте ощущения.',
    ),
    'Check your posture and do 10 minutes of back exercises': (
        'Проверить осанку и сделать 10 минут упражнений для спины',
        'Сделайте упражнения на спину 10 минут.',
    ),
    'Hydration check: create a daily water drinking plan and stick to it': (
        'Проверка гидратации: план питья воды на день и выполнение',
        'Составьте план и придерживайтесь его.',
    ),
    # Personal development
    'Read a motivational article and write down 5 takeaways': (
        'Прочитать мотивационную статью и выписать 5 выводов',
        'Запишите пять главных идей.',
    ),
    'Prepare and deliver a 5-minute mini-speech on a chosen topic, focusing on structure and content': (
        'Подготовить и провести 5‑минутную мини‑речь по теме (структура и содержание)',
        'Сделайте план речи и произнесите её.',
    ),
    'Review 3-12 month goals and break one down into steps': (
        'Пересмотреть цели на 3–12 месяцев и разбить одну на шаги',
        'Запишите пошаговый план.',
    ),
    'Write a short 30-day plan for developing one skill (specific daily actions)': (
        'Составить 30‑дневный план развития навыка (ежедневные действия)',
        'Опишите ежедневные шаги.',
    ),
    'Solve logic puzzles or play chess for 30 minutes': (
        'Решить логические задачи или сыграть в шахматы 30 минут',
        'Потренируйте мышление 30 минут.',
    ),
    'Complete a self-assessment exercise: list 5 strengths and 5 weaknesses and come up with steps to address each weakness': (
        'Самооценка: 5 сильных и 5 слабых сторон + шаги для улучшения слабых сторон',
        'Составьте список и конкретные шаги.',
    ),
    'Conduct a 20-minute deep reading session on a self-improvement topic and write down 3 ideas to implement': (
        '20‑минутное глубинное чтение по саморазвитию и 3 идеи для внедрения',
        'Запишите три идеи для применения.',
    ),
    'Find a mentor or someone to share feedback with and write them a proposal for mutual coaching': (
        'Найти ментора/партнёра по развитию и написать предложение о взаимном коучинге',
        'Сформулируйте короткое предложение.',
    ),
    'Create a "morning" or "evening" routine (5-7 items) and test it out': (
        'Создать утреннюю/вечернюю рутину (5–7 пунктов) и протестировать',
        'Составьте список и выполните его.',
    ),
    'Do a mini-project (write a plan, a short creative activity) and complete the first step': (
        'Мини‑проект: план и первый шаг',
        'Определите идею и выполните первый шаг.',
    ),
    # Household chores
    'Clean and organize one area (shelf/table) in 30 minutes': (
        'Убрать и организовать одну зону (полка/стол) за 30 минут',
        'Выберите одну зону и полностью приведите её в порядок.',
    ),
    'Create a weekly menu and shopping list': (
        'Составить меню на неделю и список покупок',
        'Запланируйте блюда и необходимые продукты.',
    ),
    'Make 3 minor repairs/repairs': (
        'Сделать 3 мелких ремонта/починки',
        'Выполните три небольшие починки.',
    ),
    'Sort items in one closet – keep/donate/throw away': (
        'Разобрать вещи в одном шкафу — оставить/отдать/выбросить',
        'Отсортируйте вещи по трём категориям.',
    ),
    'Create a checklist of routine chores and assign them to days': (
        'Сделать чек‑лист рутинных дел и распределить по дням',
        'Составьте расписание бытовых дел.',
    ),
    'Do a quick bathroom clean: 30 minutes – cleaning, replacing consumables': (
        'Быстрая уборка ванной за 30 минут: очистка и замена расходников',
        'Очистите поверхности и замените расходники.',
    ),
    'Organize electronic documents: folders, delete duplicates, make a backup': (
        'Организовать электронные документы: папки, удаление дублей, бэкап',
        'Разберите файлы и сделайте резервную копию.',
    ),
    'Prepare a weekly/monthly household budget and make adjustments': (
        'Составить недельный/месячный бюджет и внести корректировки',
        'Проверьте расходы и обновите бюджет.',
    ),
    'Clean and organize appliances (refrigerator, microwave, etc.) according to the checklist': (
        'Очистить и организовать технику (холодильник, микроволновка и др.) по чек‑листу',
        'Пройдитесь по чек‑листу и приведите технику в порядок.',
    ),
    'Plant/replant a houseplant and create a care plan': (
        'Посадить/пересадить комнатное растение и составить план ухода',
        'Сделайте пересадку и запишите уход.',
    ),
}


def _normalize_quest_text(value: str) -> str:
    return value.strip().rstrip('.')


class ActivityCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityCategory
        fields = ['id', 'name', 'slug', 'description']


class ActivitySerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=ActivityCategory.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Activity
        fields = [
            'id',
            'title',
            'description',
            'owner',
            'category',
            'points',
            'difficulty',
            'active',
            'created_at',
            'due_date',
        ]


class ActivityLogSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    activity = serializers.PrimaryKeyRelatedField(queryset=Activity.objects.all())
    activity_title = serializers.CharField(source='activity.title', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'activity',
            'activity_title',
            'user',
            'notes',
            'points_awarded',
            'status',
            'created_at',
            'completed_at',
        ]
        read_only_fields = ['points_awarded', 'status', 'created_at', 'completed_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)


class ActivityRewardSerializer(serializers.ModelSerializer):
    activity = serializers.PrimaryKeyRelatedField(queryset=Activity.objects.all())

    class Meta:
        model = ActivityReward
        fields = ['id', 'activity', 'type', 'value', 'claimed', 'created_at']
        read_only_fields = ['claimed', 'created_at']


class ActivityTimerSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    activity = serializers.PrimaryKeyRelatedField(
        queryset=Activity.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = ActivityTimer
        fields = [
            'id',
            'user',
            'activity',
            'started_at',
            'stopped_at',
            'active',
            'duration_seconds',
        ]
        read_only_fields = ['started_at', 'stopped_at', 'active', 'duration_seconds']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)


class UserFocusSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFocus
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']


class QuestStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestStep
        fields = ['id', 'title', 'completed', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class QuestSerializer(serializers.ModelSerializer):
    focuses = UserFocusSerializer(many=True, read_only=True)
    focus_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        default=list,
    )
    steps = QuestStepSerializer(many=True, required=False)

    class Meta:
        model = Quest
        fields = [
            'id',
            'title',
            'description',
            'difficulty',
            'xp_reward',
            'duration_minutes',
            'is_custom',
            'completed',
            'completed_at',
            'accepted_at',
            'expires_at',
            'deleted_at',
            'created_at',
            'user',
            'focus_area',
            'focuses',
            'focus_ids',
            'steps',
        ]
        read_only_fields = ['id', 'created_at', 'completed_at', 'user', 'accepted_at', 'expires_at', 'deleted_at']

    def create(self, validated_data):
        steps_data = validated_data.pop('steps', [])
        focus_ids = validated_data.pop('focus_ids', [])
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        validated_data['is_custom'] = True
        if steps_data:
            extra_steps = max(len(steps_data) - 1, 0)
            validated_data['xp_reward'] = 100 + extra_steps * 50
        else:
            validated_data['xp_reward'] = 100
        quest = super().create(validated_data)

        if focus_ids:
            focuses = UserFocus.objects.filter(id__in=focus_ids, user=quest.user)
            quest.focuses.set(focuses)

        if steps_data:
            for idx, step in enumerate(steps_data):
                QuestStep.objects.create(
                    quest=quest,
                    title=step.get('title', ''),
                    order=step.get('order', idx),
                )
        return quest

    def to_representation(self, instance):
        data = super().to_representation(instance)
        title = data.get('title') or ''
        normalized = _normalize_quest_text(title)
        if normalized in QUEST_TRANSLATIONS:
            translated_title, translated_desc = QUEST_TRANSLATIONS[normalized]
            data['title'] = translated_title
            data['description'] = translated_desc
        return data

 
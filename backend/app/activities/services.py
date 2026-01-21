from django.utils import timezone

from app.core.services import NotificationService

# Попытка импортировать утилиту отправки email-уведомлений (если приложение notifications установлено)
try:
    from app.notifications.services import send_notification_to_user
except Exception:
    send_notification_to_user = None

# Импорты моделей (локальные или смежные приложения)
from .models import ActivityLog, ActivityReward, ActivityTimer, Quest  # Quest опционально
# Опциональные связи — импортируем по возможности
try:
    from app.achievments.models import Achievement, UserAchievement
except Exception:
    Achievement = None
    UserAchievement = None

try:
    from app.focus.models import FocusExperience, FocusMemberProgress
except Exception:
    FocusExperience = None
    FocusMemberProgress = None

try:
    from app.clans.models import ClanMember
except Exception:
    ClanMember = None


class ActivityService:
    @staticmethod
    def complete_activity(activity_log: ActivityLog, award_points: bool = True):
        """
        Обработка завершения ActivityLog:
        - пометка лога как completed (если ещё не)
        - выдача наград, указанных в activity_log.activity.rewards
        - отправка уведомлений (внутренних и по email, если доступно)
        """
        if activity_log.status == ActivityLog.STATUS_COMPLETED:
            return activity_log

        # Пометить лог как завершенный (устанавливает completed_at и points_awarded)
        activity_log.mark_completed(award_points=award_points)

        # Попытка получить связанные модели для наград/XP/ачивок
        for reward in activity_log.activity.rewards.filter(claimed=False):
            try:
                if reward.type == ActivityReward.REWARD_POINTS or reward.type == 'points':
                    # Пытаемся привести value к int, иначе используем points из активности
                    try:
                        pts = int(reward.value)
                    except Exception:
                        pts = activity_log.points_awarded or getattr(activity_log.activity, 'points', 0)

                    # Отправка внутреннего уведомления (placeholder service)
                    try:
                        NotificationService.send(activity_log.user, f'You gained {pts} points for completing {activity_log.activity.title}')
                    except Exception:
                        pass

                    # Здесь можно добавить запись в профиль пользователя (если есть модель профиля/points)
                    reward.claimed = True
                    reward.save()

                elif reward.type == ActivityReward.REWARD_ACHIEVEMENT or reward.type == 'achievement':
                    if Achievement and UserAchievement:
                        ach = None
                        # Если value — id, попробуем получить по PK, иначе по имени (случайно)
                        try:
                            ach_id = int(reward.value)
                            ach = Achievement.objects.filter(pk=ach_id).first()
                        except Exception:
                            ach = Achievement.objects.filter(name__iexact=reward.value).first()

                        if ach:
                            UserAchievement.objects.get_or_create(user=activity_log.user, achievement=ach)
                            reward.claimed = True
                            reward.save()

                elif reward.type == ActivityReward.REWARD_XP or reward.type == 'xp':
                    try:
                        xp = int(reward.value)
                    except Exception:
                        xp = activity_log.points_awarded or getattr(activity_log.activity, 'points', 0)

                    if FocusExperience:
                        try:
                            FocusExperience.objects.create(user=activity_log.user, points=xp, timestamp=timezone.now())
                        except Exception:
                            pass

                    reward.claimed = True
                    reward.save()

            except Exception:
                # Не даём падать обработке на одной некорректной награде
                continue

        # Встроенное уведомление через NotificationService
        try:
            NotificationService.send(activity_log.user, f'Activity completed: {activity_log.activity.title}')
        except Exception:
            pass

        # Отправка email-уведомления (если сервис доступен и у пользователя есть email)
        if send_notification_to_user:
            try:
                subject = f'Вы завершили: {activity_log.activity.title}'
                body = f'Поздравляем! Вы завершили задачу \"{activity_log.activity.title}\" и получили {activity_log.points_awarded} очков.'
                send_notification_to_user(activity_log.user, subject=subject, body=body)
            except Exception:
                pass

        # Попытка отправить сигнал (если есть .signals.activity_completed)
        try:
            from .signals import activity_completed
            activity_completed.send(sender=ActivityService, activity_log=activity_log)
        except Exception:
            pass

        return activity_log

    @staticmethod
    def claim_reward(reward: ActivityReward, user):
        """
        Обработка ручного запроса на получение награды пользователем.
        Отмечает reward.claimed и выполняет соответствующие действия по типу награды.
        """
        if reward.claimed:
            return reward

        # Попытки импортов/доступных моделей уже выполнены в модульной области выше
        try:
            if reward.type == ActivityReward.REWARD_POINTS or reward.type == 'points':
                reward.claimed = True
                reward.save()

            elif reward.type == ActivityReward.REWARD_ACHIEVEMENT or reward.type == 'achievement':
                if Achievement and UserAchievement:
                    ach = None
                    try:
                        ach_id = int(reward.value)
                        ach = Achievement.objects.filter(pk=ach_id).first()
                    except Exception:
                        ach = Achievement.objects.filter(name__iexact=reward.value).first()
                    if ach:
                        UserAchievement.objects.get_or_create(user=user, achievement=ach)
                reward.claimed = True
                reward.save()

            elif reward.type == ActivityReward.REWARD_XP or reward.type == 'xp':
                try:
                    xp = int(reward.value)
                except Exception:
                    xp = 0
                if FocusExperience:
                    try:
                        FocusExperience.objects.create(user=user, points=xp, timestamp=timezone.now())
                    except Exception:
                        pass
                reward.claimed = True
                reward.save()

        except Exception:
            # защищаем от некорректных данных в reward
            pass

        # уведомление о том, что награда была получена
        try:
            NotificationService.send(user, f'Reward claimed: {reward.type}')
        except Exception:
            pass

        # Попытка отправить signal о том, что reward был claimed
        try:
            from .signals import reward_claimed
            reward_claimed.send(sender=ActivityService, reward=reward, user=user)
        except Exception:
            pass

        return reward

    @staticmethod
    def process_timer(timer: ActivityTimer):
        """
        Обработка остановленного таймера:
        - вычисление XP на основе duration_seconds (пример: 1 XP / минута)
        - создание FocusExperience (если доступно)
        - отправка уведомления пользователю
        """
        seconds = timer.duration_seconds or 0
        minutes = max(1, seconds // 60)
        xp = minutes * 1  # 1 XP per minute — настройте по необходимости

        if FocusExperience:
            try:
                FocusExperience.objects.create(user=timer.user, points=xp, timestamp=timezone.now())
            except Exception:
                pass

        try:
            NotificationService.send(timer.user, f'You earned {xp} XP for a {minutes}-minute session.')
        except Exception:
            pass

        # Также можно отправлять email, если доступна утилита
        if send_notification_to_user:
            try:
                subject = 'XP за сессию'
                body = f'Вы заработали {xp} XP за {minutes} минут работы над {getattr(timer.activity)}.'
                send_notification_to_user(timer.user, subject=subject, body=body)
            except Exception:
                pass

        return xp
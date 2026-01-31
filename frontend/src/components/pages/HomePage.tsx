import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { questsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Quest, Friend, Activity, BACKGROUND_OPTIONS } from '../../types';
import { QuestList } from '../../components/quests/QuestList';
import { TaskHistoryPanel } from '../../components/quests/TaskHistoryPanel';
import { TaskSchedulePanel } from '../../components/quests/TaskSchedulePanel';
import { CharacterProfile } from '../../components/profile/characterProfile';
import { ActivityFeed } from '../../components/social/ActivityFeed';
import { FriendSearchPanel } from '../../components/social/FriendSearchPanel';
import { AllFriendsPanel } from '../../components/social/AllFriendsPanel';
import { isToday } from '../../utils/time';
import { Loader } from '../../components/ui/Loader';

export function HomePage() {
  const { user, refreshUser } = useAuth();
  const { settings, playVictorySound } = useCustomization();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);

  const isLight = settings.theme === 'light';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        questsAPI.getAll().catch(() => []),
        socialAPI.getFriends().catch(() => []),
        socialAPI.getActivities().catch(() => []),
      ]);

      const [questsRes, friendsRes, activitiesRes] = results;

      const questsValue = questsRes.status === 'fulfilled' ? questsRes.value || [] : [];
      const activitiesValue = activitiesRes.status === 'fulfilled' ? activitiesRes.value || [] : [];

      if (questsRes.status === 'fulfilled') setQuests(questsValue);
      if (friendsRes.status === 'fulfilled') setFriends(friendsRes.value || []);

      const questActivities: Activity[] = questsValue
        .filter((q) => q.completed && q.completed_at)
        .map((q) => ({
          id: -q.id,
          type: 'quest_complete',
          title: q.title,
          message: 'Задание выполнено',
          timestamp: q.completed_at as string,
          icon: 'quest',
        }));
      const mergedActivities = [...questActivities, ...activitiesValue].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setActivities(mergedActivities);
    } catch (err) {
      console.error('Failed to load data:', err);
      setQuests([]);
      setFriends([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  const backgroundOption = BACKGROUND_OPTIONS.find((bg) => bg.id === settings.background);
  const backgroundUrl = backgroundOption?.url || '';
  const hasBackground = settings.background && settings.background !== 'none' && backgroundUrl && backgroundUrl.trim() !== '';

  useEffect(() => {
    if (hasBackground && backgroundUrl) {
      const img = new window.Image();
      img.onload = () => setBgImageLoaded(true);
      img.onerror = () => setBgImageLoaded(false);
      img.src = backgroundUrl;
    } else {
      setBgImageLoaded(false);
    }
  }, [hasBackground, backgroundUrl]);

  const handleCompleteQuest = async (id: number) => {
    try {
      const updatedQuest = await questsAPI.complete(id);
      setQuests((prev) => prev.map((q) => (q.id === id ? updatedQuest : q)));
      setActivities((prev) => [
        {
          id: -updatedQuest.id,
          type: 'quest_complete',
          title: updatedQuest.title,
          message: 'Задание выполнено',
          timestamp: updatedQuest.completed_at || new Date().toISOString(),
          icon: 'quest',
        },
        ...prev,
      ]);
      playVictorySound();
      await refreshUser();
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  const handleDeleteQuest = async (id: number) => {
    try {
      await questsAPI.delete(id);
      setQuests((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error('Failed to delete quest:', error);
    }
  };

  const questsCompletedToday = quests.filter((q) => q.completed && q.completed_at && isToday(q.completed_at)).length;

  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div
      className={`min-h-screen relative bg-slate-950 ${
        hasBackground ? '' : 'bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900'
      }`}
    >
      {hasBackground && (
        <div
          key={`bg-${settings.background}-${backgroundUrl}`}
          className="fixed inset-0 z-0"
          style={{
            backgroundColor: 'rgb(2 6 23)',
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className={`absolute inset-0 ${bgImageLoaded ? 'bg-slate-900/30' : 'bg-slate-900/70'} backdrop-blur-sm`} />
        </div>
      )}
      <div className="relative z-10">
        <div className="max-w-[1680px] mx-auto px-6 py-12 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-10">
            <div className="flex flex-col items-center space-y-[128px]">
              <div className="w-full max-w-[780px]">
                <div className="panel-caption text-center">Профиль героя</div>
                <div className="text-white/60 text-sm text-center mb-32">
                  Основные характеристики персонажа, уровень и прогресс в заданиях.
                </div>
                <CharacterProfile user={user} questsCompletedToday={questsCompletedToday} />
              </div>

              <div className="w-full max-w-[780px]">
                <div className="panel-caption text-center">Текущие задания</div>
                <div className="text-white/60 text-sm text-center mb-32">
                  Список активных заданий, таймеры и выполнение.
                </div>
                <QuestList
                  quests={quests}
                  onComplete={handleCompleteQuest}
                  onDelete={handleDeleteQuest}
                />
              </div>

              {settings.showActivities && (
                <div className="w-full max-w-[780px]">
                  <div className="panel-caption text-center">Активность гильдии</div>
                  <div className="text-white/60 text-sm text-center mb-32">
                    Хронология событий и изменений по заданиям и уровню.
                  </div>
                  <ActivityFeed activities={activities} />
                </div>
              )}

              <div className="w-full max-w-[780px]">
                <div className="panel-caption text-center">История выполнения</div>
                <div className="text-white/60 text-sm text-center mb-32">
                  Последние завершённые задания и статистика за день.
                </div>
                <TaskHistoryPanel quests={quests} />
              </div>

              <div className="w-full max-w-[780px]">
                <div className="panel-caption text-center">Расписание выполнения</div>
                <div className="text-white/60 text-sm text-center mb-32">
                  План задач на ближайшее время и рекомендуемая длительность.
                </div>
                <TaskSchedulePanel quests={quests} />
              </div>
            </div>
            <div className="flex flex-col items-end space-y-[128px]">
              {settings.showFriends && (
                <div className="w-full max-w-[420px] ml-auto">
                  <div className="panel-caption text-right">Поиск друзей</div>
                  <div className="text-white/60 text-sm text-right mb-32">
                    Найдите друзей по имени пользователя и добавьте в список.
                  </div>
                  <FriendSearchPanel
                    onFriendAdded={loadData}
                    friendIds={friends.map((friend) => friend.id)}
                    currentUserId={user.id}
                  />
                </div>
              )}
              {friends.length > 0 && (
                <div className="w-full max-w-[420px] ml-auto">
                  <div className="panel-caption text-right">Список друзей</div>
                  <div className="text-white/60 text-sm text-right mb-32">
                    Все ваши друзья, их уровень и статус активности.
                  </div>
                  <AllFriendsPanel friends={friends} />
                </div>
              )}
            </div>
          </div>

        </div>

        <div className={`mt-12 pb-6 text-center ${isLight ? 'text-amber-600/60' : 'text-amber-200/40'}`}>
          <p>Приключения вместе, величие навсегда...</p>
        </div>
      </div>
    </div>
  );
}
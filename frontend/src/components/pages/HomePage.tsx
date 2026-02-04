import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { questsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Quest, BACKGROUND_OPTIONS, Activity } from '../../types';
import { QuestList } from '../../components/quests/QuestList';
import { CharacterProfile } from '../../components/profile/characterProfile';
import { formatTime, isToday } from '../../utils/time';
import { Loader } from '../../components/ui/Loader';
import { Bell, TrendingUp, Trophy, Users, Zap } from 'lucide-react';

export function HomePage() {
  const { user, refreshUser } = useAuth();
  const { settings, playVictorySound } = useCustomization();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [questList, activityList] = await Promise.all([
        questsAPI.getAll().catch(() => []),
        socialAPI.getActivities().catch(() => []),
      ]);
      setQuests(questList || []);
      setActivities(activityList || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setQuests([]);
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
  const backgroundUrl =
    settings.background === 'custom'
      ? settings.customBackgroundUrl || ''
      : backgroundOption?.url || '';
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
  const achievementSlots = [
    { id: 'a1', title: 'Новичок', req: 1 },
    { id: 'a2', title: 'Боец', req: 5 },
    { id: 'a3', title: 'Солдат', req: 10 },
    { id: 'a4', title: 'Легенда', req: 20 },
    { id: 'a5', title: 'Герой', req: 30 },
    { id: 'a6', title: 'Мастер', req: 40 },
    { id: 'a7', title: 'Титан', req: 50 },
    { id: 'a8', title: 'Вершина', req: 75 },
  ];
  const focusColumns = useMemo(() => {
    const sorted = [...quests]
      .filter((quest) => quest.completed)
      .sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''));
    const groups = new Map<string, Quest[]>();
    sorted.forEach((quest) => {
      const focusLabel = quest.focuses?.[0]?.name || quest.focus_area || 'Без фокуса';
      const bucket = groups.get(focusLabel) ?? [];
      bucket.push(quest);
      groups.set(focusLabel, bucket);
    });
    return Array.from(groups.entries());
  }, [quests]);

  const recentActivities = activities.slice(0, 8);
  const activityIcons = {
    quest_complete: TrendingUp,
    level_up: Zap,
    friend_achievement: Trophy,
    clan_event: Users,
  } as const;
  const activityColors: Record<string, string> = {
    quest_complete: 'text-green-400',
    level_up: 'text-yellow-400',
    friend_achievement: 'text-purple-400',
    clan_event: 'text-orange-400',
  };

  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div
      className={`min-h-screen relative bg-slate-950 ${
        hasBackground ? '' : 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950'
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
      <div className="relative z-10 min-h-screen flex items-start justify-center px-8 py-12">
        <div className="w-full max-w-[1500px]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] gap-12">
            <div className="space-y-10">
              <div className="w-full">
                <div className="panel-caption text-left">Профиль героя</div>
                <div className="panel-comment mb-6 min-h-[48px]">
                  Основные характеристики персонажа, уровень и прогресс в квестах.
                </div>
                <div className="panel-guide mb-4">
                  <p>1) Проверь текущий уровень и прогресс до следующего.</p>
                  <p>2) Следи за дневной активностью и выполненными квестами.</p>
                  <p>3) Обновляй профиль, если меняешь цели или темп.</p>
                </div>
                <CharacterProfile user={user} questsCompletedToday={questsCompletedToday} />
              </div>

              <div className="w-full">
                <div className="panel-caption text-left">Текущие квесты</div>
                <div className="panel-comment mb-6">
                  Список активных квестов и выполнение.
                </div>
                <div className="panel-guide mb-4">
                  <p>1) Выполни квест и нажми «Завершить».</p>
                  <p>2) Удаляй устаревшие квесты, чтобы не засорять список.</p>
                  <p>3) Следи за наградой и сложностью перед стартом.</p>
                </div>
                <QuestList
                  quests={quests}
                  onComplete={handleCompleteQuest}
                  onDelete={handleDeleteQuest}
                />
              </div>
            </div>

            <div className="space-y-10">
              <div className="w-full">
                <div className="panel-caption text-left">Достижения</div>
                <div className="panel-comment mb-6 min-h-[48px]">
                  Ваши полученные достижения и текущий прогресс.
                </div>
                <div className="panel-guide mb-4">
                  <p>1) Выполняй квесты — открываются новые уровни достижений.</p>
                  <p>2) Смотри требования рядом с каждым значком.</p>
                  <p>3) Планируй следующую цель по оставшимся квестам.</p>
                </div>
                <div className="panel-base panel-teal">
                  <div className="space-y-3">
                    {achievementSlots
                      .filter((item) => (user.total_quests_completed || 0) >= item.req)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-slate-600/40 bg-slate-900/50 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-teal-400/20 border border-teal-300/60 flex items-center justify-center text-teal-100">
                              ★
                            </div>
                            <div>
                              <p className="text-slate-100 text-sm">{item.title}</p>
                              <p className="text-slate-300/60 text-xs">
                                Достигнуто: {item.req} квестов
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-300/60">Получено</span>
                        </div>
                      ))}
                    {achievementSlots.filter((item) => (user.total_quests_completed || 0) >= item.req).length === 0 && (
                      <div className="text-center text-slate-300/60 text-sm py-6">
                        Пока нет полученных достижений
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="panel-caption text-left">Активность</div>
                <div className="panel-comment mb-6">
                  Лента событий и распределение завершенных квестов по фокусам.
                </div>
                <div className="panel-guide mb-4">
                  <p>1) Следи за последними событиями в игре.</p>
                  <p>2) Сравнивай, какие фокусы получают больше внимания.</p>
                  <p>3) Поддерживай баланс, добавляя квесты в слабые направления.</p>
                </div>
                <div className="panel-base panel-lime">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                    <div className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4 h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-purple-400" />
                        <h2 className="text-purple-300">Последние квесты</h2>
                      </div>
                      <div className="space-y-6">
                        {recentActivities.map((activity) => {
                          const IconComponent = activityIcons[activity.type] || TrendingUp;
                          const color = activityColors[activity.type] || 'text-purple-400';
                          const title =
                            activity.title?.trim() ||
                            activity.message?.trim() ||
                            'Квест';
                          return (
                            <div
                              key={activity.id}
                              className="flex items-start gap-3 p-3 bg-slate-950/40 rounded-lg border border-purple-600/20 hover:border-purple-500/50 transition-colors"
                            >
                              <IconComponent className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-purple-200 text-sm">
                                  {title}
                                </p>
                                {activity.message && activity.message !== title && (
                                  <p className="text-purple-200/60 text-xs mt-1">{activity.message}</p>
                                )}
                                <p className="text-purple-200/40 text-xs mt-1">{formatTime(activity.timestamp)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {activities.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-purple-200/40 text-sm">Пока нет активности</p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4 h-full">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-100">Активности по фокусам</p>
                        <span className="text-xs text-slate-300/60">Завершенные квесты</span>
                      </div>
                      {focusColumns.length === 0 ? (
                        <div className="text-center text-slate-300/60 py-4">
                          Пока нет завершенных квестов
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {focusColumns.map(([focus, items]) => (
                            <div key={focus} className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-slate-100">{focus}</p>
                                <span className="text-xs text-slate-300/60">{items.length}</span>
                              </div>
                              <div className="space-y-2">
                                {items.slice(0, 4).map((quest) => (
                                  <div
                                    key={quest.id}
                                    className="rounded-lg border border-slate-700/50 bg-slate-950/40 px-3 py-2"
                                  >
                                    <p className="text-sm text-slate-200">{quest.title}</p>
                                    <p className="text-xs text-slate-300/60">{quest.description}</p>
                                  </div>
                                ))}
                                {items.length > 4 && (
                                  <p className="text-xs text-slate-300/60">
                                    +{items.length - 4} ещё завершённых
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center text-slate-200/80 font-indie text-2xl">
            С каждым шагом твоя история становится сильнее — продолжай путь!
          </div>
        </div>
      </div>
    </div>
  );
}
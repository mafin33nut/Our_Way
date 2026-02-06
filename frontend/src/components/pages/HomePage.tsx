import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { focusesAPI, questsAPI } from '../../api/quests';
import { Quest, BACKGROUND_OPTIONS, UserFocus } from '../../types';
import { QuestList } from '../../components/quests/QuestList';
import { CharacterProfile } from '../../components/profile/characterProfile';
import { isToday } from '../../utils/time';
import { Loader } from '../../components/ui/Loader';
import { Home } from 'lucide-react';

export function HomePage() {
  const { user } = useAuth();
  const { settings } = useCustomization();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [focuses, setFocuses] = useState<UserFocus[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [questList, focusList] = await Promise.all([
        questsAPI.getAll().catch(() => []),
        focusesAPI.getAll().catch(() => []),
      ]);
      setQuests(questList || []);
      setFocuses(focusList || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setQuests([]);
      setFocuses([]);
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
  const isDynamic = settings.background === 'dynamic';
  const hasBackground =
    settings.background &&
    settings.background !== 'dynamic' &&
    backgroundUrl &&
    backgroundUrl.trim() !== '';

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
  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div
      className={`min-h-screen relative ${isDynamic ? 'bg-transparent' : 'bg-slate-950'} ${
        isDynamic || hasBackground ? '' : 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950'
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
      <div className="relative z-10 min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 text-slate-100 mb-6">
            <Home className="w-5 h-5 text-teal-300" />
            <h2 className="text-slate-100">Главная</h2>
          </div>
          <div className="flex flex-col items-center gap-8 sm:gap-10">
            <div className="w-full grid grid-cols-1 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-8">
              <div className="w-full">
                <div className="panel-base panel-teal">
                  <div className="panel-caption text-left">Профиль героя</div>
                  <CharacterProfile user={user} questsCompletedToday={questsCompletedToday} />

                  <div className="mt-6 sm:mt-8">
                    <div className="panel-caption text-left">Достижения героя</div>
                    <div className="space-y-4">
                      {achievementSlots
                        .filter((item) => (user.total_quests_completed || 0) >= item.req)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-600/40 bg-slate-900/50 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-amber-300/25 border border-amber-300/60 flex items-center justify-center achievement-earned text-lg">
                                ★
                              </div>
                              <div>
                                <p className="text-slate-100 text-base achievement-earned">{item.title}</p>
                                <p className="text-slate-300/80 text-sm achievement-earned">
                                  Достигнуто: {item.req} квестов
                                </p>
                              </div>
                            </div>
                            <span className="text-xs achievement-earned px-3 py-1 rounded-full border border-amber-300/60 bg-amber-300/15 self-start sm:self-auto">
                              Получено
                            </span>
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
              </div>

              <div className="w-full">
                <div className="panel-base panel-sky w-full">
                  <div className="panel-caption text-left">Мои квесты по направлениям</div>
                  {loading ? (
                    <p className="text-center text-purple-200/60">Загрузка...</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {[...focuses, { id: 0, name: 'Без направления', created_at: '' }].map((focus) => {
                        const focusQuests =
                          focus.id === 0
                            ? quests.filter((q) => !q.focuses || q.focuses.length === 0)
                            : quests.filter((q) => q.focuses?.some((f) => f.id === focus.id));
                        return (
                          <div key={focus.id} className="rounded-lg border border-purple-700/30 bg-slate-950/40 p-4">
                            <h3 className="text-purple-200 mb-3">{focus.name}</h3>
                            {focusQuests.length === 0 ? (
                              <p className="text-sm text-purple-200/60">Пока нет квестов</p>
                            ) : (
                              <QuestList
                                quests={focusQuests}
                                onComplete={handleCompleteQuest}
                                onDelete={handleDeleteQuest}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

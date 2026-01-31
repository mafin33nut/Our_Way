import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { questsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Quest, Friend, BACKGROUND_OPTIONS } from '../../types';
import { QuestList } from '../../components/quests/QuestList';
import { CharacterProfile } from '../../components/profile/characterProfile';
import { FriendSearchPanel } from '../../components/social/FriendSearchPanel';
import { AllFriendsPanel } from '../../components/social/AllFriendsPanel';
import { isToday } from '../../utils/time';
import { Loader } from '../../components/ui/Loader';
import { Award } from 'lucide-react';

export function HomePage() {
  const { user, refreshUser } = useAuth();
  const { settings, playVictorySound } = useCustomization();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);

  const isLight = settings.theme === 'light';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        questsAPI.getAll().catch(() => []),
        socialAPI.getFriends().catch(() => []),
      ]);

      const [questsRes, friendsRes] = results;

      const questsValue = questsRes.status === 'fulfilled' ? questsRes.value || [] : [];

      if (questsRes.status === 'fulfilled') setQuests(questsValue);
      if (friendsRes.status === 'fulfilled') setFriends(friendsRes.value || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setQuests([]);
      setFriends([]);
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
      <div className="relative z-10">
        <div className="max-w-[1680px] mx-auto px-6 py-12 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] gap-10">
            <div className="space-y-10">
              <div className="w-full">
                <div className="panel-caption text-left">Профиль героя</div>
                <div className="text-slate-300/70 text-sm mb-6">
                  Основные характеристики персонажа, уровень и прогресс в квестах.
                </div>
                <CharacterProfile user={user} questsCompletedToday={questsCompletedToday} />
              </div>

              <div className="w-full">
                <div className="panel-caption text-left">Текущие квесты</div>
                <div className="text-slate-300/70 text-sm mb-6">
                  Список активных квестов и выполнение.
                </div>
                <QuestList
                  quests={quests}
                  onComplete={handleCompleteQuest}
                  onDelete={handleDeleteQuest}
                />
              </div>
            </div>

            <div className="space-y-10">
              <div className="panel-base panel-teal">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-teal-300" />
                    <h3 className="text-slate-100">Достижения</h3>
                  </div>
                  <span className="text-xs text-slate-300/70">Все</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {achievementSlots.map((item) => {
                    const unlocked = (user.total_quests_completed || 0) >= item.req;
                    return (
                      <div
                        key={item.id}
                        className={`h-16 rounded-xl border flex items-center justify-center ${
                          unlocked
                            ? 'bg-teal-400/20 border-teal-300/60 text-teal-100'
                            : 'bg-slate-800/60 border-slate-600/60 text-slate-400'
                        }`}
                        title={`${item.title} · ${item.req} квестов`}
                      >
                        <span className="text-sm">{unlocked ? '★' : '•'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {settings.showFriends && (
                <div className="w-full">
                  <div className="panel-caption text-left">Друзья</div>
                  <div className="text-slate-300/70 text-sm mb-6">
                    Найдите друзей и следите за их активностью.
                  </div>
                  <div className="space-y-6">
                    <FriendSearchPanel
                      onFriendAdded={loadData}
                      friendIds={friends.map((friend) => friend.id)}
                      currentUserId={user.id}
                    />
                    {friends.length > 0 && <AllFriendsPanel friends={friends} />}
                  </div>
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
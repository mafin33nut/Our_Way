import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { questsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Quest, Friend, Activity, BACKGROUND_OPTIONS } from '../../types';
import { FocusSelector } from '../../components/quests/FocusSelector';
import { QuestList } from '../../components/quests/QuestList';
import { TaskHistoryPanel } from '../../components/quests/TaskHistoryPanel';
import { CharacterProfile } from '../../components/profile/characterProfile';
import { FriendsList } from '../../components/social/FriendsList';
import { ActivityFeed } from '../../components/social/ActivityFeed';
import { FriendSearchPanel } from '../../components/social/FriendSearchPanel';
import { isToday } from '../../utils/time';
import { Loader } from '../../components/ui/Loader';

export function HomePage() {
  const { user, refreshUser } = useAuth();
  const { settings, playVictorySound } = useCustomization();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuests, setGeneratingQuests] = useState(false);
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

      if (questsRes.status === 'fulfilled') setQuests(questsRes.value || []);
      if (friendsRes.status === 'fulfilled') setFriends(friendsRes.value || []);
      if (activitiesRes.status === 'fulfilled') setActivities(activitiesRes.value || []);
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
      const img = new Image();
      img.onload = () => setBgImageLoaded(true);
      img.onerror = () => setBgImageLoaded(false);
      img.src = backgroundUrl;
    } else {
      setBgImageLoaded(false);
    }
  }, [hasBackground, backgroundUrl]);

  const handleSelectFocus = async (focus: string) => {
    setGeneratingQuests(true);
    try {
      const newQuests = await questsAPI.generateByFocus(focus);
      setQuests(newQuests);
      await refreshUser();
    } catch (error) {
      console.error('Failed to generate quests:', error);
    } finally {
      setGeneratingQuests(false);
    }
  };

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

  const handleTimerStop = async () => {
    await loadData();
    await refreshUser();
  };

  const questsCompletedToday = quests.filter((q) => q.completed && q.completed_at && isToday(q.completed_at)).length;

  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={`min-h-screen relative ${hasBackground ? '' : 'bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900'}`}>
      {hasBackground && bgImageLoaded && (
        <div
          key={`bg-${settings.background}-${backgroundUrl}`}
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
        </div>
      )}
      <div className="relative z-10">
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
            <div className="xl:col-span-3 space-y-12">
              <CharacterProfile user={user} questsCompletedToday={questsCompletedToday} />
            </div>

            <div className="xl:col-span-6 space-y-12">
              <FocusSelector currentFocus={user.current_focus || undefined} onSelectFocus={handleSelectFocus} loading={generatingQuests} />
              <QuestList quests={quests} onComplete={handleCompleteQuest} onDelete={handleDeleteQuest} onTimerStop={handleTimerStop} />
            </div>

            <div className="xl:col-span-3 space-y-12">
              {settings.showFriends && (
                friends.length > 0 ? (
                  <FriendsList friends={friends} />
                ) : (
                  <FriendSearchPanel onFriendAdded={loadData} />
                )
              )}
              {settings.showActivities && activities.length > 0 && <ActivityFeed activities={activities} />}
              <TaskHistoryPanel quests={quests} />
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
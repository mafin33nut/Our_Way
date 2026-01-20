import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { questsAPI, clanQuestsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Quest, Friend, Clan, Activity, ClanQuest, BACKGROUND_OPTIONS } from '../../types';
import { FocusSelector } from '../../components/quests/FocusSelector';
import { QuestList } from '../../components/quests/QuestList';
import { ClanQuestList } from '../../components/quests/ClanQuestList';
import { CharacterProfile } from '../../components/profile/characterProfile';
import { FriendsList } from '../../components/social/FriendsList';
import { ActivityFeed } from '../../components/social/ActivityFeed';
import { isToday } from '../../utils/time';
import { Loader } from '../../components/ui/Loader';
import { Crown } from 'lucide-react';

export function HomePage() {
  const { user, refreshUser } = useAuth();
  const { settings, playVictorySound } = useCustomization();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [clanQuests, setClanQuests] = useState<ClanQuest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [clan, setClan] = useState<Clan | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuests, setGeneratingQuests] = useState(false);

  const isLight = settings.theme === 'light';
  const backgroundOption = BACKGROUND_OPTIONS.find(bg => bg.id === settings.background);
  const backgroundUrl = backgroundOption?.url || '';

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questsData, clanQuestsData, friendsData, clanData, activitiesData] = await Promise.all([
        questsAPI.getAll(),
        clanQuestsAPI.getAll(),
        socialAPI.getFriends(),
        socialAPI.getClan(),
        socialAPI.getActivities(),
      ]);
      setQuests(questsData);
      setClanQuests(clanQuestsData);
      setFriends(friendsData);
      setClan(clanData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFocus = async (focus: string) => {
    setGeneratingQuests(true);
    try {
      const newQuests = await questsAPI.generateByFocus(focus);
      // merge new quests: put them at top
      setQuests((prev) => [...newQuests, ...prev]);
      await refreshUser();
    } catch (error) {
      console.error('Failed to generate quests:', error);
    } finally {
      setGeneratingQuests(false);
    }
  };

  const handleCompleteQuest = async (id: number) => {
    try {
      const updated = await questsAPI.complete(id);
      setQuests((prev) => prev.map(q => q.id === id ? { ...q, completed: true, completed_at: updated.completed_at } : q));
      playVictorySound(); // Play sound on completion
      await refreshUser();
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  const handleDeleteQuest = async (id: number) => {
    try {
      await questsAPI.delete(id);
      setQuests(quests.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to delete quest:', error);
    }
  };

  const handleClanQuestContribute = async (id: number, contribution: number) => {
    try {
      const updatedClanQuest = await clanQuestsAPI.contribute(id, contribution);
      setClanQuests(clanQuests.map(cq => (cq.id === id ? updatedClanQuest : cq)));
      await refreshUser();
    } catch (error) {
      console.error('Failed to contribute to clan quest:', error);
    }
  };

  const questsCompletedToday = quests.filter(
    q => q.completed && q.completed_at && isToday(q.completed_at)
  ).length;

  if (loading || !user) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      {backgroundUrl && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className={`absolute inset-0 ${
            isLight 
              ? 'bg-white/70 backdrop-blur-sm' 
              : 'bg-slate-900/80 backdrop-blur-sm'
          }`} />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${
        !backgroundUrl && (isLight 
          ? 'bg-gradient-to-b from-amber-50 via-white to-amber-50' 
          : 'bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900')
      }`}>
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Sidebar - Character & Clan */}
            <div className="xl:col-span-3 space-y-6">
              <CharacterProfile user={user} questsCompletedToday={questsCompletedToday} />
              
              {settings.showClan && clan && (
                <div className={`rounded-lg border-2 p-6 shadow-2xl backdrop-blur-sm ${
                  isLight
                    ? 'bg-white/90 border-amber-300'
                    : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-amber-600/50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                    <h2 className={isLight ? 'text-amber-800' : 'text-amber-300'}>
                      {clan.name}
                    </h2>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className={`flex justify-between ${
                      isLight ? 'text-amber-700' : 'text-amber-200/80'
                    }`}>
                      <span>Уровень клана</span>
                      <span className={isLight ? 'text-amber-800' : 'text-amber-300'}>
                        {clan.level}
                      </span>
                    </div>
                    <div className={`flex justify-between ${
                      isLight ? 'text-amber-700' : 'text-amber-200/80'
                    }`}>
                      <span>Участники</span>
                      <span className={isLight ? 'text-amber-800' : 'text-amber-300'}>
                        {clan.members.length}
                      </span>
                    </div>
                    <div className={`flex justify-between ${
                      isLight ? 'text-amber-700' : 'text-amber-200/80'
                    }`}>
                      <span>Общий опыт</span>
                      <span className={isLight ? 'text-amber-800' : 'text-amber-300'}>
                        {clan.total_xp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Center - Quests */}
            <div className="xl:col-span-6 space-y-6">
              <FocusSelector
                currentFocus={user.current_focus}
                onSelectFocus={handleSelectFocus}
                loading={generatingQuests}
              />
              <QuestList
                quests={quests}
                onComplete={handleCompleteQuest}
                onDelete={handleDeleteQuest}
              />
            </div>

            {/* Right Sidebar - Social */}
            <div className="xl:col-span-3 space-y-6">
              {settings.showFriends && friends.length > 0 && (
                <FriendsList friends={friends} />
              )}
              {settings.showActivities && activities.length > 0 && (
                <ActivityFeed activities={activities} />
              )}
            </div>
          </div>

          {/* Clan Quests Section - Full Width */}
          {clanQuests.length > 0 && (
            <div className="mt-6">
              <ClanQuestList
                quests={clanQuests}
                onContribute={handleClanQuestContribute}
                currentUsername={user.username}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`mt-12 pb-6 text-center ${
          isLight ? 'text-amber-600/60' : 'text-amber-200/40'
        }`}>
          <p>Приключения вместе, величие навсегда...</p>
        </div>
      </div>
    </div>
  );
}
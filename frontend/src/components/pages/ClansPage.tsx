import { useCallback, useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { clanQuestsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Clan, ClanQuest } from '../../types';
import { ClanQuestList } from '../quests/ClanQuestList';
import { ClanCreationPanel } from '../social/ClanCreationPanel';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../ui/Loader';

export function ClansPage() {
  const { user, refreshUser } = useAuth();
  const [clan, setClan] = useState<Clan | null>(null);
  const [clanQuests, setClanQuests] = useState<ClanQuest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        socialAPI.getClan().catch(() => null),
        clanQuestsAPI.getAll().catch(() => []),
      ]);

      const [clanRes, clanQuestsRes] = results;
      if (clanRes.status === 'fulfilled') setClan(clanRes.value || null);
      if (clanQuestsRes.status === 'fulfilled') setClanQuests(clanQuestsRes.value || []);
    } catch (error) {
      console.error('Failed to load clan data:', error);
      setClan(null);
      setClanQuests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClanQuestContribute = async (id: number, contribution: number) => {
    try {
      const updatedClanQuest = await clanQuestsAPI.contribute(id, contribution);
      setClanQuests((prev) => prev.map((cq) => (cq.id === id ? updatedClanQuest : cq)));
      await refreshUser();
    } catch (error) {
      console.error('Failed to contribute to clan quest:', error);
    }
  };

  if (!user || loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1920px] mx-auto px-6 py-8 space-y-12">
        <div className="panel-base panel-purple p-6">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-purple-400" />
            <h2 className="text-purple-300">Клан</h2>
          </div>
          {clan ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-purple-200/80">
                <span>Название</span>
                <span className="text-purple-300">{clan.name}</span>
              </div>
              <div className="flex justify-between text-purple-200/80">
                <span>Уровень клана</span>
                <span className="text-purple-300">{clan.level || 1}</span>
              </div>
              <div className="flex justify-between text-purple-200/80">
                <span>Участники</span>
                <span className="text-purple-300">{clan.members?.length || 0}</span>
              </div>
              <div className="flex justify-between text-purple-200/80">
                <span>Общий опыт</span>
                <span className="text-purple-300">{(clan.total_xp || 0).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <ClanCreationPanel onClanCreated={loadData} />
          )}
        </div>

        {clanQuests.length > 0 && (
          <div>
            <ClanQuestList
              quests={clanQuests}
              onContribute={handleClanQuestContribute}
              currentUsername={user.username}
            />
          </div>
        )}
      </div>
    </div>
  );
}

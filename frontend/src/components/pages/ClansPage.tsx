import { useCallback, useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { clanQuestsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Clan, ClanQuest } from '../../types';
import { ClanQuestList } from '../quests/ClanQuestList';
import { ClanCreationPanel } from '../social/ClanCreationPanel';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../ui/Loader';
import { Button } from '../ui/Button';

export function ClansPage() {
  const { user, refreshUser } = useAuth();
  const [clan, setClan] = useState<Clan | null>(null);
  const [clanQuests, setClanQuests] = useState<ClanQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuests, setGeneratingQuests] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

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

  const handleDeleteClanQuest = async (id: number) => {
    try {
      await clanQuestsAPI.delete(id);
      setClanQuests((prev) => prev.filter((cq) => cq.id !== id));
    } catch (error) {
      console.error('Failed to delete clan quest:', error);
    }
  };

  const handleGenerateClanQuests = async () => {
    setGeneratingQuests(true);
    setGenerateError(null);
    try {
      await clanQuestsAPI.generate();
      const refreshed = await clanQuestsAPI.getAll();
      setClanQuests(refreshed);
    } catch (error) {
      console.error('Failed to generate clan quests:', error);
      if ((error as any)?.response) {
        const data = (error as any).response?.data;
        const detail =
          typeof data === 'string'
            ? data
            : data?.detail || data?.message || JSON.stringify(data);
        const status = (error as any).response?.status;
        setGenerateError(detail ? `Ошибка ${status ?? ''}: ${detail}`.trim() : 'Не удалось сгенерировать задания для клана.');
      } else {
        setGenerateError('Не удалось сгенерировать задания для клана.');
      }
    } finally {
      setGeneratingQuests(false);
    }
  };

  if (!user || loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1920px] mx-auto px-6 py-8 space-y-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
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

          <div className="panel-base panel-teal p-6">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-purple-400" />
              <h2 className="text-purple-300">Информация о вашем клане</h2>
            </div>
            {clan ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-3">
                    <p className="text-xs text-purple-200/60">Уровень</p>
                    <p className="text-lg text-purple-200">{clan.level || 1}</p>
                  </div>
                  <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-3">
                    <p className="text-xs text-purple-200/60">Общий опыт</p>
                    <p className="text-lg text-purple-200">{(clan.total_xp || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-purple-200/60 mb-2">Участники</p>
                  <div className="space-y-2">
                    {clan.members?.length ? (
                      clan.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-lg border border-purple-600/20 bg-slate-950/40 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-purple-200 truncate">{member.username}</p>
                            <p className="text-xs text-purple-200/50">Уровень {member.level}</p>
                          </div>
                          <span className="text-xs text-purple-200/60">{member.contribution} XP</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-purple-200/40 text-sm">
                        Пока нет участников
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-purple-200/40 text-sm">
                Вы еще не состоите в клане
              </div>
            )}
          </div>
        </div>

        {clan && (
          <div className="panel-base panel-orange p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-purple-200">Генерация клановых заданий</h3>
                <p className="text-sm text-purple-200/60">
                  Случайные задания для всего клана из общей библиотеки.
                </p>
              </div>
              <Button onClick={handleGenerateClanQuests} disabled={generatingQuests}>
                {generatingQuests ? 'Генерация...' : 'Сгенерировать'}
              </Button>
            </div>
            {generateError && (
              <p className="text-sm text-amber-200/80 mt-3">
                {generateError}
              </p>
            )}
          </div>
        )}
        {clan && (
          <div>
            <ClanQuestList
              quests={clanQuests}
              onContribute={handleClanQuestContribute}
              onDelete={handleDeleteClanQuest}
              currentUsername={user.username}
            />
          </div>
        )}
      </div>
    </div>
  );
}

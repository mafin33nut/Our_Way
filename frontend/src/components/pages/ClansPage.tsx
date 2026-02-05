import { useCallback, useEffect, useMemo, useState } from 'react';
import { Crown } from 'lucide-react';
import { clanQuestsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Clan, ClanQuest } from '../../types';
import { ClanQuestList } from '../quests/ClanQuestList';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../ui/Loader';
import { Button } from '../ui/Button';
import { PanelHelp } from '../ui/PanelHelp';

export function ClansPage() {
  const { user, refreshUser } = useAuth();
  const [clans, setClans] = useState<Clan[]>([]);
  const [selectedClanId, setSelectedClanId] = useState<number | null>(null);
  const [clanQuests, setClanQuests] = useState<ClanQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clanQuestTitle, setClanQuestTitle] = useState('');
  const [clanQuestDescription, setClanQuestDescription] = useState('');
  const [clanQuestMaxParticipants, setClanQuestMaxParticipants] = useState(2);
  const [clanQuestDifficulty, setClanQuestDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [creatingClanQuest, setCreatingClanQuest] = useState(false);
  const [createClanQuestError, setCreateClanQuestError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const results = await Promise.allSettled([
        socialAPI.getMyClans().catch(() => []),
        clanQuestsAPI.getAll().catch(() => []),
      ]);

      const [clansRes, clanQuestsRes] = results;
      const clanList = clansRes.status === 'fulfilled' ? clansRes.value || [] : [];
      if (clansRes.status === 'fulfilled') setClans(clanList);
      if (clanQuestsRes.status === 'fulfilled') setClanQuests(clanQuestsRes.value || []);
      if (clanList.length > 0) {
        setSelectedClanId((prev) =>
          prev && clanList.some((clanItem) => clanItem.id === prev) ? prev : null
        );
      } else {
        setSelectedClanId(null);
      }
    } catch (error) {
      console.error('Failed to load clan data:', error);
      setLoadError('Не удалось загрузить данные кланов.');
      setClans([]);
      setSelectedClanId(null);
      setClanQuests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClanCreated = async () => {
    await refreshUser();
    await loadData();
  };

  const handleClanQuestContribute = async (id: number) => {
    try {
      const updatedClanQuest = await clanQuestsAPI.contribute(id);
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

  const handleCreateClanQuest = async () => {
    if (!selectedClan) {
      setCreateClanQuestError('Выберите клан для создания квеста.');
      return;
    }
    if (!clanQuestTitle.trim()) {
      return;
    }
    setCreatingClanQuest(true);
    setCreateClanQuestError(null);
    try {
      const created = await clanQuestsAPI.create({
        clan: selectedClan.id,
        title: clanQuestTitle.trim(),
        description: clanQuestDescription.trim(),
        max_participants: clanQuestMaxParticipants,
        difficulty: clanQuestDifficulty,
      });
      setClanQuests((prev) => [created, ...prev]);
      setClanQuestTitle('');
      setClanQuestDescription('');
      setClanQuestMaxParticipants(2);
      setClanQuestDifficulty('easy');
    } catch (error) {
      console.error('Failed to create clan quest:', error);
      const err = error as any;
      setCreateClanQuestError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Не удалось создать клановый квест.'
      );
    } finally {
      setCreatingClanQuest(false);
    }
  };



  const selectedClan = useMemo(
    () => clans.find((item) => item.id === selectedClanId) || null,
    [clans, selectedClanId]
  );
  const selectedClanQuests = selectedClan
    ? clanQuests.filter((quest) => quest.clan === selectedClan.id)
    : [];

  if (!user || loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1400px] flex flex-col gap-12">
          <div className="panel-caption text-left">Кланы</div>
          <div className="panel-base panel-purple p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-teal-300" />
              <h2 className="text-slate-100">Мои кланы</h2>
            </div>
            <div className="rounded-lg border border-slate-600/40 bg-slate-950/40 p-4">
              {clans.length === 0 ? (
                <p className="text-slate-300/70 text-sm">Вы пока не состоите в кланах.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-300/80">
                      <tr>
                        <th className="px-3 py-2 text-left">Клан</th>
                        <th className="px-3 py-2 text-left">Участники</th>
                        <th className="px-3 py-2 text-right">Переключить</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clans.map((clan) => (
                        <tr
                          key={clan.id}
                          className="border-t border-slate-600/30"
                        >
                          <td className="px-3 py-3 text-slate-100">{clan.name}</td>
                          <td className="px-3 py-3 text-slate-300/70">
                            {clan.members?.length || 0}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={() => setSelectedClanId(clan.id)}
                              className={`rounded-lg border text-xs transition-colors px-9 py-2.5 ${
                                selectedClanId === clan.id
                                  ? 'border-teal-300/60 bg-teal-400/10 text-teal-100'
                                  : 'border-slate-600/60 text-slate-300/70 hover:border-slate-500/60'
                              }`}
                            >
                              Переключиться
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          {loadError && (
            <div className="panel-base panel-orange p-6">
              <p className="text-slate-200">{loadError}</p>
            </div>
          )}



        {selectedClan && (
          <div className="panel-base panel-orange p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-teal-300" />
              <h2 className="text-slate-100">Создать клановый квест</h2>
            </div>
            <PanelHelp>
              <p>1) Опишите цель так, чтобы её понял весь клан.</p>
              <p>2) Укажите лимит участников — квест закроется по достижению лимита.</p>
              <p>3) После создания пригласите участников в ленте клана.</p>
            </PanelHelp>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
              <div className="space-y-3">
                <input
                  value={clanQuestTitle}
                  onChange={(e) => setClanQuestTitle(e.target.value)}
                  placeholder="Название квеста"
                  className="w-full rounded-lg border border-slate-600/40 bg-slate-950/50 px-3 py-2 text-slate-100"
                />
                <textarea
                  value={clanQuestDescription}
                  onChange={(e) => setClanQuestDescription(e.target.value)}
                  placeholder="Описание"
                  rows={3}
                  className="w-full rounded-lg border border-slate-600/40 bg-slate-950/50 px-3 py-2 text-slate-100"
                />
              </div>
              <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-4 space-y-3">
                <p className="text-sm text-slate-200">Параметры</p>
                <label className="text-slate-300/80 text-sm flex flex-col gap-2">
                  Сложность
                  <select
                    value={clanQuestDifficulty}
                    onChange={(e) => setClanQuestDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="rounded-lg border border-slate-600/40 bg-slate-950/60 px-2 py-2 text-slate-100"
                  >
                    <option value="easy">Легкая — 100 XP</option>
                    <option value="medium">Средняя — 150 XP</option>
                    <option value="hard">Сложная — 200 XP</option>
                  </select>
                </label>
                <label className="text-slate-300/80 text-sm flex items-center justify-between">
                  Макс. участников
                  <input
                    type="number"
                    min={1}
                    value={clanQuestMaxParticipants}
                    onChange={(e) =>
                      setClanQuestMaxParticipants(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-20 rounded-lg border border-slate-600/40 bg-slate-950/60 px-2 py-1 text-slate-100"
                  />
                </label>
              </div>
            </div>
            {createClanQuestError && (
              <p className="text-sm text-rose-200 mt-3">{createClanQuestError}</p>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleCreateClanQuest}
                disabled={creatingClanQuest || !clanQuestTitle.trim() || !selectedClan}
                className="action-button"
              >
                {creatingClanQuest ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </div>
        )}

        {selectedClan && (
          <div>
            <ClanQuestList
              quests={selectedClanQuests}
              onContribute={handleClanQuestContribute}
              onDelete={handleDeleteClanQuest}
              currentUsername={user.username}
            />
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

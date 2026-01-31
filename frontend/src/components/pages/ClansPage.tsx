import { useCallback, useEffect, useMemo, useState } from 'react';
import { Crown, User as UserIcon } from 'lucide-react';
import { clanQuestsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Clan, ClanQuest } from '../../types';
import { ClanQuestList } from '../quests/ClanQuestList';
import { ClanCreationPanel } from '../social/ClanCreationPanel';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../ui/Loader';
import { Button } from '../ui/Button';
import { resolveMediaUrl } from '../../utils/media';

export function ClansPage() {
  const { user, refreshUser } = useAuth();
  const [clans, setClans] = useState<Clan[]>([]);
  const [selectedClanId, setSelectedClanId] = useState<number | null>(null);
  const [clanQuests, setClanQuests] = useState<ClanQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generatingQuests, setGeneratingQuests] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

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
          prev && clanList.some((clanItem) => clanItem.id === prev) ? prev : clanList[0].id
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

  const handleGenerateClanQuests = async () => {
    setGeneratingQuests(true);
    setGenerateError(null);
    try {
      await clanQuestsAPI.generate(selectedClanId ?? undefined);
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
        setGenerateError(detail ? `Ошибка ${status ?? ''}: ${detail}`.trim() : 'Не удалось сгенерировать квесты для клана.');
      } else {
        setGenerateError('Не удалось сгенерировать квесты для клана.');
      }
    } finally {
      setGeneratingQuests(false);
    }
  };

  if (!user || loading) {
    return <Loader />;
  }

  const selectedClan = useMemo(
    () => clans.find((item) => item.id === selectedClanId) || null,
    [clans, selectedClanId]
  );
  const members = selectedClan?.members
    ? [...selectedClan.members].sort(
        (a, b) => (b.level ?? 0) - (a.level ?? 0) || a.username.localeCompare(b.username)
      )
    : [];
  const selectedClanQuests = selectedClan
    ? clanQuests.filter((quest) => quest.clan === selectedClan.id)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <div className="max-w-[1920px] mx-auto px-6 py-8 space-y-12">
        <div className="panel-caption text-left">Кланы</div>
        {loadError && (
          <div className="panel-base panel-orange p-6">
            <p className="text-slate-200">{loadError}</p>
          </div>
        )}

        {clans.length === 0 ? (
          <div className="panel-base panel-purple p-6">
            <ClanCreationPanel onClanCreated={handleClanCreated} />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <div className="panel-base panel-purple p-6">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-teal-300" />
              <h2 className="text-slate-100">Клан</h2>
            </div>
            {clans.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {clans.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedClanId(item.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                      selectedClanId === item.id
                        ? 'border-teal-300/60 bg-teal-400/10 text-teal-100'
                        : 'border-slate-600/60 text-slate-300/70 hover:border-slate-500/60'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
            {selectedClan ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300/80">
                  <span>Название</span>
                  <span className="text-slate-100">{selectedClan.name}</span>
                </div>
                <div className="flex justify-between text-slate-300/80">
                  <span>Уровень клана</span>
                  <span className="text-slate-100">{selectedClan.level || 1}</span>
                </div>
                <div className="flex justify-between text-slate-300/80">
                  <span>Участники</span>
                  <span className="text-slate-100">{selectedClan.members?.length || 0}</span>
                </div>
                <div className="flex justify-between text-slate-300/80">
                  <span>Общий опыт</span>
                  <span className="text-slate-100">
                    {(selectedClan.total_xp || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <ClanCreationPanel onClanCreated={handleClanCreated} />
            )}
          </div>

          <div className="panel-base panel-teal p-6">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-teal-300" />
              <h2 className="text-slate-100">Информация о вашем клане</h2>
            </div>
            {selectedClan ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-300/70">Уровень</p>
                    <p className="text-lg text-slate-100">{selectedClan.level || 1}</p>
                  </div>
                  <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-300/70">Общий опыт</p>
                    <p className="text-lg text-slate-100">
                      {(selectedClan.total_xp || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-slate-300/70 mb-2">Участники</p>
                  <div className="space-y-2">
                    {members.length ? (
                      members.map((member, index) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-lg border border-slate-600/40 bg-slate-900/50 px-3 py-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs text-slate-300/70 w-5 text-right">
                              {index + 1}
                            </span>
                            {resolveMediaUrl(member.avatar) ? (
                              <img
                                src={resolveMediaUrl(member.avatar) as string}
                                alt={member.username}
                                className="w-8 h-8 rounded-full object-cover border border-teal-300/60"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-800/70 border border-teal-300/60 flex items-center justify-center text-slate-200">
                                <UserIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm text-slate-200 truncate">{member.username}</p>
                              <p className="text-xs text-slate-300/60">
                                Уровень {member.level}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-300/70">
                            {member.contribution} XP
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-300/60 text-sm">
                        Пока нет участников
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-slate-300/60 text-sm">
                Вы еще не состоите в клане
              </div>
            )}
          </div>
        </div>
        )}

        {selectedClan && (
          <div className="panel-base panel-orange p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-slate-100">Генерация клановых квестов</h3>
                <p className="text-sm text-slate-300/60">
                  Случайные квесты для всего клана из общей библиотеки.
                </p>
              </div>
              <Button onClick={handleGenerateClanQuests} disabled={generatingQuests}>
                {generatingQuests ? 'Генерация...' : 'Сгенерировать'}
              </Button>
            </div>
            {generateError && (
              <p className="text-sm text-amber-200/80 mt-3">{generateError}</p>
            )}
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
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Crown, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';
import { useAuth } from '../../hooks/useAuth';
import { socialAPI } from '../../api/social';
import { Clan, ClanQuest } from '../../types';
import { ClanCreationPanel } from './ClanCreationPanel';
import { clanQuestsAPI } from '../../api/quests';
import { ClanQuestList } from '../quests/ClanQuestList';

type ClanHubPanelProps = {
  className?: string;
};

export function ClanHubPanel({ className = '' }: ClanHubPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClanId, setSelectedClanId] = useState<number | null>(null);

  const [joinLink, setJoinLink] = useState('');
  const [joinLinkPassword, setJoinLinkPassword] = useState('');
  const [joinLinkStatus, setJoinLinkStatus] = useState<string | null>(null);
  const [joinLinkLoading, setJoinLinkLoading] = useState(false);

  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveStatus, setLeaveStatus] = useState<string | null>(null);

  const [clanQuests, setClanQuests] = useState<ClanQuest[]>([]);
  const [loadingClanQuests, setLoadingClanQuests] = useState(false);
  const [clanQuestTitle, setClanQuestTitle] = useState('');
  const [clanQuestDescription, setClanQuestDescription] = useState('');
  const [clanQuestMaxParticipants, setClanQuestMaxParticipants] = useState(2);
  const [clanQuestDifficulty, setClanQuestDifficulty] =
    useState<'easy' | 'medium' | 'hard'>('easy');
  const [creatingClanQuest, setCreatingClanQuest] = useState(false);
  const [clanQuestStatus, setClanQuestStatus] = useState<string | null>(null);

  const { settings } = useCustomization();
  const { user } = useAuth();
  const isLight = settings.theme === 'light';

  const loadClans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await socialAPI.getMyClans().catch(() => []);
      setClans(list || []);
      setSelectedClanId((prev) =>
        prev && list.some((item) => item.id === prev) ? prev : list[0]?.id ?? null,
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;
    loadClans();
    (async () => {
      setLoadingClanQuests(true);
      try {
        const list = await clanQuestsAPI.getAll().catch(() => []);
        setClanQuests(list || []);
      } finally {
        setLoadingClanQuests(false);
      }
    })();
  }, [isOpen, loadClans]);

  const extractClanIdFromLink = (value: string): number | null => {
    const match = value.match(/(\d+)/g);
    if (!match || match.length === 0) return null;
    const candidate = Number(match[match.length - 1]);
    return Number.isFinite(candidate) ? candidate : null;
  };

  const handleJoinByLink = async () => {
    const clanId = extractClanIdFromLink(joinLink.trim());
    if (!clanId) {
      setJoinLinkStatus('Не удалось распознать ID клана в ссылке.');
      return;
    }
    setJoinLinkLoading(true);
    setJoinLinkStatus(null);
    try {
      await socialAPI.requestJoinClan(clanId, joinLinkPassword.trim() || undefined);
      setJoinLinkStatus('Запрос на вступление отправлен.');
      setJoinLink('');
      setJoinLinkPassword('');
    } catch (error: any) {
      console.error('Failed to join clan by link:', error);
      setJoinLinkStatus(error?.response?.data?.detail || 'Не удалось отправить запрос.');
    } finally {
      setJoinLinkLoading(false);
    }
  };

  const selectedClan = useMemo(
    () => clans.find((item) => item.id === selectedClanId) || null,
    [clans, selectedClanId],
  );

  const selectedClanQuests = useMemo(() => {
    if (!selectedClan) return [];
    return clanQuests.filter((q) => q.clan === selectedClan.id);
  }, [clanQuests, selectedClan]);

  const handleClanQuestContribute = async (id: number) => {
    try {
      const updated = await clanQuestsAPI.contribute(id);
      setClanQuests((prev) => prev.map((q) => (q.id === id ? updated : q)));
    } catch (error) {
      console.error('Failed to contribute to clan quest:', error);
    }
  };

  const handleDeleteClanQuest = async (id: number) => {
    try {
      await clanQuestsAPI.delete(id);
      setClanQuests((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error('Failed to delete clan quest:', error);
    }
  };

  const handleCreateClanQuest = async () => {
    if (!selectedClan) return;
    if (!clanQuestTitle.trim()) return;
    setCreatingClanQuest(true);
    setClanQuestStatus(null);
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
      setClanQuestStatus('Клановый квест создан.');
    } catch (error: any) {
      console.error('Failed to create clan quest:', error);
      setClanQuestStatus(error?.response?.data?.detail || 'Не удалось создать клановый квест.');
    } finally {
      setCreatingClanQuest(false);
    }
  };

  const handleLeaveClan = async () => {
    if (!selectedClan) return;
    setLeaveLoading(true);
    setLeaveStatus(null);
    try {
      await socialAPI.leaveClan(selectedClan.id);
      await loadClans();
      setLeaveStatus(
        selectedClan.members?.length === 1 ? 'Клан удален.' : 'Вы покинули клан.',
      );
    } catch (error: any) {
      console.error('Failed to leave clan:', error);
      setLeaveStatus(error?.response?.data?.detail || 'Не удалось выйти из клана.');
    } finally {
      setLeaveLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        size="md"
        onClick={() => setIsOpen(true)}
        aria-label="Открыть кланы"
        className={`flex items-center gap-2 sm:flex-col sm:gap-2 sm:px-4 sm:py-3 sm:text-base sm:rounded-xl sm:border ${
          isLight
            ? 'sm:border-slate-200 sm:bg-white/90 sm:hover:bg-slate-100 text-slate-900'
            : 'sm:border-slate-600/60 sm:bg-slate-800/50 sm:hover:bg-slate-800/80 text-white'
        } ${className}`}
      >
        <Crown className="w-5 h-5 sm:hidden" />
        <span className="hidden sm:inline">Кланы</span>
      </Button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[80]">
            <button
              type="button"
              className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть окно кланов"
            />
            <div
              className={`absolute right-0 top-0 h-full w-full max-w-full sm:max-w-[52vw] ${
                isLight
                  ? 'bg-white border-l border-slate-200'
                  : 'bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-l border-slate-700/60'
              }`}
            >
              <div
                className={`flex items-center justify-between px-6 py-4 border-b ${
                  isLight ? 'border-slate-200' : 'border-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Crown className={isLight ? 'text-slate-800' : 'text-teal-200'} />
                  <h2 className={isLight ? 'text-slate-900' : 'text-slate-100'}>Кланы</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-[calc(100%-72px)] overflow-y-auto px-8 sm:px-10 py-8 sm:py-10 space-y-8">
                {!user ? (
                  <div className={isLight ? 'text-sm text-teal-800' : 'text-sm text-slate-300/70'}>
                    Войдите, чтобы управлять кланами.
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Панель: Ваши кланы */}
                    <div
                      className={
                        isLight
                          ? 'rounded-2xl bg-white border border-teal-200/80 shadow-xl p-8'
                          : 'panel-base panel-teal p-8'
                      }
                    >
                      <div className="flex items-center gap-2 mb-6">
                        <Crown className={`w-5 h-5 ${isLight ? 'text-teal-600' : 'text-teal-300'}`} />
                        <h3 className={isLight ? 'text-slate-900' : 'text-slate-100'}>Ваши кланы</h3>
                      </div>
                      {loading ? (
                        <div className={`text-sm ${isLight ? 'text-teal-700' : 'text-slate-300/70'}`}>
                          Загрузка списка кланов...
                        </div>
                      ) : clans.length === 0 ? (
                        <div className={`text-sm ${isLight ? 'text-teal-700' : 'text-slate-300/70'}`}>
                          Вы пока не состоите в кланах.
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-3">
                            {clans.map((clan) => (
                              <button
                                key={clan.id}
                                onClick={() => setSelectedClanId(clan.id)}
                                className={`rounded-xl border text-sm font-medium transition-colors px-6 py-3 ${
                                  selectedClanId === clan.id
                                    ? isLight
                                      ? 'border-teal-500 bg-teal-100/80 text-teal-800'
                                      : 'border-teal-300/60 bg-teal-400/20 text-teal-100'
                                    : isLight
                                      ? 'border-teal-200 text-teal-800 hover:border-teal-400 hover:bg-teal-50'
                                      : 'border-teal-600/50 text-teal-200/90 hover:border-teal-500/60 hover:bg-teal-500/10'
                                }`}
                              >
                                {clan.name}
                              </button>
                            ))}
                          </div>
                          {selectedClan && (
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                              <Button
                                onClick={handleLeaveClan}
                                disabled={leaveLoading}
                                size="md"
                                className={
                                  isLight
                                    ? 'px-5 py-3 rounded-xl text-base bg-teal-600 text-white hover:bg-teal-700 border-0'
                                    : 'px-5 py-3 rounded-xl text-base bg-teal-500/30 text-teal-100 hover:bg-teal-500/50 border border-teal-400/50'
                                }
                              >
                                {leaveLoading
                                  ? 'Обработка...'
                                  : (selectedClan.members?.length || 0) <= 1
                                    ? 'Удалить клан'
                                    : 'Покинуть клан'}
                              </Button>
                              {leaveStatus && (
                                <span className={`text-sm ${isLight ? 'text-teal-700' : 'text-slate-300/70'}`}>
                                  {leaveStatus}
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Панель: Вступить по ссылке */}
                    <div
                      className={
                        isLight
                          ? 'rounded-2xl bg-white border border-teal-200/80 shadow-xl p-8'
                          : 'panel-base panel-teal p-8'
                      }
                    >
                      <h3 className={`text-base font-medium mb-4 ${isLight ? 'text-slate-900' : 'text-slate-200/90'}`}>
                        Вступить в приватный клан по ссылке
                      </h3>
                      <div
                        className={`rounded-xl border p-5 ${
                          isLight ? 'border-teal-200 bg-teal-50/50' : 'border-teal-600/40 bg-teal-950/30'
                        }`}
                      >
                        <div className="flex flex-col gap-4">
                          <input
                            value={joinLink}
                            onChange={(e) => setJoinLink(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoinByLink()}
                            placeholder="Вставьте ссылку или ID клана"
                            className={`w-full rounded-xl border px-4 py-3 text-base ${
                              isLight
                                ? 'border-teal-300 bg-white text-slate-900'
                                : 'border-teal-600/40 bg-teal-950/40 text-slate-100'
                            }`}
                          />
                          <input
                            value={joinLinkPassword}
                            onChange={(e) => setJoinLinkPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoinByLink()}
                            placeholder="Пароль (если нужен)"
                            type="password"
                            className={`w-full rounded-xl border px-4 py-3 text-base ${
                              isLight
                                ? 'border-teal-300 bg-white text-slate-900'
                                : 'border-teal-600/40 bg-teal-950/40 text-slate-100'
                            }`}
                          />
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <span className={`text-sm ${isLight ? 'text-teal-700' : 'text-slate-300/70'}`}>
                              {joinLinkLoading ? 'Отправка запроса...' : 'Нажмите Enter, чтобы отправить запрос'}
                            </span>
                            {joinLinkStatus && (
                              <span className={`text-sm ${isLight ? 'text-teal-700' : 'text-slate-300/70'}`}>
                                {joinLinkStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleJoinByLink}
                        disabled={joinLinkLoading}
                        size="md"
                        className={`mt-4 px-5 py-3 rounded-xl text-base ${isLight ? 'bg-teal-600 text-white hover:bg-teal-700' : 'action-button'}`}
                      >
                        {joinLinkLoading ? 'Отправка...' : 'Отправить запрос'}
                      </Button>
                    </div>

                    {/* Панель: Создать новый клан */}
                    <div
                      className={
                        isLight
                          ? 'rounded-2xl bg-white border border-teal-200/80 shadow-xl p-8'
                          : 'panel-base panel-teal p-8'
                      }
                    >
                      <h3 className={`text-base font-medium mb-6 ${isLight ? 'text-slate-900' : 'text-slate-200/90'}`}>
                        Создать новый клан
                      </h3>
                      <ClanCreationPanel onClanCreated={loadClans} />
                    </div>

                    {/* Панель: Клановые квесты + Создать клановый квест (только при выбранном клане) */}
                    {selectedClan && (
                      <>
                        <div
                          className={
                            isLight
                              ? 'rounded-2xl bg-white border border-amber-200/80 shadow-md p-8'
                              : 'panel-base panel-orange p-8'
                          }
                        >
                          <div className={isLight ? 'text-slate-900 font-medium mb-6 text-base' : 'panel-caption text-left'}>
                            Клановые квесты
                          </div>
                          {loadingClanQuests ? (
                            <div className={`text-sm ${isLight ? 'text-amber-800' : 'text-slate-300/70'}`}>
                              Загрузка квестов...
                            </div>
                          ) : (
                            <ClanQuestList
                              quests={selectedClanQuests}
                              onContribute={handleClanQuestContribute}
                              onDelete={handleDeleteClanQuest}
                              currentUsername={user.username}
                            />
                          )}
                        </div>

                        <div
                          className={
                            isLight
                              ? 'rounded-2xl bg-white border border-teal-200/80 shadow-md p-8'
                              : 'panel-base panel-teal p-8'
                          }
                        >
                          <div className={isLight ? 'text-slate-900 font-medium mb-6 text-base' : 'panel-caption text-left'}>
                            Создать клановый квест
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
                            <div className="space-y-4">
                              <input
                                value={clanQuestTitle}
                                onChange={(e) => setClanQuestTitle(e.target.value)}
                                placeholder="Название квеста"
                                className={`w-full rounded-xl border px-4 py-3 text-base ${
                                  isLight
                                    ? 'border-teal-300 bg-white text-slate-900'
                                    : 'border-teal-600/30 bg-teal-950/30 text-slate-100'
                                }`}
                              />
                              <textarea
                                value={clanQuestDescription}
                                onChange={(e) => setClanQuestDescription(e.target.value)}
                                placeholder="Описание"
                                rows={3}
                                className={`w-full rounded-xl border px-4 py-3 text-base ${
                                  isLight
                                    ? 'border-teal-300 bg-white text-slate-900'
                                    : 'border-teal-600/30 bg-teal-950/30 text-slate-100'
                                }`}
                              />
                            </div>
                            <div
                              className={`rounded-xl border p-5 space-y-4 ${
                                isLight
                                  ? 'border-teal-200 bg-teal-50/50'
                                  : 'border-teal-600/30 bg-teal-950/25'
                              }`}
                            >
                              <label className="text-sm flex flex-col gap-2">
                                <span className={isLight ? 'text-slate-800' : 'text-slate-200/80'}>Сложность</span>
                                <select
                                  value={clanQuestDifficulty}
                                  onChange={(e) =>
                                    setClanQuestDifficulty(e.target.value as 'easy' | 'medium' | 'hard')
                                  }
                                  className={`rounded-xl border px-4 py-3 text-base w-full ${
                                    isLight
                                      ? 'border-teal-300 bg-white text-slate-900'
                                      : 'border-teal-600/30 bg-teal-950/40 text-slate-100'
                                  }`}
                                >
                                  <option value="easy">Легкая</option>
                                  <option value="medium">Средняя</option>
                                  <option value="hard">Сложная</option>
                                </select>
                              </label>
                              <label className="text-sm flex items-center justify-between gap-3">
                                <span className={isLight ? 'text-slate-800' : 'text-slate-200/80'}>
                                  Макс. участников
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  value={clanQuestMaxParticipants}
                                  onChange={(e) =>
                                    setClanQuestMaxParticipants(Math.max(1, Number(e.target.value) || 1))
                                  }
                                  className={`w-28 rounded-xl border px-4 py-3 text-base ${
                                    isLight
                                      ? 'border-teal-300 bg-white text-slate-900'
                                      : 'border-teal-600/30 bg-teal-950/40 text-slate-100'
                                  }`}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
                            {clanQuestStatus && (
                              <span className={isLight ? 'text-sm text-teal-700' : 'text-sm text-slate-200/70'}>
                                {clanQuestStatus}
                              </span>
                            )}
                            <Button
                              onClick={handleCreateClanQuest}
                              disabled={creatingClanQuest || !clanQuestTitle.trim()}
                              size="md"
                              className={`px-5 py-3 rounded-xl text-base ${isLight ? 'bg-teal-600 text-white hover:bg-teal-700' : 'action-button'}`}
                            >
                              {creatingClanQuest ? 'Создание...' : 'Создать'}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
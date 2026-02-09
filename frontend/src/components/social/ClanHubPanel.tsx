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

              <div className="h-[calc(100%-72px)] overflow-y-auto px-[28px] py-[28px] space-y-[19px]">
                {!user ? (
                  <div className={isLight ? 'text-sm text-slate-600' : 'text-sm text-slate-300/70'}>
                    Войдите, чтобы управлять кланами.
                  </div>
                ) : (
                  <div
                    className={
                      isLight
                        ? 'rounded-2xl bg-white border border-slate-200 shadow-xl p-6'
                        : 'panel-base panel-teal p-6'
                    }
                  >
                    {/* Заголовок панели */}
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="w-5 h-5 text-teal-300" />
                      <h2 className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                        Найти / вступить / создать клан
                      </h2>
                    </div>

                    <div className="space-y-6">
                      {/* Ваши кланы */}
                      {/* ... остальной код как выше ... */}
                    </div>
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
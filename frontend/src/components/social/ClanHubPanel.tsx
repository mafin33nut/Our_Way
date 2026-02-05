import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Crown, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';
import { useAuth } from '../../hooks/useAuth';
import { socialAPI } from '../../api/social';
import { Clan } from '../../types';
import { ClanCreationPanel } from './ClanCreationPanel';

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
        prev && list.some((item) => item.id === prev) ? prev : list[0]?.id ?? null
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      loadClans();
    }
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
    [clans, selectedClanId]
  );

  const handleLeaveClan = async () => {
    if (!selectedClan) return;
    setLeaveLoading(true);
    setLeaveStatus(null);
    try {
      await socialAPI.leaveClan(selectedClan.id);
      await loadClans();
      setLeaveStatus(selectedClan.members?.length === 1 ? 'Клан удален.' : 'Вы покинули клан.');
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
        className={`flex items-center gap-2 ${className}`}
      >
        <Crown className="w-5 h-5" />
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
                  <Crown className={`${isLight ? 'text-slate-800' : 'text-teal-200'}`} />
                  <h2 className={`${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Кланы</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-[calc(100%-72px)] overflow-y-auto px-[19px] py-[19px] space-y-[19px]">
                {!user && (
                  <div className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300/70'}`}>
                    Войдите, чтобы управлять кланами.
                  </div>
                )}
                {user && (
                  <>
                    <div className="panel-base panel-purple p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-teal-300" />
                        <h2 className="text-slate-100">Ваши кланы</h2>
                      </div>
                      {loading ? (
                        <div className="text-sm text-slate-300/70">Загрузка списка кланов...</div>
                      ) : clans.length === 0 ? (
                        <div className="text-sm text-slate-300/70">Вы пока не состоите в кланах.</div>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-2">
                            {clans.map((clan) => (
                              <button
                                key={clan.id}
                                onClick={() => setSelectedClanId(clan.id)}
                                className={`rounded-lg border text-xs transition-colors px-6 py-2 ${
                                  selectedClanId === clan.id
                                    ? 'border-teal-300/60 bg-teal-400/10 text-teal-100'
                                    : 'border-slate-600/60 text-slate-300/70 hover:border-slate-500/60'
                                }`}
                              >
                                {clan.name}
                              </button>
                            ))}
                          </div>
                          {selectedClan && (
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <Button
                                onClick={handleLeaveClan}
                                disabled={leaveLoading}
                                className="bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 border border-slate-600/60"
                              >
                                {leaveLoading
                                  ? 'Обработка...'
                                  : (selectedClan.members?.length || 0) <= 1
                                  ? 'Удалить клан'
                                  : 'Покинуть клан'}
                              </Button>
                              {leaveStatus && <span className="text-sm text-slate-300/70">{leaveStatus}</span>}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="panel-base panel-teal p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-teal-300" />
                        <h2 className="text-slate-100">Найти или создать клан</h2>
                      </div>
                      <div className="rounded-lg border border-slate-600/40 bg-slate-950/40 p-4 mb-4">
                        <p className="text-sm text-slate-200 mb-2">Вступить в приватный клан по ссылке</p>
                        <div className="flex flex-col gap-3">
                          <input
                            value={joinLink}
                            onChange={(e) => setJoinLink(e.target.value)}
                            placeholder="Вставьте ссылку или ID клана"
                            className="w-full rounded-lg border border-slate-600/40 bg-slate-950/50 px-3 py-2 text-slate-100"
                          />
                          <input
                            value={joinLinkPassword}
                            onChange={(e) => setJoinLinkPassword(e.target.value)}
                            placeholder="Пароль (если нужен)"
                            type="password"
                            className="w-full rounded-lg border border-slate-600/40 bg-slate-950/50 px-3 py-2 text-slate-100"
                          />
                          <div className="flex items-center justify-between gap-3">
                            <Button onClick={handleJoinByLink} disabled={joinLinkLoading} className="action-button">
                              {joinLinkLoading ? 'Отправка...' : 'Отправить запрос'}
                            </Button>
                            {joinLinkStatus && <span className="text-sm text-slate-300/70">{joinLinkStatus}</span>}
                          </div>
                        </div>
                      </div>
                      <ClanCreationPanel onClanCreated={loadClans} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Users, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';
import { socialAPI } from '../../api/social';
import { Clan, User } from '../../types';

type LeadersPanelProps = {
  className?: string;
};

export function LeadersPanel({ className = '' }: LeadersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [leaders, setLeaders] = useState<User[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(false);
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [playerData, clanData] = await Promise.all([
        socialAPI.getLeaderboard().catch(() => []),
        socialAPI.getClanLeaders().catch(() => []),
      ]);
      setLeaders(playerData || []);
      setClans(clanData || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const topPlayers = useMemo(() => leaders.slice(0, 10), [leaders]);

  return (
    <>
      <Button
        variant="primary"
        size="md"
        onClick={() => setIsOpen(true)}
        aria-label="Открыть лидеров"
        className={`flex items-center gap-2 sm:flex-col sm:gap-2 sm:px-4 sm:py-3 sm:text-base sm:rounded-xl ${
          isLight
            ? 'sm:bg-black sm:hover:bg-slate-900 text-white'
            : 'sm:bg-slate-800/50 sm:hover:bg-slate-800/80 text-white'
        } ${className}`}
      >
        <Trophy className="w-5 h-5 sm:hidden" />
        <span className="hidden sm:inline">Лидеры</span>
      </Button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[80]">
            <button
              type="button"
              className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть окно лидеров"
            />
            <div
              className={`absolute right-0 top-0 h-full w-full max-w-full sm:max-w-[52vw] md:max-w-[760px] ${
                isLight
                  ? 'bg-white shadow-[0_28px_70px_-26px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70'
                  : 'bg-gradient-to-br from-slate-900/95 to-slate-950/95 shadow-[0_32px_86px_-30px_rgba(2,6,23,0.95)] ring-1 ring-slate-600/35'
              }`}
            >
              <div
                className={`flex items-center justify-between px-6 py-4 ${
                  isLight ? 'bg-white/95 backdrop-blur' : 'bg-slate-950/35 backdrop-blur'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trophy className={`${isLight ? 'text-slate-800' : 'text-teal-200'}`} />
                  <h2 className={`${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Лидеры</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className={
                    isLight
                      ? 'px-4 py-2 rounded-lg border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 shadow-sm [&_*]:text-white'
                      : ''
                  }
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-[calc(100%-72px)] overflow-y-auto px-[19px] py-[24px] space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <div
                    className={
                      isLight
                        ? 'rounded-2xl border border-slate-200 bg-white shadow-lg p-7'
                        : 'panel-base panel-orange p-6'
                    }
                  >
                    <div className={isLight ? 'text-slate-900 text-lg font-semibold mb-4' : 'panel-caption text-left'}>
                      Топ игроков
                    </div>
                    <div
                      className={
                        isLight
                          ? 'rounded-xl bg-white border border-slate-200 overflow-hidden'
                          : 'rounded-xl bg-slate-950/25 overflow-hidden'
                      }
                    >
                      <div className="max-h-[60vh] overflow-auto">
                        <table className="w-full text-base">
                          <thead
                            className={`sticky top-0 z-10 ${
                              isLight ? 'bg-white/95 backdrop-blur border-b border-slate-200' : 'bg-slate-950/60'
                            }`}
                          >
                            <tr>
                              <th className={`px-4 py-3 text-left ${isLight ? 'text-slate-600 font-semibold' : ''}`}>#</th>
                              <th className={`px-4 py-3 text-left ${isLight ? 'text-slate-600 font-semibold' : ''}`}>Игрок</th>
                              <th className={`px-4 py-3 text-right ${isLight ? 'text-slate-600 font-semibold' : ''}`}>Уровень</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading && (
                              <tr>
                                <td
                                  colSpan={3}
                                  className={`px-4 py-6 text-center ${isLight ? 'text-slate-500' : 'text-slate-300/70'}`}
                                >
                                  Загрузка...
                                </td>
                              </tr>
                            )}
                            {!loading &&
                              topPlayers.map((player, index) => (
                                <tr
                                  key={player.id}
                                  className={`border-t ${
                                    isLight
                                      ? 'border-slate-200 hover:bg-white transition-colors'
                                      : 'border-slate-600/25'
                                  }`}
                                >
                                  <td className={`px-4 py-3 ${isLight ? 'text-slate-500' : 'text-slate-300/70'}`}>
                                    {index + 1}
                                  </td>
                                  <td className={`px-4 py-3 ${isLight ? 'text-slate-900 font-medium' : 'text-slate-100'}`}>
                                    {player.username}
                                  </td>
                                  <td className={`px-4 py-3 text-right ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                                    {player.level ?? 1}
                                  </td>
                                </tr>
                              ))}
                            {!loading && topPlayers.length === 0 && (
                              <tr>
                                <td
                                  colSpan={3}
                                  className={`px-4 py-6 text-center ${isLight ? 'text-slate-500' : 'text-slate-300/70'}`}
                                >
                                  Нет данных
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div
                    className={
                      isLight
                        ? 'rounded-2xl border border-slate-200 bg-white shadow-lg p-7'
                        : 'panel-base panel-teal p-6'
                    }
                  >
                    <div className={isLight ? 'text-slate-900 text-lg font-semibold mb-4 flex items-center gap-2' : 'panel-caption text-left flex items-center gap-2'}>
                      <Users className={`w-5 h-5 ${isLight ? 'text-slate-700' : 'text-teal-300'}`} />
                      Лидеры кланов
                    </div>
                    <div
                      className={
                        isLight
                          ? 'rounded-xl bg-white border border-slate-200 overflow-hidden'
                          : 'rounded-xl bg-slate-950/25 overflow-hidden'
                      }
                    >
                      <div className="max-h-[60vh] overflow-auto">
                        <table className="w-full text-base">
                          <thead
                            className={`sticky top-0 z-10 ${
                              isLight ? 'bg-white/95 backdrop-blur border-b border-slate-200' : 'bg-slate-950/60'
                            }`}
                          >
                            <tr>
                              <th className={`px-4 py-3 text-left ${isLight ? 'text-slate-600 font-semibold' : ''}`}>Клан</th>
                              <th className={`px-4 py-3 text-left ${isLight ? 'text-slate-600 font-semibold' : ''}`}>Лидер</th>
                              <th className={`px-4 py-3 text-right ${isLight ? 'text-slate-600 font-semibold' : ''}`}>XP</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading && (
                              <tr>
                                <td
                                  colSpan={3}
                                  className={`px-4 py-6 text-center ${isLight ? 'text-slate-500' : 'text-slate-300/70'}`}
                                >
                                  Загрузка...
                                </td>
                              </tr>
                            )}
                            {!loading &&
                              clans.map((clan) => {
                                const leader =
                                  clan.members?.find((member) => member.role === 'leader') ??
                                  clan.members?.[0];
                                return (
                                  <tr
                                    key={clan.id}
                                    className={`border-t ${
                                      isLight
                                        ? 'border-slate-200 hover:bg-white transition-colors'
                                        : 'border-slate-600/25'
                                    }`}
                                  >
                                    <td className={`px-4 py-3 ${isLight ? 'text-slate-900 font-medium' : 'text-slate-100'}`}>
                                      {clan.name}
                                    </td>
                                    <td className={`px-4 py-3 ${isLight ? 'text-slate-700' : 'text-slate-100'}`}>
                                      {leader?.username || '—'}
                                    </td>
                                    <td className={`px-4 py-3 text-right ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                                      {(clan.total_xp || 0).toLocaleString()}
                                    </td>
                                  </tr>
                                );
                              })}
                            {!loading && clans.length === 0 && (
                              <tr>
                                <td
                                  colSpan={3}
                                  className={`px-4 py-6 text-center ${isLight ? 'text-slate-500' : 'text-slate-300/70'}`}
                                >
                                  Нет данных
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}


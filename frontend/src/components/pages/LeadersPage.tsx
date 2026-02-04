import { useEffect, useState } from 'react';
import { Trophy, Users } from 'lucide-react';
import { socialAPI } from '../../api/social';
import { Clan, User } from '../../types';

export function LeadersPage() {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [playerData, clanData] = await Promise.all([
          socialAPI.getLeaderboard(),
          socialAPI.getClanLeaders(),
        ]);
        if (mounted) {
          setLeaders(playerData);
          setClans(clanData);
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        if (mounted) {
          setLeaders([]);
          setClans([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="panel-base panel-orange p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-teal-300" />
                <h2 className="text-slate-100">Лидеры</h2>
              </div>
              <div className="panel-guide mb-4">
                <p>1) Следи за топом игроков по уровню.</p>
                <p>2) Сравни свой прогресс с ближайшими позициями.</p>
                <p>3) Планируй цели, чтобы подняться выше.</p>
              </div>
              <div className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4 flex-1">
                <div className="rounded-lg border border-slate-600/30 bg-slate-950/40 overflow-hidden">
                  <div className="max-h-[60vh] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-950/70 text-slate-300/80 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left">#</th>
                          <th className="px-4 py-3 text-left">Игрок</th>
                          <th className="px-4 py-3 text-right">Уровень</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaders.map((player, index) => (
                          <tr
                            key={player.id}
                            className="border-t border-slate-600/30 hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-4 py-3 text-slate-300/70">{index + 1}</td>
                            <td className="px-4 py-3 text-slate-100">{player.username}</td>
                            <td className="px-4 py-3 text-right text-slate-100">
                              {player.level ?? 1}
                            </td>
                          </tr>
                        ))}
                        {!loading && leaders.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-slate-300/60">
                              Пока нет данных для таблицы лидеров
                            </td>
                          </tr>
                        )}
                        {loading && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-slate-300/60">
                              Загрузка рейтинга...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-base panel-teal p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-teal-300" />
                <h2 className="text-slate-100">Лидеры кланов</h2>
              </div>
              <div className="panel-guide mb-4">
                <p>1) Оцени вклад каждого клана по общему XP.</p>
                <p>2) Смотри на лидера — он показывает темп команды.</p>
                <p>3) Сравни рост клана с соседними позициями.</p>
              </div>
              <div className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4 flex-1">
                <div className="rounded-lg border border-slate-600/30 bg-slate-950/40 overflow-hidden">
                  <div className="max-h-[60vh] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-950/70 text-slate-300/80 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left">Клан</th>
                          <th className="px-4 py-3 text-left">Лидер</th>
                          <th className="px-4 py-3 text-right">XP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clans.map((clan) => {
                          const leader =
                            clan.members?.find((member) => member.role === 'leader') ??
                            clan.members?.[0];
                          return (
                            <tr
                              key={clan.id}
                              className="border-t border-slate-600/30 hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="px-4 py-3 text-slate-100">{clan.name}</td>
                              <td className="px-4 py-3 text-slate-100">
                                {leader?.username || '—'}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-100">
                                {(clan.total_xp || 0).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                        {!loading && clans.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-slate-300/60">
                              Пока нет данных по кланам
                            </td>
                          </tr>
                        )}
                        {loading && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-slate-300/60">
                              Загрузка рейтинга...
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
    </div>
    </div>
  );
}

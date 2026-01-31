import { useEffect, useState } from 'react';
import { Trophy, Users } from 'lucide-react';
import { socialAPI } from '../../api/social';
import { Clan, User } from '../../types';
import { FooterArt } from '../layout/FooterArt';

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
      <div className="max-w-[1600px] mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="panel-base panel-orange p-6">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-teal-300" />
              <h2 className="text-slate-100">Лидеры</h2>
            </div>
            <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 overflow-hidden min-h-[60vh]">
              <table className="w-full text-sm">
                <thead className="bg-slate-950/60 text-slate-300/70">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Игрок</th>
                    <th className="px-4 py-3 text-right">Уровень</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((player, index) => (
                    <tr key={player.id} className="border-t border-slate-600/30">
                      <td className="px-4 py-3 text-slate-300/70">{index + 1}</td>
                      <td className="px-4 py-3 text-slate-100">{player.username}</td>
                      <td className="px-4 py-3 text-right text-slate-100">{player.level ?? 1}</td>
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

          <div className="panel-base panel-teal p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-teal-300" />
              <h2 className="text-slate-100">Лидеры кланов</h2>
            </div>
            <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 overflow-hidden min-h-[60vh]">
              <table className="w-full text-sm">
                <thead className="bg-slate-950/60 text-slate-300/70">
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
                      <tr key={clan.id} className="border-t border-slate-600/30">
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
        <FooterArt />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { socialAPI } from '../../api/social';
import { User } from '../../types';

export function LeadersPage() {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await socialAPI.getLeaderboard();
        if (mounted) {
          setLeaders(data);
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        if (mounted) {
          setLeaders([]);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="panel-base panel-orange p-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-purple-400" />
            <h2 className="text-purple-300">Лидеры</h2>
          </div>
          <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/60 text-purple-200/70">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Игрок</th>
                  <th className="px-4 py-3 text-right">Уровень</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((player, index) => (
                  <tr key={player.id} className="border-t border-purple-600/10">
                    <td className="px-4 py-3 text-purple-200/70">{index + 1}</td>
                    <td className="px-4 py-3 text-purple-200">{player.username}</td>
                    <td className="px-4 py-3 text-right text-purple-200">{player.level ?? 1}</td>
                  </tr>
                ))}
                {!loading && leaders.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-purple-200/50">
                      Пока нет данных для таблицы лидеров
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-purple-200/50">
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
  );
}

import { Link } from 'react-router-dom';
import { User as UserIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function UserCustomizationPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="panel-base panel-purple p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-purple-400" />
                <h1 className="text-2xl text-purple-300">Настройка профиля</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-6 flex flex-col items-center text-center">
              <Link to="/profile" className="block">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/60"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-800/70 border-2 border-purple-500/60 flex items-center justify-center text-purple-200 text-2xl">
                    {user.username.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </Link>
              <p className="text-purple-200 mt-3">{user.username}</p>
              <p className="text-xs text-purple-200/60">Уровень {user.level}</p>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-4">
                <p className="text-xs text-purple-200/60">Email</p>
                <p className="text-purple-200">{user.email || '—'}</p>
              </div>
              <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-4">
                <p className="text-xs text-purple-200/60">Опыт</p>
                <p className="text-purple-200">{user.xp} XP</p>
              </div>
              <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-4">
                <p className="text-xs text-purple-200/60">Следующий уровень</p>
                <p className="text-purple-200">{user.xp_to_next_level} XP</p>
              </div>
              <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-4">
                <p className="text-xs text-purple-200/60">Выполнено заданий</p>
                <p className="text-purple-200">{user.total_quests_completed}</p>
              </div>
              {user.bio && (
                <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-4">
                  <p className="text-xs text-purple-200/60">О себе</p>
                  <p className="text-purple-200">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { Button } from '../ui/Button';
import { resolveMediaUrl } from '../../utils/media';
import { FriendsPanel } from '../social/FriendsPanel';
export function Header() {
  const { user, logout } = useAuth();
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  return (
    <div
      className={`border-b sticky top-0 z-50 backdrop-blur-sm pl-28 ${
        isLight
          ? 'bg-white/90 border-slate-200 shadow-sm'
          : 'bg-slate-900/70 border-slate-700/50'
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        {user && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/70 px-3 py-2">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="flex flex-wrap items-center gap-3 ml-auto">
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70'
                  }`}
                >
                  {resolveMediaUrl(user.avatar) ? (
                    <img
                      src={resolveMediaUrl(user.avatar) as string}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-teal-300/60"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700/70 border border-teal-300/60 flex items-center justify-center text-xs text-slate-100">
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      {user.username}
                    </p>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300/70'}`}>
                      Уровень {user.level} · {user.xp} XP
                    </p>
                  </div>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" size="md" className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Настройки
                  </Button>
                </Link>
                <FriendsPanel />
              </div>
              <Button variant="ghost" size="md" onClick={logout} className="flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Выйти
              </Button>
            </div>
          </div>
        )}
        {!user && (
          <div className="h-1" />
        )}
      </div>
    </div>
  );
}
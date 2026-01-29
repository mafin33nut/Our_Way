import { Link, NavLink } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { Button } from '../ui/Button';
export function Header() {
  const { user, logout } = useAuth();
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  return (
    <div
      className={`border-b sticky top-0 z-50 backdrop-blur-sm ${
        isLight
          ? 'bg-white/90 border-amber-200 shadow-sm'
          : 'bg-slate-950/50 border-amber-600/30'
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        {user && (
          <div className="rounded-lg border border-purple-900/60 bg-purple-950/80 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { to: '/', label: 'Главная' },
                  { to: '/clans', label: 'Кланы' },
                  { to: '/leaders', label: 'Лидеры' },
                  { to: '/achievements', label: 'Достижения' },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-purple-700/70 text-white'
                          : 'text-purple-200 hover:bg-purple-800/60 hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
                    isLight
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-800/50 border-amber-600/30'
                  }`}
                >
                  <Link to="/profile" className="flex items-center gap-2">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-9 h-9 rounded-full object-cover border border-amber-400/60"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-700/70 border border-amber-400/60 flex items-center justify-center text-xs text-amber-100">
                        {user.username.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="min-w-0">
                    <p className={`text-sm ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                      {user.username}
                    </p>
                    <p className={`text-xs ${isLight ? 'text-amber-600' : 'text-amber-200/60'}`}>
                      Уровень {user.level} · {user.xp} XP
                    </p>
                    <p className={`text-xs ${isLight ? 'text-amber-600/80' : 'text-amber-200/50'}`}>
                      Заданий выполнено: {user.total_quests_completed}
                    </p>
                  </div>
                </div>
                <Link to="/settings">
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </div>
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
import { Link } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { Button } from '../ui/Button';
export function Header() {
  const { user, logout } = useAuth();
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  return (
    <div className={`border-b sticky top-0 z-50 backdrop-blur-sm ${
      isLight
        ? 'bg-white/90 border-amber-200 shadow-sm'
        : 'bg-slate-950/50 border-amber-600/30'
    }`}>
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <h1 className={`tracking-wide text-xl ${
              isLight ? 'text-amber-700' : 'text-amber-400'
            }`}>
              Журнал заданий: Гильдейские приключения
            </h1>
          </Link>
          {user && (
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isLight
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-slate-800/50 border-amber-600/30'
              }`}>
                <User className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                <div>
                  <p className={`text-sm ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                    {user.username}
                  </p>
                  <p className={`text-xs ${isLight ? 'text-amber-600' : 'text-amber-200/60'}`}>
                    Уровень {user.level}
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
          )}
        </div>
      </div>
    </div>
  );
}
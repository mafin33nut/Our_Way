import { Link } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { Button } from '../ui/Button';
import { resolveMediaUrl } from '../../utils/media';
import { FriendsPanel } from '../social/FriendsPanel';
import { ClanHubPanel } from '../social/ClanHubPanel';
import { ChatHubPanel } from '../social/ChatHubPanel';
type HeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  return (
    <div
      className={`border-b sticky top-0 z-50 backdrop-blur-sm ${
        isLight
          ? 'bg-white/90 border-slate-200 shadow-sm'
          : 'bg-slate-900/70 border-slate-700/50'
      }`}
    >
      <div
        className={`max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-5 ${
          isSidebarOpen ? 'md:ml-28' : ''
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-5 flex-nowrap">
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all shadow-md ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-100'
            }`}
            aria-label={isSidebarOpen ? 'Скрыть боковую панель' : 'Показать боковую панель'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
          {user && (
            <div className="flex-1 rounded-xl border border-slate-700/60 bg-slate-800/70 px-4 py-3 min-w-0">
              <div className="flex items-center justify-end gap-3 sm:gap-5 flex-nowrap overflow-x-auto">
                <div className="flex items-center gap-3 sm:gap-5 ml-auto flex-nowrap">
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl transition-colors whitespace-nowrap shrink-0 sm:text-base shadow-sm ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                      : 'bg-slate-800/70 hover:bg-slate-700 text-slate-100'
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
                  <div className="min-w-0 hidden sm:block">
                    <p className={`text-base ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      {user.username}
                    </p>
                    <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300/70'}`}>
                      Уровень {user.level} · {user.xp} XP
                    </p>
                  </div>
                </Link>
                <Link to="/settings" className="shrink-0">
                  <Button
                    variant="ghost"
                    size="md"
                    className={`action-button flex items-center gap-2 whitespace-nowrap sm:text-base sm:px-4 sm:py-3 border-0 ${
                      isLight ? 'text-slate-900' : 'text-slate-100'
                    }`}
                  >
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">Настройки</span>
                  </Button>
                </Link>
                <div className="shrink-0">
                  <FriendsPanel className={`action-button ${isLight ? 'text-slate-900' : 'text-slate-100'}`} />
                </div>
                <div className="shrink-0">
                  <ClanHubPanel className={`action-button ${isLight ? 'text-slate-900' : 'text-slate-100'}`} />
                </div>
                <div className="shrink-0">
                  <ChatHubPanel className={`action-button ${isLight ? 'text-slate-900' : 'text-slate-100'}`} />
                </div>
              </div>
              <Button
                variant="ghost"
                size="md"
                onClick={logout}
                className={`action-button flex items-center gap-2 whitespace-nowrap shrink-0 sm:text-base sm:px-4 sm:py-3 border-0 ${
                  isLight ? 'text-slate-900' : 'text-slate-100'
                }`}
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>
          )}
          {!user && <div className="flex-1" />}
        </div>
      </div>
    </div>
  );
}
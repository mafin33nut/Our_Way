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
        className={`max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-5 ${
          isSidebarOpen ? 'md:ml-28' : ''
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-4 flex-nowrap">
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`inline-flex items-center justify-center w-14 h-14 rounded-xl border transition-colors text-white ${
              isLight
                ? 'bg-white/80 border-slate-200 hover:bg-white'
                : 'bg-slate-800/70 border-slate-700/60 hover:bg-slate-800'
            }`}
            aria-label={isSidebarOpen ? 'Скрыть боковую панель' : 'Показать боковую панель'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-7 h-7" />
            ) : (
              <PanelLeftOpen className="w-7 h-7" />
            )}
          </button>
          {user && (
            <div className="flex-1 rounded-xl border border-slate-700/60 bg-slate-800/70 px-4 py-3 min-w-0">
              <div className="flex items-center justify-end gap-2 sm:gap-3 flex-nowrap overflow-x-auto">
                <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-nowrap">
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors whitespace-nowrap shrink-0 text-3xl ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70'
                  }`}
                >
                  {resolveMediaUrl(user.avatar) ? (
                    <img
                      src={resolveMediaUrl(user.avatar) as string}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover border border-teal-300/60"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-700/70 border border-teal-300/60 flex items-center justify-center text-base text-slate-100">
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 hidden sm:block">
                    <p className={`text-3xl ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      {user.username}
                    </p>
                    <p className={`text-xl ${isLight ? 'text-slate-600' : 'text-slate-300/70'}`}>
                      Уровень {user.level} · {user.xp} XP
                    </p>
                  </div>
                </Link>
                <Link to="/settings" className="shrink-0">
                  <Button variant="ghost" size="md" className="flex items-center gap-3 whitespace-nowrap text-3xl px-4 py-3">
                    <Settings className="w-7 h-7" />
                    <span className="hidden sm:inline">Настройки</span>
                  </Button>
                </Link>
                <div className="shrink-0">
                  <div className="text-3xl">
                    <FriendsPanel />
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="text-3xl">
                    <ClanHubPanel />
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="text-3xl">
                    <ChatHubPanel />
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="md" onClick={logout} className="flex items-center gap-3 whitespace-nowrap shrink-0 text-3xl px-4 py-3">
                <LogOut className="w-7 h-7" />
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
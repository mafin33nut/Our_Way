import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { Button } from '../ui/Button';
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
  const navigate = useNavigate();

  return (
    <div
      className={`border-b sticky top-0 z-50 backdrop-blur-sm ${
        isLight ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-700/50'
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
            className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all shadow-md focus:outline-none focus-visible:outline-none focus:ring-0 ${
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
            <div className="flex-1 flex justify-end gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="md"
                onClick={() => navigate('/settings')}
                className={`hidden sm:inline-flex items-center gap-2 px-0 py-0 text-sm bg-transparent border-0 shadow-none hover:bg-transparent ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <span>Настройки</span>
              </Button>
              <FriendsPanel
                className={`hidden sm:inline-flex items-center gap-2 px-0 py-0 text-sm bg-transparent border-0 shadow-none hover:bg-transparent ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              />
              <ClanHubPanel
                className={`hidden sm:inline-flex items-center gap-2 px-0 py-0 text-sm bg-transparent border-0 shadow-none hover:bg-transparent ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              />
              <ChatHubPanel
                className={`hidden sm:inline-flex items-center gap-2 px-0 py-0 text-sm bg-transparent border-0 shadow-none hover:bg-transparent ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              />
              <Button
                variant="ghost"
                size="md"
                onClick={logout}
                className={`hidden sm:inline-flex items-center gap-2 whitespace-nowrap px-0 py-0 text-sm bg-transparent border-none shadow-none hover:bg-transparent ${
                  isLight ? 'text-slate-900' : 'text-slate-100'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


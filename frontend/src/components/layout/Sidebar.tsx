import { NavLink } from 'react-router-dom';
import { Home, ListChecks, Crown, Trophy, Star, BarChart2, PanelLeftClose } from 'lucide-react';
import { useCustomization } from '../../hooks/useCustomization';

const NAV_ITEMS = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/quests', label: 'Квесты', icon: ListChecks },
  { to: '/clans', label: 'Клановые квесты', icon: Crown },
  { to: '/leaders', label: 'Лидеры', icon: Trophy },
  { to: '/achievements', label: 'Достижения', icon: Star },
  { to: '/progress', label: 'Прогресс', icon: BarChart2 },
];

type SidebarProps = {
  isOpen: boolean;
  onToggleSidebar: () => void;
};

export function Sidebar({ isOpen, onToggleSidebar }: SidebarProps) {
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-32 border-r backdrop-blur-sm z-60 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-900/80 border-slate-700/60'}`}
    >
      <div className="pt-24 px-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-3 text-xs transition-colors border ${
            isLight
              ? 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800/80'
          }`}
          aria-label="Скрыть боковую панель"
        >
          <PanelLeftClose className="w-4 h-4" />
          <span className="text-center leading-tight">Скрыть</span>
        </button>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-3 py-3 text-xs transition-colors border ${
                  isActive
                    ? 'bg-teal-400/20 text-teal-100 border-teal-300/50'
                    : 'text-slate-300/70 border-transparent hover:border-slate-600/60 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-center leading-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

import { NavLink } from 'react-router-dom';
import { Home, Star, PanelLeftClose } from 'lucide-react';
import { useCustomization } from '../../hooks/useCustomization';

const NAV_ITEMS = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/achievements', label: 'Достижения', icon: Star },
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
      className={`fixed left-0 top-0 h-screen w-40 border-r backdrop-blur-sm z-60 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-900/80 border-slate-700/60'}`}
    >
      <div className="pt-24 px-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-lg transition-all shadow-md ${
            isLight
              ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              : 'bg-slate-800/70 text-slate-100 hover:bg-slate-700'
          }`}
          aria-label="Скрыть боковую панель"
        >
          <PanelLeftClose className="w-6 h-6" />
          <span className="text-center leading-tight">Скрыть</span>
        </button>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-lg transition-all ${
                  isActive
                    ? isLight
                      ? 'bg-teal-500/15 text-slate-900 shadow-md'
                      : 'bg-teal-400/20 text-teal-100 shadow-md'
                    : isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300/70 hover:bg-slate-800/80 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="text-center leading-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

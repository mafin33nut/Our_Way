import { NavLink } from 'react-router-dom';
import { Home, ListChecks, Crown, Trophy, Star, BarChart2 } from 'lucide-react';
import { useCustomization } from '../../hooks/useCustomization';

const NAV_ITEMS = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/quests', label: 'Квесты', icon: ListChecks },
  { to: '/clans', label: 'Кланы', icon: Crown },
  { to: '/leaders', label: 'Лидеры', icon: Trophy },
  { to: '/achievements', label: 'Достижения', icon: Star },
  { to: '/progress', label: 'Прогресс', icon: BarChart2 },
];

export function Sidebar() {
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-24 border-r backdrop-blur-sm z-60 ${
        isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-900/80 border-slate-700/60'
      }`}
    >
      <div className="pt-24 px-3 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] transition-colors border ${
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

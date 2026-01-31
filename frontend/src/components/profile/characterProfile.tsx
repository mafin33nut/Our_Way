import { User } from '../../types';
import { Sparkles, Trophy, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { resolveMediaUrl } from '../../utils/media';
import { useCustomization } from '../../hooks/useCustomization';
interface CharacterProfileProps {
  user: User;
  questsCompletedToday: number;
}
export function CharacterProfile({ user, questsCompletedToday }: CharacterProfileProps) {
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  const nextThreshold = (() => {
    if (user.level <= 1) return 50;
    if (user.level === 2) return 150;
    if (user.level === 3) return 375;
    return 375 + (user.level - 3) * 300;
  })();
  const prevThreshold = (() => {
    if (user.level <= 1) return 0;
    if (user.level === 2) return 50;
    if (user.level === 3) return 150;
    return 375 + (user.level - 4) * 300;
  })();
  const xpInLevel = Math.max(user.xp - prevThreshold, 0);
  const xpNeeded = Math.max(nextThreshold - prevThreshold, 1);
  const xpPercentage = Math.min((xpInLevel / xpNeeded) * 100, 100);
  return (
    <div className="panel-base panel-teal p-6 min-h-[260px] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        {resolveMediaUrl(user.avatar) ? (
          <img
            src={resolveMediaUrl(user.avatar) as string}
            alt={user.username}
            className="w-14 h-14 rounded-full object-cover border-2 border-teal-300/60"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-slate-800/70 border-2 border-teal-300/60 flex items-center justify-center text-slate-200">
            <UserIcon className="w-6 h-6" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-slate-100">
            {user.username}
          </h2>
          <p className="text-slate-300/70 text-sm">
            Авантюрист {user.level} уровня
          </p>
          <p className="text-slate-300/60 text-xs truncate">
            {user.bio || 'Добавьте описание в профиле'}
          </p>
        </div>
      </div>
      <div className="mb-6">
        <Link to="/achievements">
          <Button variant="ghost" size="sm" className="w-full">
            Мои достижения
          </Button>
        </Link>
      </div>
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2 text-slate-300/80">
          <span>Опыт</span>
          <span>{xpInLevel} / {xpNeeded} XP</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden border bg-slate-950/50 border-slate-600/40">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-cyan-300 transition-all duration-500 rounded-full"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>
      <div className="space-y-3 mt-auto">
        <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-900/40 border-slate-600/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span className="text-sm text-slate-200">
              Квестов сегодня
            </span>
          </div>
          <span className="text-slate-100">
            {questsCompletedToday}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-900/40 border-slate-600/40">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-teal-300" />
            <span className="text-sm text-slate-200">
              Всего квестов
            </span>
          </div>
          <span className="text-slate-100">
            {user.total_quests_completed}
          </span>
        </div>
      </div>
    </div>
  );
}
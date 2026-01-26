import { User } from '../../types';
import { Sparkles, Trophy } from 'lucide-react';
import { useCustomization } from '../../hooks/useCustomization';
interface CharacterProfileProps {
  user: User;
  questsCompletedToday: number;
}
export function CharacterProfile({ user, questsCompletedToday }: CharacterProfileProps) {
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  const xpPercentage = (user.xp / user.xp_to_next_level) * 100;
  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-purple-500/50 p-6 shadow-2xl backdrop-blur-sm ring-2 ring-purple-400/30">
      <div className="text-center mb-6">
        <h2 className="text-purple-300">
          {user.username}
        </h2>
        <p className="text-purple-200/60">
          Авантюрист {user.level} уровня
        </p>
      </div>
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2 text-purple-200/80">
          <span>Опыт</span>
          <span>{user.xp} / {user.xp_to_next_level} XP</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden border bg-slate-950/50 border-purple-600/30">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 rounded-full"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg border bg-purple-900/20 border-purple-600/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-200">
              Заданий сегодня
            </span>
          </div>
          <span className="text-purple-100">
            {questsCompletedToday}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border bg-purple-900/20 border-purple-600/30">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-200">
              Всего заданий
            </span>
          </div>
          <span className="text-purple-100">
            {user.total_quests_completed}
          </span>
        </div>
      </div>
    </div>
  );
}
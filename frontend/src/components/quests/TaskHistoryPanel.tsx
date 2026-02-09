import { CheckCircle2, ClipboardList } from 'lucide-react';
import { Quest } from '../../types';
import { formatTime, isToday } from '../../utils/time';

interface TaskHistoryPanelProps {
  quests: Quest[];
}

export function TaskHistoryPanel({ quests }: TaskHistoryPanelProps) {
  const completed = quests.filter((q) => q.completed && q.completed_at);
  const completedToday = completed.filter((q) => q.completed_at && isToday(q.completed_at));
  const xpToday = completedToday.reduce((sum, q) => sum + (q.xp_reward || 0), 0);
  const recent = [...completed]
    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-[260px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-teal-300" />
        <h2 className="text-slate-100">История выполнения</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-3">
          <p className="text-xs text-slate-300/70">Сегодня выполнено</p>
          <p className="text-lg text-slate-100">{completedToday.length}</p>
        </div>
        <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-3">
          <p className="text-xs text-slate-300/70">XP сегодня</p>
          <p className="text-lg text-slate-100">{xpToday}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-300/70 mb-2">Последние квесты</p>
        {recent.map((quest) => (
          <div
            key={quest.id}
            className="flex items-start gap-2 rounded-lg border border-slate-600/40 bg-slate-900/50 p-3"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-300 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm text-slate-200 truncate">{quest.title}</p>
              {quest.completed_at && (
                <p className="text-xs text-slate-300/60">
                  {formatTime(quest.completed_at)}
                </p>
              )}
            </div>
          </div>
        ))}
        {recent.length === 0 && (
          <div className="text-center py-6 text-slate-300/60 text-sm">
            Пока нет завершенных квестов
          </div>
        )}
      </div>
    </div>
  );
}

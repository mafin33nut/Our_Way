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
    <div className="panel-base panel-purple p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-purple-400" />
        <h2 className="text-purple-300">Завершение и история</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border border-purple-600/30 bg-slate-950/40 p-3">
          <p className="text-xs text-purple-200/60">Сегодня выполнено</p>
          <p className="text-lg text-purple-200">{completedToday.length}</p>
        </div>
        <div className="rounded-lg border border-purple-600/30 bg-slate-950/40 p-3">
          <p className="text-xs text-purple-200/60">XP сегодня</p>
          <p className="text-lg text-purple-200">{xpToday}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-purple-200/60 mb-2">Последние задания</p>
        {recent.map((quest) => (
          <div
            key={quest.id}
            className="flex items-start gap-2 rounded-lg border border-purple-600/20 bg-slate-950/40 p-3"
          >
            <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm text-purple-200 truncate">{quest.title}</p>
              {quest.completed_at && (
                <p className="text-xs text-purple-200/50">
                  {formatTime(quest.completed_at)}
                </p>
              )}
            </div>
          </div>
        ))}
        {recent.length === 0 && (
          <div className="text-center py-6 text-purple-200/40 text-sm">
            Пока нет завершенных заданий
          </div>
        )}
      </div>
    </div>
  );
}

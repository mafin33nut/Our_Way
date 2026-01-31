import { Clock } from 'lucide-react';
import { Quest } from '../../types';

interface TaskSchedulePanelProps {
  quests: Quest[];
}

export function TaskSchedulePanel({ quests }: TaskSchedulePanelProps) {
  const activeQuests = quests.filter((q) => !q.completed);
  const slots = activeQuests.slice(0, 6);

  return (
    <div className="panel-base panel-orange p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-purple-400" />
        <h2 className="text-purple-300">Расписание выполнения</h2>
      </div>

      <div className="space-y-2">
        {slots.map((quest, index) => (
          <div
            key={quest.id}
            className="flex items-center justify-between rounded-lg border border-purple-600/20 bg-slate-950/40 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm text-purple-200 truncate">{quest.title}</p>
              <p className="text-xs text-purple-200/50">Слот {index + 1} · 30 мин</p>
            </div>
            <span className="text-xs text-purple-200/60">30:00</span>
          </div>
        ))}
        {slots.length === 0 && (
          <div className="text-center py-6 text-purple-200/40 text-sm">
            Нет активных квестов для расписания
          </div>
        )}
      </div>
    </div>
  );
}

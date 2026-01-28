import { Quest } from '../../types';
import { QuestCard } from './QuestCard';
import { Circle, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { isToday } from '../../utils/time';

interface QuestListProps {
  quests: Quest[];
  onComplete: (id: number) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
  onTimerStop?: () => Promise<void>;
}

export function QuestList({ quests, onComplete, onDelete, onTimerStop }: QuestListProps) {
  const activeQuests = quests.filter(q => !q.completed);
  const completedQuests = quests.filter(q =>
    q.completed && q.completed_at && isToday(q.completed_at)
  );

  return (
    <div className="space-y-6">
      {activeQuests.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-purple-500/50 p-6 backdrop-blur-sm ring-2 ring-sky-400/60 ring-offset-2 ring-offset-slate-900">
          <h2 className="text-purple-300 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Ваши задания ({activeQuests.length})
          </h2>
          <div className="space-y-3">
            {activeQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={onComplete}
                onDelete={onDelete}
                onTimerStop={onTimerStop}
              />
            ))}
          </div>
        </div>
      )}

      {completedQuests.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-purple-500/50 p-6 backdrop-blur-sm ring-2 ring-sky-400/60 ring-offset-2 ring-offset-slate-900">
          <h2 className="text-purple-300 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Выполнено сегодня ({completedQuests.length})
          </h2>
          <div className="space-y-3">
            {completedQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={onComplete}
                onDelete={onDelete}
                onTimerStop={onTimerStop}
              />
            ))}
          </div>
        </div>
      )}

      {quests.length === 0 && (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-purple-500/50 p-12 text-center backdrop-blur-sm ring-2 ring-purple-400/30">
          <Sparkles className="w-12 h-12 text-purple-400/40 mx-auto mb-4" />
          <p className="text-purple-200/60 mb-2">Пока нет заданий</p>
          <p className="text-purple-200/40 text-sm">Выберите направление развития выше, чтобы получить персональные задания</p>
        </div>
      )}
    </div>
  );
}
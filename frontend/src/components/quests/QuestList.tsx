import { Quest } from '../../types';
import { QuestCard } from './QuestCard';


interface QuestListProps {
  quests: Quest[];
  onComplete: (id: number) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
  onTimerStop?: () => Promise<void>;
}

<QuestList
  quests={quests}
  onComplete={handleCompleteQuest}
  onDelete={handleDeleteQuest}
  onTimerStop={async () => {
    // например, обновим данные пользователя или перезагрузим квесты
    await refreshUser();
    // можно также перезагрузить список:
    // await loadData();
  }}
/>

export function QuestList({ quests, onComplete, onDelete, onTimerStop }: QuestListProps) {
  return (
    <div className="space-y-3">
      {quests.map((q) => (
        <QuestCard
          key={q.id}
          quest={q}
          onComplete={onComplete}
          onDelete={onDelete}
          onTimerStop={onTimerStop} // <- прокидываем сюда
        />
      ))}
    </div>
  );
}
import { Quest } from '../../types';
import { QuestCard } from './QuestCard';
import { Circle, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { isToday } from '../../utils/time';
interface QuestListProps {
  quests: Quest[];
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}
export function QuestList({ quests, onComplete, onDelete }: QuestListProps) {
  const activeQuests = quests.filter(q => !q.completed);
  const completedQuests = quests.filter(q => 
    q.completed && q.completed_at && isToday(q.completed_at)
  );
  return (
    <div className="space-y-6">
      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg border-2 border-amber-600/30 p-6 backdrop-blur-sm">
          <h2 className="text-amber-300 mb-4 flex items-center gap-2">
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
              />
            ))}
          </div>
        </div>
      )}
      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div className="bg-slate-800/30 rounded-lg border-2 border-emerald-600/20 p-6 backdrop-blur-sm">
          <h2 className="text-emerald-300 mb-4 flex items-center gap-2">
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
              />
            ))}
          </div>
        </div>
      )}
      {/* Empty State */}
      {quests.length === 0 && (
        <div className="bg-slate-800/30 rounded-lg border-2 border-amber-600/20 p-12 text-center backdrop-blur-sm">
          <Sparkles className="w-12 h-12 text-amber-400/40 mx-auto mb-4" />
          <p className="text-amber-200/60 mb-2">Пока нет заданий</p>
          <p className="text-amber-200/40 text-sm">Выберите направление развития выше, чтобы получить персональные задания</p>
        </div>
      )}
    </div>
  );
}
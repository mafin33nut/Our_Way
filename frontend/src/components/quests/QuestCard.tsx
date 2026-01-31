import { useState, useEffect } from 'react';
import { Quest } from '../../types';
import { Button } from '../ui/Button';
import { questStepsAPI } from '../../api/quests';

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onStepComplete?: (questId: number, stepId: number) => void;
}

export function QuestCard({ quest, onComplete, onDelete, onStepComplete }: QuestCardProps) {
  const [steps, setSteps] = useState(quest.steps ?? []);

  useEffect(() => {
    setSteps(quest.steps ?? []);
  }, [quest.steps]);

  const handleCompleteStep = async (stepId: number) => {
    try {
      const updated = await questStepsAPI.complete(stepId);
      setSteps((prev) => prev.map((s) => (s.id === stepId ? updated : s)));
      onStepComplete?.(quest.id, stepId);
    } catch (err) {
      console.error('Failed to complete step', err);
    }
  };

  const allStepsDone = steps.length === 0 || steps.every((step) => step.completed);
  const canComplete = allStepsDone && !quest.completed;

  return (
    <div className="group relative ...">
      <div className="flex items-start gap-2">
        <div className="min-w-0">
          <h3 className="text-white/90 text-sm font-semibold truncate">{quest.title}</h3>
          {quest.description && <p className="text-xs text-white/50 mt-1">{quest.description}</p>}
        </div>
      </div>
      {steps.length > 0 && (
        <div className="mt-3 space-y-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center justify-between gap-2 text-sm">
              <span className={step.completed ? 'text-purple-200/50 line-through' : 'text-purple-200'}>
                {step.title}
              </span>
              {!step.completed && (
                <Button size="sm" variant="ghost" onClick={() => handleCompleteStep(step.id)}>
                  Готово
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 mt-3">
        <Button
          onClick={() => canComplete && onComplete(quest.id)}
          disabled={!canComplete}
          size="sm"
        >
          Завершить
        </Button>
        <Button
          onClick={() => onDelete(quest.id)}
          size="sm"
          variant="ghost"
          className="border border-rose-400/50 text-rose-200 hover:bg-rose-500/10"
        >
          Удалить
        </Button>
      </div>
    </div>
  );
}
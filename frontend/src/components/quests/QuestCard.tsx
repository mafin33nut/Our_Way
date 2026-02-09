import { useState, useEffect } from 'react';
import { Quest } from '../../types';
import { Button } from '../ui/Button';
import { questStepsAPI } from '../../api/quests';
import { useCustomization } from '../../hooks/useCustomization';

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onStepComplete?: (questId: number, stepId: number) => void;
}

export function QuestCard({ quest, onComplete, onDelete, onStepComplete }: QuestCardProps) {
  const [steps, setSteps] = useState(quest.steps ?? []);
  const [now, setNow] = useState(Date.now());
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';

  useEffect(() => {
    setSteps(quest.steps ?? []);
  }, [quest.steps]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCompleteStep = async (stepId: number) => {
    try {
      const updated = await questStepsAPI.complete(stepId);
      setSteps((prev) => {
        const nextSteps = prev.map((s) => (s.id === stepId ? updated : s));
        const allDone = nextSteps.length > 0 && nextSteps.every((step) => step.completed);
        if (allDone && !quest.completed) {
          onComplete(quest.id);
        }
        return nextSteps;
      });
      onStepComplete?.(quest.id, stepId);
    } catch (err) {
      console.error('Failed to complete step', err);
    }
  };

  const createdAtMs = Number.isFinite(Date.parse(quest.created_at)) ? Date.parse(quest.created_at) : 0;
  const cooldownMs = 30_000;
  const remainingMs = createdAtMs ? Math.max(0, cooldownMs - (now - createdAtMs)) : 0;
  const canComplete = !quest.completed && remainingMs === 0;
  const remainingSeconds = remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;

  return (
    <div
      className={`rounded-2xl px-4 py-3 ${
        isLight
          ? 'bg-white border border-slate-200 text-slate-900'
          : 'bg-slate-950/30 text-slate-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate">{quest.title}</h3>
          {quest.description && (
            <p className="text-xs text-slate-300/70 mt-1">{quest.description}</p>
          )}
        </div>
        {quest.completed && (
          <span className="text-xs px-3 py-1 rounded-full bg-teal-400/15 text-teal-100 shrink-0">
            Выполнено
          </span>
        )}
      </div>
      {steps.length > 0 && (
        <div className="mt-3 space-y-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center justify-between gap-2 text-sm">
              <span
                className={
                  step.completed
                    ? 'text-slate-300/60 line-through'
                    : isLight
                    ? 'text-slate-900'
                    : 'text-slate-100'
                }
              >
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
      {!quest.completed && remainingSeconds > 0 && (
        <p className="mt-3 text-xs text-slate-300/70">Доступно через {remainingSeconds} сек.</p>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Button onClick={() => canComplete && onComplete(quest.id)} disabled={!canComplete} size="sm">
          Завершить
        </Button>
        <Button onClick={() => onDelete(quest.id)} size="sm" variant="ghost" className="bg-slate-950/25">
          Удалить
        </Button>
      </div>
    </div>
  );
}

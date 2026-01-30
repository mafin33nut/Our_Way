import { useState, useEffect, useRef } from 'react';
import { Quest } from '../../types';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { questsAPI, timersAPI } from '../../api/quests';

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onExpire: (id: number) => void;
  onTimerStop?: () => Promise<void>;
}

export function QuestCard({ quest, onComplete, onDelete, onExpire, onTimerStop }: QuestCardProps) {
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);
  const [serverTimerId, setServerTimerId] = useState<number | null>(null);
  const [processingTimer, setProcessingTimer] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [expired, setExpired] = useState(false);
  const taskDurationSeconds = (quest.duration_minutes ?? 60) * 60;
  const minCompleteSeconds = 3 * 60;

  useEffect(() => {
    if (quest.accepted_at) {
      setAccepted(true);
    }
  }, [quest.accepted_at]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

  const startTimer = async () => {
    try {
      setProcessingTimer(true);
      const timer = await timersAPI.startTimer();
      setServerTimerId(timer.id);
      setTimerRunning(true);
      setElapsed(0);
      timerIntervalRef.current = window.setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start timer', err);
    } finally {
      setProcessingTimer(false);
    }
  };

  const stopTimer = async () => {
    if (!serverTimerId) {
      setTimerRunning(false);
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }
    try {
      setProcessingTimer(true);
      const updated = await timersAPI.stopTimer(serverTimerId);
      setElapsed(updated.duration_seconds ?? elapsed);
      setTimerRunning(false);
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (onTimerStop) {
        try {
          await onTimerStop();
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error('Failed to stop timer', err);
    } finally {
      setProcessingTimer(false);
    }
  };

  useEffect(() => {
    if (!timerRunning) {
      return;
    }
    if (elapsed >= taskDurationSeconds) {
      stopTimer();
      if (!quest.completed && !expired) {
        setExpired(true);
        onExpire(quest.id);
      }
    }
  }, [elapsed, taskDurationSeconds, timerRunning, quest.completed, expired, onExpire, quest.id, stopTimer]);

  const handleAcceptTask = async () => {
    if (accepted) {
      return;
    }
    try {
      const updated = await questsAPI.accept(quest.id);
      if (updated.accepted_at) {
        setAccepted(true);
      }
      await startTimer();
    } catch (err) {
      console.error('Failed to accept quest', err);
    }
  };

  const canComplete = accepted && elapsed >= minCompleteSeconds && !quest.completed;

  return (
    <div className="group relative ...">
      <div className="flex items-start gap-2">
        <div className="min-w-0">
          <h3 className="text-white/90 text-sm font-semibold truncate">{quest.title}</h3>
          {quest.description && <p className="text-xs text-white/50 mt-1">{quest.description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        {!accepted ? (
          <Button onClick={handleAcceptTask} size="sm" variant="softAmber" disabled={processingTimer}>
            Принять
          </Button>
        ) : (
          <>
            <Button onClick={stopTimer} size="sm" variant="primary" disabled={processingTimer || !timerRunning}>
              {quest.title} · {Math.max(taskDurationSeconds - elapsed, 0) >= 60
                ? `${Math.floor(Math.max(taskDurationSeconds - elapsed, 0) / 60)}:${(Math.max(taskDurationSeconds - elapsed, 0) % 60).toString().padStart(2, '0')}`
                : `0:${Math.max(taskDurationSeconds - elapsed, 0).toString().padStart(2, '0')}`}
            </Button>
          </>
        )}
        <Button
          onClick={() => canComplete && onComplete(quest.id)}
          disabled={!canComplete}
          size="sm"
        >
          Завершить
        </Button>
        <button onClick={() => onDelete(quest.id)} className="...">
          Удалить
        </button>
      </div>
    </div>
  );
}
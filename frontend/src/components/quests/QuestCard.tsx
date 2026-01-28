import { useState, useEffect, useRef } from 'react';
import { Quest } from '../../types';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { timersAPI } from '../../api/quests';

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onTimerStop?: () => Promise<void>;
}

export function QuestCard({ quest, onComplete, onDelete, onTimerStop }: QuestCardProps) {
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);
  const [serverTimerId, setServerTimerId] = useState<number | null>(null);
  const [processingTimer, setProcessingTimer] = useState(false);

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
      const timer = await timersAPI.startTimer(quest.id);
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

  return (
    <div className="group relative ...">
      <div className="flex items-center gap-2 mt-3">
        {!timerRunning ? (
          <Button onClick={startTimer} size="sm" variant="secondary" disabled={processingTimer}>
            Start
          </Button>
        ) : (
          <Button onClick={stopTimer} size="sm" variant="primary" disabled={processingTimer}>
            Stop ({Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')})
          </Button>
        )}
        <Button onClick={() => !quest.completed && onComplete(quest.id)} disabled={quest.completed} size="sm">
          Complete
        </Button>
        {quest.completed && (
          <button onClick={() => onDelete(quest.id)} className="...">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { Quest } from '../../types';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { timersAPI } from '../../api/quests';

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

export function QuestCard({ quest, onComplete, onDelete }: QuestCardProps) {
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const timerIntervalRef = useRef<number | null>(null);
  const [serverTimerId, setServerTimerId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const startTimer = async () => {
    try {
      const timer = await timersAPI.startTimer(quest.id);
      // timer.started_at is ISO string; server may return duration_seconds=0 initially
      setServerTimerId(timer.id);
      setTimerRunning(true);
      setElapsed(0);
      timerIntervalRef.current = window.setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start timer', err);
    }
  };

  const stopTimer = async () => {
    try {
      if (!serverTimerId) {
        // if server id missing, try to call stop without id (not expected)
        setTimerRunning(false);
        if (timerIntervalRef.current) {
          window.clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        return;
      }
      const updated = await timersAPI.stopTimer(serverTimerId);
      // updated.duration_seconds available from server; sync elapsed
      setElapsed(updated.duration_seconds || elapsed);
      setTimerRunning(false);
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      // Optionally refresh quests/user via passed callbacks or global refresh
      // e.g., call onComplete or emit event if needed
    } catch (err) {
      console.error('Failed to stop timer', err);
    }
  };

  return (
    <div className="group relative ...">
      {/* existing content */}
      <div className="flex items-center gap-2 mt-3">
        {!timerRunning ? (
          <Button onClick={startTimer} size="sm" variant="secondary">Start</Button>
        ) : (
          <Button onClick={stopTimer} size="sm" variant="primary">Stop ({Math.floor(elapsed/60)}:{(elapsed%60).toString().padStart(2,'0')})</Button>
        )}
        {/* keep existing complete/delete buttons */}
        <Button onClick={() => !quest.completed && onComplete(quest.id)} disabled={quest.completed} size="sm">Complete</Button>
        {quest.completed && (
          <button onClick={() => onDelete(quest.id)} className="...">Remove</button>
        )}
      </div>
    </div>
  );
}
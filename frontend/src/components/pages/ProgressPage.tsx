import { useEffect, useMemo, useState } from 'react';
import { questsAPI } from '../../api/quests';
import { Quest } from '../../types';
import { Loader } from '../ui/Loader';

type DayBucket = {
  key: string;
  label: string;
  count: number;
  minutes: number;
};

const formatDayLabel = (date: Date) =>
  date.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

const formatMinutes = (minutes: number) => {
  if (minutes <= 0) return '0 мин';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours <= 0) return `${minutes} мин`;
  return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;
};

export function ProgressPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await questsAPI.getAll().catch(() => []);
        if (active) {
          setQuests(data || []);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const buckets = useMemo<DayBucket[]>(() => {
    const today = new Date();
    const days: DayBucket[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      days.push({ key, label: formatDayLabel(date), count: 0, minutes: 0 });
    }
    const completed = quests.filter((q) => q.completed && q.completed_at);
    completed.forEach((quest) => {
      const date = new Date(quest.completed_at as string);
      const key = date.toISOString().slice(0, 10);
      const bucket = days.find((d) => d.key === key);
      if (bucket) {
        bucket.count += 1;
        bucket.minutes += quest.duration_minutes ?? 0;
      }
    });
    return days;
  }, [quests]);

  const totalCompleted = buckets.reduce((sum, day) => sum + day.count, 0);
  const totalMinutes = buckets.reduce((sum, day) => sum + day.minutes, 0);
  const maxCount = Math.max(...buckets.map((d) => d.count), 1);
  const maxMinutes = Math.max(...buckets.map((d) => d.minutes), 1);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-10">
        <div className="panel-base panel-purple">
          <div className="panel-caption text-center">Прогресс по квестам</div>
          <div className="text-white/60 text-sm text-center mb-32">
            Статистика за последние 7 дней: выполненные квесты и время в них.
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-purple-700/30 bg-slate-950/40 p-6">
              <h3 className="text-purple-200 mb-4">Квесты по дням</h3>
              <div className="space-y-3">
                {buckets.map((day) => (
                  <div key={day.key} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-purple-200/60">{day.label}</div>
                    <div className="flex-1 h-3 rounded-full bg-slate-900/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-400/60"
                        style={{ width: `${(day.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <div className="w-10 text-right text-xs text-purple-200/70">{day.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-purple-700/30 bg-slate-950/40 p-6">
              <h3 className="text-purple-200 mb-4">Время по дням</h3>
              <div className="space-y-3">
                {buckets.map((day) => (
                  <div key={day.key} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-purple-200/60">{day.label}</div>
                    <div className="flex-1 h-3 rounded-full bg-slate-900/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-300/60"
                        style={{ width: `${(day.minutes / maxMinutes) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-xs text-purple-200/70">
                      {formatMinutes(day.minutes)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-purple-700/30 bg-slate-950/40 p-4">
              <p className="text-xs text-purple-200/60 mb-1">Квестов за 7 дней</p>
              <p className="text-lg text-purple-100">{totalCompleted}</p>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-slate-950/40 p-4">
              <p className="text-xs text-purple-200/60 mb-1">Время за 7 дней</p>
              <p className="text-lg text-purple-100">{formatMinutes(totalMinutes)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

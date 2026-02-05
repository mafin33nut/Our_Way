import { useEffect, useMemo, useState } from 'react';
import { questsAPI } from '../../api/quests';
import { Quest } from '../../types';
import { TaskHistoryPanel } from '../quests/TaskHistoryPanel';
import { Loader } from '../ui/Loader';
import { PanelHelp } from '../ui/PanelHelp';
import { BarChart2 } from 'lucide-react';
import { useCustomization } from '../../hooks/useCustomization';

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
  const { settings } = useCustomization();
  const isDynamic = settings.background === 'dynamic';
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const results = await Promise.allSettled([questsAPI.getAll().catch(() => [])]);
        const [questsRes] = results;
        const questList = questsRes.status === 'fulfilled' ? questsRes.value || [] : [];
        if (active) {
          setQuests(questList);
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
    <div className={`min-h-screen ${isDynamic ? 'bg-transparent' : 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950'}`}>
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1400px] flex flex-col items-center gap-8 sm:gap-10">
          <div className="w-full max-w-[1200px] flex items-center gap-2 text-slate-100">
            <BarChart2 className="w-5 h-5 text-teal-300" />
            <h2 className="text-slate-100">Прогресс</h2>
          </div>
          <div className="panel-base panel-purple w-full max-w-[1200px]">
            <div className="panel-caption text-left">Прогресс по квестам</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-6">
                <h3 className="text-slate-100 mb-4">Квесты по дням</h3>
                <div className="space-y-3">
                  {buckets.map((day) => (
                    <div key={day.key} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-slate-300/70">{day.label}</div>
                      <div className="flex-1 h-3 rounded-full bg-slate-900/70 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-400/70"
                          style={{ width: `${(day.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <div className="w-10 text-right text-xs text-slate-300/70">{day.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-6">
                <h3 className="text-slate-100 mb-4">Время по дням</h3>
                <div className="space-y-3">
                  {buckets.map((day) => (
                    <div key={day.key} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-slate-300/70">{day.label}</div>
                      <div className="flex-1 h-3 rounded-full bg-slate-900/70 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-300/70"
                          style={{ width: `${(day.minutes / maxMinutes) * 100}%` }}
                        />
                      </div>
                      <div className="w-16 text-right text-xs text-slate-300/70">
                        {formatMinutes(day.minutes)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-4">
                <p className="text-xs text-slate-300/70 mb-1">Квестов за 7 дней</p>
                <p className="text-lg text-slate-100">{totalCompleted}</p>
              </div>
              <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-4">
                <p className="text-xs text-slate-300/70 mb-1">Время за 7 дней</p>
                <p className="text-lg text-slate-100">{formatMinutes(totalMinutes)}</p>
              </div>
            </div>
            <PanelHelp className="text-center">
              <p>1) Сравни дни с максимальным количеством квестов.</p>
              <p>2) Проверь распределение времени — где был самый плотный день.</p>
              <p>3) Используй итоги ниже для корректировки плана.</p>
            </PanelHelp>
          </div>

          <div className="w-full max-w-[1200px]">
            <div className="panel-caption text-left">История выполнения</div>
            <TaskHistoryPanel quests={quests} />
            <PanelHelp className="text-center">
              <p>1) Просмотри недавние завершения по времени.</p>
              <p>2) Отмечай повторяемые задачи — это ваши сильные стороны.</p>
              <p>3) Добавляй новые вызовы, если история стала однообразной.</p>
            </PanelHelp>
          </div>
        </div>
      </div>
    </div>
  );
}

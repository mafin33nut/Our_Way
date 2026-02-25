import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Repeat, Sparkles, Trash2 } from 'lucide-react';
import { Quest, UserFocus } from '../../types';
import { questsAPI, focusesAPI } from '../../api/quests';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { HybridDynamicBackground } from '../background/HybridDynamicBackground';

type Difficulty = 'easy' | 'medium' | 'hard';

type PlannedTask = {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  focusId?: number;
  scheduledDate: string; // YYYY-MM-DD
  createdQuestId?: number;
};

type DailyTemplate = {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  focusId?: number;
  lastGeneratedDate?: string; // YYYY-MM-DD
};

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fromIsoToDateKey = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return toDateKey(date);
};

const monthGrid = (anchor: Date) => {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const lead = (firstDay.getDay() + 6) % 7; // Monday-first

  const cells: Array<Date | null> = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

export function CalendarPage() {
  const { user } = useAuth();
  const [anchorDate, setAnchorDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [quests, setQuests] = useState<Quest[]>([]);
  const [focuses, setFocuses] = useState<UserFocus[]>([]);
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [dailyTemplates, setDailyTemplates] = useState<DailyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [openWeekIdx, setOpenWeekIdx] = useState<number | null>(null);

  const [futureTitle, setFutureTitle] = useState('');
  const [futureDescription, setFutureDescription] = useState('');
  const [futureDifficulty, setFutureDifficulty] = useState<Difficulty>('easy');
  const [futureFocusId, setFutureFocusId] = useState<number | ''>('');
  const [futureDate, setFutureDate] = useState<string>(toDateKey(new Date()));
  const [jumpDate, setJumpDate] = useState<string>(toDateKey(new Date()));
  const [quickTitle, setQuickTitle] = useState('');

  const [dailyTitle, setDailyTitle] = useState('');
  const [dailyDescription, setDailyDescription] = useState('');
  const [dailyDifficulty, setDailyDifficulty] = useState<Difficulty>('easy');
  const [dailyFocusId, setDailyFocusId] = useState<number | ''>('');
  const pressFx = 'active:scale-[0.97] active:shadow-[0_8px_16px_rgba(2,6,23,0.45)] transition-transform transition-shadow';

  const storageKeys = useMemo(() => {
    const id = user?.id ?? 'guest';
    return {
      planned: `calendar_planned_${id}`,
      daily: `calendar_daily_${id}`,
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const [q, f] = await Promise.all([questsAPI.getAll().catch(() => []), focusesAPI.getAll().catch(() => [])]);
        if (!mounted) return;
        setQuests(q || []);
        setFocuses(f || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    try {
      const plannedRaw = localStorage.getItem(storageKeys.planned);
      const dailyRaw = localStorage.getItem(storageKeys.daily);
      setPlannedTasks(plannedRaw ? (JSON.parse(plannedRaw) as PlannedTask[]) : []);
      setDailyTemplates(dailyRaw ? (JSON.parse(dailyRaw) as DailyTemplate[]) : []);
    } catch {
      setPlannedTasks([]);
      setDailyTemplates([]);
    }

    return () => {
      mounted = false;
    };
  }, [storageKeys.daily, storageKeys.planned, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(storageKeys.planned, JSON.stringify(plannedTasks));
  }, [plannedTasks, storageKeys.planned, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(storageKeys.daily, JSON.stringify(dailyTemplates));
  }, [dailyTemplates, storageKeys.daily, user]);

  useEffect(() => {
    if (!user) return;
    if (loading) return;
    if (plannedTasks.length === 0 && dailyTemplates.length === 0) return;

    const today = toDateKey(new Date());
    let cancelled = false;

    const materialize = async () => {
      let changedPlanned = false;
      let changedDaily = false;

      const nextPlanned = [...plannedTasks];
      const nextDaily = [...dailyTemplates];

      for (let i = 0; i < nextPlanned.length; i += 1) {
        const item = nextPlanned[i];
        if (item.createdQuestId) continue;
        if (item.scheduledDate > today) continue;

        try {
          const created = await questsAPI.create({
            title: item.title,
            description: item.description,
            difficulty: item.difficulty,
            focus_ids: item.focusId ? [item.focusId] : [],
          });
          nextPlanned[i] = { ...item, createdQuestId: created.id };
          changedPlanned = true;
          setQuests((prev) => [created, ...prev]);
        } catch {
          // Keep item queued if request fails.
        }
      }

      for (let i = 0; i < nextDaily.length; i += 1) {
        const tpl = nextDaily[i];
        if (tpl.lastGeneratedDate === today) continue;
        try {
          const created = await questsAPI.create({
            title: `${tpl.title} · ${today}`,
            description: tpl.description || 'Ежедневное задание',
            difficulty: tpl.difficulty,
            focus_ids: tpl.focusId ? [tpl.focusId] : [],
          });
          nextDaily[i] = { ...tpl, lastGeneratedDate: today };
          changedDaily = true;
          setQuests((prev) => [created, ...prev]);
        } catch {
          // Retry on next page open.
        }
      }

      if (cancelled) return;
      if (changedPlanned) setPlannedTasks(nextPlanned);
      if (changedDaily) setDailyTemplates(nextDaily);
      if (changedPlanned || changedDaily) setStatus('Автозадачи обновлены.');
    };

    materialize();

    return () => {
      cancelled = true;
    };
  }, [dailyTemplates, loading, plannedTasks, user]);

  const cells = useMemo(() => monthGrid(anchorDate), [anchorDate]);
  const weeks = useMemo(() => {
    const result: Array<Array<Date | null>> = [];
    for (let i = 0; i < cells.length; i += 7) result.push(cells.slice(i, i + 7));
    return result;
  }, [cells]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Array<{ type: 'quest' | 'planned'; label: string }>>();

    for (const q of quests) {
      const key = fromIsoToDateKey(q.created_at);
      if (!key) continue;
      const list = map.get(key) || [];
      list.push({ type: 'quest', label: q.title });
      map.set(key, list);
    }

    for (const p of plannedTasks) {
      if (p.createdQuestId) continue;
      const list = map.get(p.scheduledDate) || [];
      list.push({ type: 'planned', label: `План: ${p.title}` });
      map.set(p.scheduledDate, list);
    }

    return map;
  }, [plannedTasks, quests]);

  const createPlannedTask = () => {
    if (!futureTitle.trim()) return;
    const id = `p_${Date.now()}`;
    setPlannedTasks((prev) => [
      {
        id,
        title: futureTitle.trim(),
        description: futureDescription.trim(),
        difficulty: futureDifficulty,
        focusId: futureFocusId || undefined,
        scheduledDate: futureDate,
      },
      ...prev,
    ]);
    setFutureTitle('');
    setFutureDescription('');
    setFutureDifficulty('easy');
    setFutureFocusId('');
    setStatus('Будущее задание запланировано.');
  };

  const createDailyTemplate = () => {
    if (!dailyTitle.trim()) return;
    const id = `d_${Date.now()}`;
    setDailyTemplates((prev) => [
      {
        id,
        title: dailyTitle.trim(),
        description: dailyDescription.trim(),
        difficulty: dailyDifficulty,
        focusId: dailyFocusId || undefined,
      },
      ...prev,
    ]);
    setDailyTitle('');
    setDailyDescription('');
    setDailyDifficulty('easy');
    setDailyFocusId('');
    setStatus('Ежедневное задание добавлено в автоплан.');
  };

  const jumpToDate = (dateKey: string) => {
    const date = new Date(dateKey);
    if (Number.isNaN(date.getTime())) return;
    setAnchorDate(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const createQuickTaskForDate = () => {
    if (!quickTitle.trim() || !jumpDate) return;
    const id = `p_${Date.now()}`;
    setPlannedTasks((prev) => [
      {
        id,
        title: quickTitle.trim(),
        description: '',
        difficulty: 'easy',
        scheduledDate: jumpDate,
      },
      ...prev,
    ]);
    jumpToDate(jumpDate);
    setQuickTitle('');
    setStatus(`Задание запланировано на ${jumpDate}.`);
  };

  const createQuestFromPlannedNow = async (taskId: string) => {
    const task = plannedTasks.find((p) => p.id === taskId);
    if (!task || task.createdQuestId) return;
    try {
      const created = await questsAPI.create({
        title: task.title,
        description: task.description,
        difficulty: task.difficulty,
        focus_ids: task.focusId ? [task.focusId] : [],
      });
      setQuests((prev) => [created, ...prev]);
      setPlannedTasks((prev) =>
        prev.map((p) => (p.id === taskId ? { ...p, createdQuestId: created.id } : p))
      );
      setStatus(`Задание "${task.title}" создано сейчас.`);
    } catch {
      setStatus('Не удалось создать запланированное задание.');
    }
  };

  const removePlannedTask = (taskId: string) => {
    setPlannedTasks((prev) => prev.filter((p) => p.id !== taskId));
    setStatus('Запланированное задание удалено.');
  };

  const generateDailyNow = async (templateId: string) => {
    const tpl = dailyTemplates.find((d) => d.id === templateId);
    if (!tpl) return;
    const today = toDateKey(new Date());
    try {
      const created = await questsAPI.create({
        title: `${tpl.title} · ${today}`,
        description: tpl.description || 'Ежедневное задание',
        difficulty: tpl.difficulty,
        focus_ids: tpl.focusId ? [tpl.focusId] : [],
      });
      setQuests((prev) => [created, ...prev]);
      setDailyTemplates((prev) =>
        prev.map((d) => (d.id === templateId ? { ...d, lastGeneratedDate: today } : d))
      );
      setStatus(`Ежедневное задание "${tpl.title}" создано.`);
    } catch {
      setStatus('Не удалось создать ежедневное задание.');
    }
  };

  const removeDailyTemplate = (templateId: string) => {
    setDailyTemplates((prev) => prev.filter((d) => d.id !== templateId));
    setStatus('Шаблон ежедневного задания удален.');
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <HybridDynamicBackground
        opacity={0.44}
        speed={0.95}
        palette={{ a: '#2dd4bf', b: '#22d3ee', c: '#8b5cf6', d: '#d946ef' }}
      />

      <div className="relative z-10 min-h-screen flex items-start justify-center px-4 py-10 sm:px-10 sm:py-16">
        <div className="w-full max-w-[1400px] space-y-20">
          <div className="panel-base panel-teal p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-teal-200" />
                <h2 className="text-slate-100">Календарь</h2>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className={pressFx}
                  onClick={() => setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-3 py-2 rounded-lg bg-slate-950/35 text-slate-100">
                  {MONTH_NAMES[anchorDate.getMonth()]} {anchorDate.getFullYear()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={pressFx}
                  onClick={() => setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_220px] gap-3">
              <input
                type="date"
                value={jumpDate}
                onChange={(e) => {
                  setJumpDate(e.target.value);
                  jumpToDate(e.target.value);
                }}
                className="rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3"
              />
              <input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Название задания на выбранную дату"
                className="rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3"
              />
              <Button onClick={createQuickTaskForDate} className={`action-button bg-black text-white ${pressFx}`}>
                Создать на дату
              </Button>
            </div>
            {status && <p className="mt-4 text-sm text-teal-100/90">{status}</p>}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-14">
            <div className="panel-base panel-purple p-7 xl:col-span-2">
              <div className="panel-caption text-left">Подробный месяц</div>
              {loading ? (
                <p className="text-sm text-slate-300/70">Загрузка календаря...</p>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {WEEK_DAYS.map((d) => (
                      <div key={d} className="text-xs text-slate-300/70 text-center py-2">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {cells.map((cell, idx) => {
                      if (!cell) {
                        return <div key={`empty_${idx}`} className="rounded-xl min-h-[88px] bg-slate-950/20" />;
                      }
                      const key = toDateKey(cell);
                      const isToday = key === toDateKey(new Date());
                      return (
                        <div
                          key={key}
                          className={`rounded-xl min-h-[88px] p-3 border ${
                            isToday
                              ? 'border-teal-300/60 bg-teal-500/10'
                              : 'border-slate-600/30 bg-slate-950/25'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-slate-100">{cell.getDate()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="panel-base panel-orange p-7">
              <div className="panel-caption text-left flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                Планирование
              </div>

              <div className="space-y-3">
                <input
                  value={futureTitle}
                  onChange={(e) => setFutureTitle(e.target.value)}
                  placeholder="Будущее задание"
                  className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3"
                />
                <textarea
                  value={futureDescription}
                  onChange={(e) => setFutureDescription(e.target.value)}
                  placeholder="Описание"
                  rows={3}
                  className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3 resize-none"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={futureDifficulty}
                    onChange={(e) => setFutureDifficulty(e.target.value as Difficulty)}
                    className="rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3"
                  >
                    <option value="easy">Легкая</option>
                    <option value="medium">Средняя</option>
                    <option value="hard">Сложная</option>
                  </select>
                  <input
                    type="date"
                    value={futureDate}
                    onChange={(e) => setFutureDate(e.target.value)}
                    className="rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3"
                  />
                </div>
                <select
                  value={futureFocusId}
                  onChange={(e) => setFutureFocusId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3"
                >
                  <option value="">Без направления</option>
                  {focuses.map((focus) => (
                    <option key={focus.id} value={focus.id}>
                      {focus.name}
                    </option>
                  ))}
                </select>
                <Button onClick={createPlannedTask} className={`w-full action-button bg-black text-white ${pressFx}`}>
                  Запланировать
                </Button>

                <div className="pt-3 border-t border-slate-600/30 space-y-2">
                  {plannedTasks.length === 0 ? (
                    <p className="text-xs text-slate-300/70">Запланированных задач пока нет.</p>
                  ) : (
                    plannedTasks.slice(0, 6).map((task) => (
                      <div key={task.id} className="rounded-lg border border-slate-600/25 bg-slate-950/25 px-3 py-2">
                        <p className="text-sm text-amber-100">{task.title}</p>
                        <p className="text-xs text-slate-300/70 mb-2">
                          Дата: {task.scheduledDate} {task.createdQuestId ? '• создано' : '• в ожидании'}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className={pressFx}
                            onClick={() => createQuestFromPlannedNow(task.id)}
                            disabled={Boolean(task.createdQuestId)}
                          >
                            Создать сейчас
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={pressFx}
                            onClick={() => removePlannedTask(task.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-14">
            <div className="panel-base panel-sky p-7 xl:col-span-2">
              <div className="panel-caption text-left">Недели месяца</div>
              <div className="space-y-4">
                {weeks.map((week, idx) => (
                  <div key={`week_${idx}`} className="rounded-2xl border border-slate-600/30 bg-slate-950/25 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-100">Неделя {idx + 1}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={pressFx}
                        onClick={() => setOpenWeekIdx((prev) => (prev === idx ? null : idx))}
                      >
                        {openWeekIdx === idx ? 'Скрыть' : 'Открыть'}
                      </Button>
                    </div>
                    {openWeekIdx === idx && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {week.map((day, dayIdx) => {
                          if (!day) {
                            return <div key={`week_empty_${idx}_${dayIdx}`} className="rounded-xl bg-slate-950/20 min-h-[82px]" />;
                          }
                          const key = toDateKey(day);
                          const dayEvents = eventsByDate.get(key) || [];
                          return (
                            <div key={key} className="rounded-xl border border-slate-600/30 bg-slate-950/35 p-3">
                              <p className="text-xs text-slate-300/70 mb-2">{WEEK_DAYS[dayIdx]} · {day.getDate()}</p>
                              {dayEvents.length === 0 ? (
                                <p className="text-xs text-slate-400">Нет задач</p>
                              ) : (
                                <div className="space-y-1">
                                  {dayEvents.slice(0, 4).map((ev, i) => (
                                    <p
                                      key={`${key}_${i}`}
                                      className={`text-xs truncate ${
                                        ev.type === 'planned' ? 'text-violet-200/90' : 'text-teal-100/90'
                                      }`}
                                    >
                                      • {ev.label}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-base panel-lime p-7">
              <div className="panel-caption text-left flex items-center gap-2">
                <Repeat className="w-5 h-5 text-lime-200" />
                Ежедневные автозадачи
              </div>

              <div className="space-y-3">
                <input
                  value={dailyTitle}
                  onChange={(e) => setDailyTitle(e.target.value)}
                  placeholder="Название ежедневного задания"
                  className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3"
                />
                <textarea
                  value={dailyDescription}
                  onChange={(e) => setDailyDescription(e.target.value)}
                  placeholder="Описание"
                  rows={3}
                  className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3 resize-none"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={dailyDifficulty}
                    onChange={(e) => setDailyDifficulty(e.target.value as Difficulty)}
                    className="rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3"
                  >
                    <option value="easy">Легкая</option>
                    <option value="medium">Средняя</option>
                    <option value="hard">Сложная</option>
                  </select>
                  <select
                    value={dailyFocusId}
                    onChange={(e) => setDailyFocusId(e.target.value ? Number(e.target.value) : '')}
                    className="rounded-xl border border-slate-600/30 bg-slate-950/40 text-slate-100 px-4 py-3"
                  >
                    <option value="">Без направления</option>
                    {focuses.map((focus) => (
                      <option key={focus.id} value={focus.id}>
                        {focus.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={createDailyTemplate} className={`w-full action-button bg-black text-white ${pressFx}`}>
                  Добавить автозадачу
                </Button>

                <div className="pt-3 border-t border-slate-600/30 space-y-2">
                  {dailyTemplates.length === 0 ? (
                    <p className="text-xs text-slate-300/70">Шаблоны пока не добавлены.</p>
                  ) : (
                    dailyTemplates.slice(0, 6).map((tpl) => (
                      <div key={tpl.id} className="rounded-lg border border-slate-600/25 bg-slate-950/25 px-3 py-2">
                        <p className="text-sm text-lime-100">{tpl.title}</p>
                        <p className="text-xs text-slate-300/70 mb-2">
                          Последняя генерация: {tpl.lastGeneratedDate || 'еще не создано'}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className={pressFx}
                            onClick={() => generateDailyNow(tpl.id)}
                          >
                            Создать сегодня
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={pressFx}
                            onClick={() => removeDailyTemplate(tpl.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Home, Plus, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
import { focusesAPI, questsAPI } from '../../api/quests';
import { Quest, UserFocus } from '../../types';
import { isToday } from '../../utils/time';
import { Loader } from '../ui/Loader';
import { Button } from '../ui/Button';
import { CharacterProfile } from '../profile/characterProfile';
import { TaskHistoryPanel } from '../quests/TaskHistoryPanel';
import { QuestCard } from '../quests/QuestCard';

type TaskType = 'simple' | 'stepwise';
type TaskDifficulty = 'easy' | 'medium' | 'hard';

type AchievementSlot = {
  id: string;
  title: string;
  req: number;
};

const ACHIEVEMENT_SLOTS: AchievementSlot[] = [
  { id: 'a1', title: 'Новичок', req: 1 },
  { id: 'a2', title: 'Боец', req: 5 },
  { id: 'a3', title: 'Солдат', req: 10 },
  { id: 'a4', title: 'Легенда', req: 20 },
  { id: 'a5', title: 'Герой', req: 30 },
  { id: 'a6', title: 'Мастер', req: 40 },
  { id: 'a7', title: 'Титан', req: 50 },
  { id: 'a8', title: 'Вершина', req: 75 },
];

type FaqItem = {
  id: string;
  question: string; // короткое название темы
  preview: string; // краткий текст под заголовком
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'directions',
    question: 'Направления и квесты',
    preview: 'Как выбрать направление и создавать задания.',
    answer:
      'Создайте направления в блоке «Направления», выберите одно из них и создавайте квесты через кнопку «Добавить задания». Квесты можно делать обычными или поэтапными со списком шагов.',
  },
  {
    id: 'clans',
    question: 'Кланы и клановые квесты',
    preview: 'Как вступать в кланы и участвовать в общих квестах.',
    answer:
      'В окне кланов вы можете вступать по ссылке, создавать свои кланы и запускать клановые квесты с лимитом участников и сложностью. Вклад каждого участника учитывается в общем прогрессе.',
  },
  {
    id: 'achievements',
    question: 'Достижения и закрепление',
    preview: 'Как открывать и закреплять достижения на панели героя.',
    answer:
      'Достижения открываются автоматически по количеству выполненных квестов. На странице достижений можно закрепить до трёх достижений, чтобы они отображались в панели героя.',
  },
  {
    id: 'friends',
    question: 'Друзья и активность',
    preview: 'Что видно в списке друзей и профилях.',
    answer:
      'Список друзей показывает, кто сейчас онлайн и сколько квестов они сделали. Через профиль друга можно смотреть его уровень и активность.',
  },
  {
    id: 'settings',
    question: 'Настройки профиля и интерфейса',
    preview: 'Что можно изменить в профиле и внешнем виде приложения.',
    answer:
      'В настройках профиля меняются аватар и описание. В блоке интерфейса выбирается тема (тёмная или светлая) и настраиваются звуковые эффекты.',
  },
];

export function HomePage() {
  const { user, refreshUser } = useAuth();
  const { playVictorySound, settings } = useCustomization();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [focuses, setFocuses] = useState<UserFocus[]>([]);
  const [loading, setLoading] = useState(true);

  const [newFocusName, setNewFocusName] = useState('');
  const [selectedFocusId, setSelectedFocusId] = useState<number | null>(null);
  const [focusError, setFocusError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('simple');
  const [taskDifficulty, setTaskDifficulty] = useState<TaskDifficulty>('easy');
  const [steps, setSteps] = useState<Array<{ title: string; difficulty: TaskDifficulty }>>([
    { title: '', difficulty: 'easy' },
  ]);
  const [savingTask, setSavingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [questList, focusList] = await Promise.all([
        questsAPI.getAll().catch(() => []),
        focusesAPI.getAll().catch(() => []),
      ]);
      setQuests(questList || []);
      setFocuses(focusList || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setQuests([]);
      setFocuses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const questsCompletedToday = useMemo(
    () => quests.filter((q) => q.completed && q.completed_at && isToday(q.completed_at)).length,
    [quests]
  );

  const unlockedAchievements = useMemo(() => {
    const total = user?.total_quests_completed || 0;
    return ACHIEVEMENT_SLOTS.filter((slot) => total >= slot.req);
  }, [user?.total_quests_completed]);

  const pinnedAchievements = useMemo(() => {
    const pinnedIds = user?.pinned_achievements || [];
    const pinnedUnlocked = unlockedAchievements.filter((slot) => pinnedIds.includes(slot.id));
    if (pinnedUnlocked.length > 0) {
      return pinnedUnlocked.slice(0, 3);
    }
    return unlockedAchievements.slice(0, 3);
  }, [unlockedAchievements, user?.pinned_achievements]);

  const canCreateTask = useMemo(() => {
    if (!taskTitle.trim()) return false;
    if (taskType === 'stepwise') {
      return steps.some((s) => s.title.trim());
    }
    return true;
  }, [taskTitle, taskType, steps]);

  const handleAddFocus = async () => {
    if (!newFocusName.trim()) return;
    setFocusError(null);
    try {
      const created = await focusesAPI.create(newFocusName.trim());
      setFocuses((prev) => [...prev, created]);
      setNewFocusName('');
    } catch (err) {
      console.error('Failed to create focus:', err);
      setFocusError('Не удалось создать направление.');
    }
  };

  const handleDeleteFocus = async (id: number) => {
    setFocusError(null);
    try {
      await focusesAPI.delete(id);
      setFocuses((prev) => prev.filter((f) => f.id !== id));
      if (selectedFocusId === id) {
        setSelectedFocusId(null);
      }
    } catch (err) {
      console.error('Failed to delete focus:', err);
      setFocusError('Не удалось удалить направление.');
    }
  };

  const handleCompleteQuest = async (id: number) => {
    try {
      const updatedQuest = await questsAPI.complete(id);
      setQuests((prev) => prev.map((q) => (q.id === id ? updatedQuest : q)));
      playVictorySound();
      await refreshUser();
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  const handleDeleteQuest = async (id: number) => {
    try {
      await questsAPI.delete(id);
      setQuests((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error('Failed to delete quest:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!canCreateTask) return;
    setSavingTask(true);
    setTaskError(null);
    try {
      const payload = {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        difficulty: taskDifficulty,
        focus_ids: selectedFocusId ? [selectedFocusId] : [],
        steps:
          taskType === 'stepwise'
            ? steps
                .map((step, idx) => ({
                  title: step.title.trim(),
                  difficulty: step.difficulty,
                  order: idx,
                }))
                .filter((step) => step.title)
            : [],
      };
      const created = await questsAPI.create(payload);
      setQuests((prev) => [created, ...prev]);
      setTaskTitle('');
      setTaskDescription('');
      setSteps([{ title: '', difficulty: 'easy' }]);
      setTaskType('simple');
      setTaskDifficulty('easy');
      setIsCreateOpen(false);
    } catch (error: any) {
      console.error('Failed to create quest:', error);
      setTaskError(error?.response?.data?.detail || 'Не удалось создать квест.');
    } finally {
      setSavingTask(false);
    }
  };

  const focusCards: Array<UserFocus & { id: number }> = useMemo(
    () => [...focuses, { id: 0, name: 'Без направления', created_at: '' }],
    [focuses]
  );

  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const isLight = settings.theme === 'light';

  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen">
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1800px] mx-auto">
          <div className="flex items-center gap-2 text-slate-100 mb-6">
            <Home className="w-5 h-5 text-teal-300" />
            <h2 className="text-slate-100">Главная</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 place-items-stretch">
            <div className="panel-base panel-teal p-6 lg:min-h-[520px] flex flex-col">
              <div className="panel-caption text-left">Панель героя</div>
              <CharacterProfile user={user} questsCompletedToday={questsCompletedToday} />
              <div className="mt-6">
                <p className="text-xs text-slate-300/70 mb-3">Закрепленные достижения</p>
                {pinnedAchievements.length === 0 ? (
                  <div className="text-sm text-slate-300/70">Пока нет достижений</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {pinnedAchievements.map((slot) => (
                      <div
                        key={slot.id}
                        className={`rounded-xl px-4 py-3 ${
                          isLight
                            ? 'bg-white border border-slate-200 text-slate-900'
                            : 'bg-slate-950/35 text-slate-100'
                        }`}
                      >
                        <p className="text-sm achievement-earned">{slot.title}</p>
                        <p className="text-xs achievement-earned">Квестов: {slot.req}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-300/60 mt-2">
                  Закрепление доступно на странице достижений.
                </p>
              </div>
            </div>

            <div className="panel-base panel-orange p-6 lg:min-h-[520px] flex flex-col">
              <div className="panel-caption text-left">Направления</div>
              <div className="space-y-3">
                <p className="text-xs text-slate-300/70">
                  Управляйте направлениями и выбирайте направление для создания квеста.
                </p>
                <div className="flex flex-wrap gap-2">
                  {focuses.map((focus) => (
                    <div
                      key={focus.id}
                      className={`px-3 py-2 rounded-xl transition-all ${
                        isLight
                          ? 'bg-white border border-slate-200'
                          : 'bg-slate-950/30 shadow-[0_10px_22px_-16px_rgba(0,0,0,0.7)] backdrop-blur-sm'
                      } ${
                        selectedFocusId === focus.id
                          ? 'ring-2 ring-amber-300/50'
                          : 'hover:ring-2 hover:ring-white/10'
                      }`}
                      style={{ borderRadius: '18px' }}
                    >
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="focus"
                          className="accent-teal-300"
                          checked={selectedFocusId === focus.id}
                          onChange={() => setSelectedFocusId(focus.id)}
                        />
                        <span className="text-sm text-slate-100">{focus.name}</span>
                      </label>
                      <div className="mt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="w-full bg-slate-950/30"
                          onClick={() => handleDeleteFocus(focus.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                  {focuses.length === 0 && (
                    <div className="text-sm text-slate-300/70">Пока нет направлений.</div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <input
                    value={newFocusName}
                    onChange={(e) => setNewFocusName(e.target.value)}
                    placeholder="Новое направление"
                    className={`flex-1 rounded-xl border px-4 py-3 ${
                      isLight
                        ? 'border-slate-300 bg-white text-slate-900'
                        : 'border-slate-600/30 bg-slate-950/40 text-slate-100'
                    }`}
                  />
                  <Button
                    onClick={handleAddFocus}
                    size="sm"
                    className="action-button text-white"
                  >
                    Добавить
                  </Button>
                </div>
                {focusError && <p className="text-sm text-rose-200">{focusError}</p>}

                <div className="mt-4">
                  <p className="text-xs text-slate-300/70 mb-2">Выбранное направление</p>
                  <div
                    className={`rounded-xl px-4 py-3 ${
                      isLight ? 'bg-white border border-slate-200 text-slate-900' : 'bg-slate-950/30 text-slate-100'
                    }`}
                  >
                    <p className="text-sm">
                      {selectedFocusId
                        ? focuses.find((f) => f.id === selectedFocusId)?.name || '—'
                        : 'Без направления'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-base panel-purple p-6 lg:min-h-[520px] flex flex-col">
              <div className="panel-caption text-left">История</div>
              <TaskHistoryPanel quests={quests} />
            </div>

            <div className="panel-base panel-sky p-6 lg:col-span-3 lg:min-h-[520px]">
              <div className="panel-caption text-left">Квесты по направлениям</div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {focusCards.map((focus) => {
                  const focusQuests =
                    focus.id === 0
                      ? quests.filter((q) => !q.focuses || q.focuses.length === 0)
                      : quests.filter((q) => q.focuses?.some((f) => f.id === focus.id));

                  const active = focusQuests.filter((q) => !q.completed);
                  const completedToday = focusQuests.filter((q) => q.completed && q.completed_at && isToday(q.completed_at));

                  return (
                  <div
                    key={focus.id}
                    className={`rounded-2xl px-5 py-4 ${
                      isLight
                        ? 'bg-white border border-slate-200 text-slate-900'
                        : 'bg-slate-950/25 shadow-[0_14px_32px_-24px_rgba(0,0,0,0.75)] text-slate-100'
                    }`}
                  >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h3 className="truncate">{focus.name}</h3>
                        <span className="text-xs text-slate-300/70 shrink-0">
                          {active.length} активн.
                        </span>
                      </div>

                      {active.length === 0 && completedToday.length === 0 ? (
                        <p className="text-sm text-slate-300/60">Пока нет квестов</p>
                      ) : (
                        <div className="space-y-3">
                          {active.map((quest) => (
                            <QuestCard
                              key={quest.id}
                              quest={quest}
                              onComplete={handleCompleteQuest}
                              onDelete={handleDeleteQuest}
                            />
                          ))}
                          {completedToday.length > 0 && (
                            <div className="pt-3 border-t border-slate-600/25 space-y-3">
                              <p className="text-xs text-slate-300/70">Выполнено сегодня</p>
                              {completedToday.map((quest) => (
                                <QuestCard
                                  key={quest.id}
                                  quest={quest}
                                  onComplete={handleCompleteQuest}
                                  onDelete={handleDeleteQuest}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    size="lg"
                    className="action-button bg-black text-white hover:bg-neutral-900"
                  >
                    Добавить задания
                  </Button>
                </div>
            </div>

            <div className="panel-base panel-orange p-6 lg:col-span-3">
              <div className="panel-caption text-left">Вопросы и ответы</div>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item) => {
                  const isOpen = openFaqId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOpenFaqId((prev) => (prev === item.id ? null : item.id))}
                      className={`w-full text-left rounded-2xl px-4 py-3 transition-colors ${
                        isLight
                          ? 'bg-white border border-slate-200 text-slate-900 hover:border-teal-300/60'
                          : 'border border-slate-600/40 bg-slate-950/30 hover:border-teal-300/50 text-slate-100'
                      }`}
                    >
                      <p className="text-sm font-semibold">{item.question}</p>
                      {!isOpen && (
                        <p className="mt-1 text-xs text-slate-400">
                          {item.preview}
                        </p>
                      )}
                      {isOpen && (
                        <p className="mt-2 text-xs text-slate-300/80">
                          {item.answer}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCreateOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-8">
            <button
              type="button"
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              aria-label="Закрыть окно создания квеста"
              onClick={() => setIsCreateOpen(false)}
            />
            <div className="relative w-full max-w-[920px]">
              <div className="panel-base panel-orange p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-teal-300" />
                    <h2 className="text-slate-100">Создать квест</h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
                  <div className="space-y-4">
                    <input
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Название квеста"
                      className={`w-full rounded-xl border px-4 py-3 ${
                        isLight
                          ? 'border-slate-300 bg-white text-slate-900'
                          : 'border-slate-600/30 bg-slate-950/40 text-slate-100'
                      }`}
                    />
                    <textarea
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Описание"
                      rows={4}
                      className={`w-full min-h-[120px] rounded-xl border px-4 py-3 ${
                        isLight
                          ? 'border-slate-300 bg-white text-slate-900'
                          : 'border-slate-600/30 bg-slate-950/40 text-slate-100'
                      }`}
                    />
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-slate-200/80">Направление:</label>
                      <select
                        value={selectedFocusId ?? ''}
                        onChange={(e) => setSelectedFocusId(e.target.value ? Number(e.target.value) : null)}
                        className={`rounded-xl border px-3 py-3 ${
                          isLight
                            ? 'border-slate-300 bg-white text-slate-900'
                            : 'border-slate-600/30 bg-slate-950/40 text-slate-100'
                        }`}
                      >
                        <option value="">Без направления</option>
                        {focuses.map((focus) => (
                          <option key={focus.id} value={focus.id}>
                            {focus.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl p-5 space-y-3 ${
                      isLight
                        ? 'bg-white border border-slate-200 text-slate-900'
                        : 'bg-slate-950/25 text-slate-200/80'
                    }`}
                  >
                    <p className="text-sm text-slate-200/80">Тип квеста</p>
                    <label className="text-sm text-slate-200/80 flex items-center gap-2">
                      <input
                        type="radio"
                        checked={taskType === 'simple'}
                        onChange={() => setTaskType('simple')}
                        className="accent-teal-300"
                      />
                      Обычный
                    </label>
                    <label className="text-sm text-slate-200/80 flex items-center gap-2">
                      <input
                        type="radio"
                        checked={taskType === 'stepwise'}
                        onChange={() => setTaskType('stepwise')}
                        className="accent-teal-300"
                      />
                      Поэтапный
                    </label>

                    <div className="pt-2">
                      <label className="text-sm text-slate-200/80 block mb-2">Сложность</label>
                      <select
                        value={taskDifficulty}
                        onChange={(e) => setTaskDifficulty(e.target.value as TaskDifficulty)}
                        className={`w-full rounded-xl border px-3 py-3 ${
                          isLight
                            ? 'border-slate-300 bg-white text-slate-900'
                            : 'border-slate-600/30 bg-slate-950/40 text-slate-100'
                        }`}
                      >
                        <option value="easy">Легкая</option>
                        <option value="medium">Средняя</option>
                        <option value="hard">Сложная</option>
                      </select>
                    </div>
                  </div>
                </div>

                {taskType === 'stepwise' && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-200/80">Шаги квеста</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSteps((prev) => [...prev, { title: '', difficulty: 'easy' }])}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить шаг
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2">
                          <input
                            value={step.title}
                            onChange={(e) => {
                              const copy = [...steps];
                              copy[idx] = { ...copy[idx], title: e.target.value };
                              setSteps(copy);
                            }}
                            placeholder={`Шаг ${idx + 1}`}
                            className={`flex-1 rounded-xl border px-4 py-3 ${
                              isLight
                                ? 'border-slate-300 bg-white text-slate-900'
                                : 'border-slate-600/30 bg-slate-950/40 text-slate-100'
                            }`}
                          />
                          <select
                            value={step.difficulty}
                            onChange={(e) => {
                              const copy = [...steps];
                              copy[idx] = { ...copy[idx], difficulty: e.target.value as TaskDifficulty };
                              setSteps(copy);
                            }}
                            className={`sm:w-48 rounded-xl border px-3 py-3 ${
                              isLight
                                ? 'border-slate-300 bg-white text-slate-900'
                                : 'border-slate-600/30 bg-slate-950/40 text-slate-100'
                            }`}
                          >
                            <option value="easy">Легкая</option>
                            <option value="medium">Средняя</option>
                            <option value="hard">Сложная</option>
                          </select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSteps((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            Удалить
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {taskError && <p className="text-sm text-rose-200 mt-4">{taskError}</p>}

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Button onClick={handleCreateTask} disabled={!canCreateTask || savingTask} className="action-button">
                    {savingTask ? 'Создание...' : 'Создать квест'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreateOpen(false)}
                    className={isLight ? '' : 'bg-slate-950/25'}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

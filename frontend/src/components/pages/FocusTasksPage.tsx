import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, ClipboardList, Target, ListChecks } from 'lucide-react';
import { focusesAPI, questsAPI } from '../../api/quests';
import { Quest, UserFocus } from '../../types';
import { Button } from '../ui/Button';
import { QuestList } from '../quests/QuestList';
import { useCustomization } from '../../hooks/useCustomization';
import { useAuth } from '../../hooks/useAuth';
import { PanelHelp } from '../ui/PanelHelp';

type TaskType = 'simple' | 'stepwise';
type TaskDifficulty = 'easy' | 'medium' | 'hard';
export function FocusTasksPage() {
  const { refreshUser } = useAuth();
  const { playVictorySound, settings } = useCustomization();
  const isDynamic = settings.background === 'dynamic';
  const [focuses, setFocuses] = useState<UserFocus[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const [newFocusName, setNewFocusName] = useState('');
  const [selectedFocusId, setSelectedFocusId] = useState<number | null>(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('simple');
  const [taskDifficulty, setTaskDifficulty] = useState<TaskDifficulty>('easy');
  const [steps, setSteps] = useState<Array<{ title: string; difficulty: TaskDifficulty }>>([
    { title: '', difficulty: 'easy' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [focusList, questList] = await Promise.all([
        focusesAPI.getAll().catch(() => []),
        questsAPI.getAll().catch(() => []),
      ]);
      setFocuses(focusList || []);
      setQuests(questList || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canCreateTask = useMemo(() => {
    if (!taskTitle.trim()) return false;
    if (taskType === 'stepwise') {
      return steps.some((s) => s.title.trim());
    }
    return true;
  }, [taskTitle, taskType, steps]);

  const handleAddFocus = async () => {
    if (!newFocusName.trim()) {
      return;
    }
    try {
      const created = await focusesAPI.create(newFocusName.trim());
      setFocuses((prev) => [...prev, created]);
      setNewFocusName('');
    } catch (e) {
      setError('Не удалось создать направление развития.');
    }
  };

  const handleDeleteFocus = async (id: number) => {
    try {
      await focusesAPI.delete(id);
      setFocuses((prev) => prev.filter((f) => f.id !== id));
      if (selectedFocusId === id) {
        setSelectedFocusId(null);
      }
    } catch (e) {
      setError('Не удалось удалить направление развития.');
    }
  };

  const handleCreateTask = async () => {
    if (!canCreateTask) {
      return;
    }
    setSaving(true);
    setError(null);
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
    } catch (e) {
      setError('Не удалось создать квест.');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteQuest = async (id: number) => {
    try {
      const updated = await questsAPI.complete(id);
      setQuests((prev) => prev.map((q) => (q.id === id ? updated : q)));
      playVictorySound();
      await refreshUser();
    } catch (e) {
      setError('Не удалось завершить квест.');
    }
  };

  const handleDeleteQuest = async (id: number) => {
    try {
      await questsAPI.delete(id);
      setQuests((prev) => prev.filter((q) => q.id !== id));
    } catch (e) {
      setError('Не удалось удалить квест.');
    }
  };

  return (
    <div className={`min-h-screen ${isDynamic ? 'bg-transparent' : 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950'}`}>
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1400px]">
          <div className="flex items-center gap-2 text-slate-100 mb-6">
            <ListChecks className="w-5 h-5 text-teal-300" />
            <h2 className="text-slate-100">Квесты</h2>
          </div>
          <div className="flex flex-col items-center gap-8 sm:gap-10">
            <div className="panel-base panel-purple w-full max-w-[1200px]">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-teal-300" />
                <h2 className="text-slate-100">Мои направления развития</h2>
              </div>
              <div className="flex gap-3 flex-wrap mb-4">
                {focuses.map((focus) => (
                  <div
                    key={focus.id}
                    className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                      selectedFocusId === focus.id
                        ? 'border-amber-400 bg-amber-500/10 text-amber-100'
                        : 'border-purple-700/40 text-purple-200/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="focus"
                      className="mr-1 accent-teal-300"
                      checked={selectedFocusId === focus.id}
                      onChange={() => setSelectedFocusId(focus.id)}
                    />
                    <span>{focus.name}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="ml-1 bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 border border-slate-600/60"
                      onClick={() => handleDeleteFocus(focus.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  value={newFocusName}
                  onChange={(e) => setNewFocusName(e.target.value)}
                  placeholder="Новое направление"
                  className="flex-1 rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                />
                <Button onClick={handleAddFocus} size="sm" className="action-button">
                  Добавить
                </Button>
              </div>
              <PanelHelp>
                <p>1) Выберите направление развития, чтобы квесты ниже группировались.</p>
                <p>2) Добавьте новое направление, если хотите вести отдельный трек.</p>
                <p>3) Удаляйте направление только если оно больше не нужно.</p>
              </PanelHelp>
            </div>

            <div className="panel-base panel-orange w-full max-w-[1200px]">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 text-teal-300" />
                <h2 className="text-slate-100">Создать квест</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
                <div className="space-y-4">
                  <input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Название квеста"
                    className="w-full rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                  />
                <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Описание"
                  rows={4}
                  className="w-full min-h-[120px] rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                  />
                  <div className="flex items-center gap-3">
                    <label className="text-purple-200/80 text-sm">Направление:</label>
                    <select
                      value={selectedFocusId ?? ''}
                      onChange={(e) => setSelectedFocusId(e.target.value ? Number(e.target.value) : null)}
                      className="rounded-lg border border-purple-600/30 bg-slate-900/60 px-3 py-2 text-slate-100"
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
                <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-4 space-y-3">
                  <p className="text-sm text-slate-200">Тип квеста</p>
                  <label className="text-purple-200/80 text-sm flex items-center gap-2">
                    <input
                      type="radio"
                      checked={taskType === 'simple'}
                      onChange={() => setTaskType('simple')}
                      className="accent-teal-300"
                    />
                    Обычный (100 XP)
                  </label>
                  <label className="text-purple-200/80 text-sm flex items-center gap-2">
                    <input
                      type="radio"
                      checked={taskType === 'stepwise'}
                      onChange={() => setTaskType('stepwise')}
                      className="accent-teal-300"
                    />
                    Поэтапный (XP по сложности шагов)
                  </label>
                  <div className="pt-2">
                    <label className="text-purple-200/80 text-sm block mb-2">Сложность</label>
                    <select
                      value={taskDifficulty}
                      onChange={(e) => setTaskDifficulty(e.target.value as TaskDifficulty)}
                      className="w-full rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                    >
                      <option value="easy">Легкая — 100 XP</option>
                      <option value="medium">Средняя — 150 XP</option>
                      <option value="hard">Сложная — 200 XP</option>
                    </select>
                  </div>
                </div>
              </div>
              {taskType === 'stepwise' && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-200 text-sm">Шаги квеста</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setSteps((prev) => [...prev, { title: '', difficulty: 'easy' }])
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить шаг
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          value={step.title}
                          onChange={(e) => {
                            const copy = [...steps];
                            copy[idx] = { ...copy[idx], title: e.target.value };
                            setSteps(copy);
                          }}
                          placeholder={`Шаг ${idx + 1}`}
                          className="flex-1 rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                        />
                        <select
                          value={step.difficulty}
                          onChange={(e) => {
                            const copy = [...steps];
                            copy[idx] = { ...copy[idx], difficulty: e.target.value as TaskDifficulty };
                            setSteps(copy);
                          }}
                          className="w-40 rounded-lg border border-purple-600/30 bg-slate-950/50 px-2 py-2 text-purple-100"
                        >
                          <option value="easy">Легк. +30</option>
                          <option value="medium">Средн. +50</option>
                          <option value="hard">Сложн. +70</option>
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
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button onClick={handleCreateTask} disabled={!canCreateTask || saving} className="action-button">
                  {saving ? 'Создание...' : 'Создать квест'}
                </Button>
                <p className="text-sm text-slate-300/80">
                  {(() => {
                    const baseXp =
                      taskDifficulty === 'hard' ? 200 : taskDifficulty === 'medium' ? 150 : 100;
                    const stepXp = steps
                      .filter((s) => s.title.trim())
                      .reduce((sum, s) => {
                        const bonus = s.difficulty === 'hard' ? 70 : s.difficulty === 'medium' ? 50 : 30;
                        return sum + bonus;
                      }, 0);
                    const total = taskType === 'stepwise' ? baseXp + stepXp : baseXp;
                    return `Награда: ${total} XP`;
                  })()}
                </p>
              </div>
              {error && <p className="text-sm text-rose-200 mt-3">{error}</p>}
              <PanelHelp>
                <p>1) Введите название и цель квеста в 1–2 фразы.</p>
                <p>2) Выберите направление — так квест попадет в нужную колонку ниже.</p>
                <p>3) Для поэтапных квестов добавьте шаги и сохраните.</p>
              </PanelHelp>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

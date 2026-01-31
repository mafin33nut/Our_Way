import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, ClipboardList, Target } from 'lucide-react';
import { focusesAPI, questsAPI } from '../../api/quests';
import { Quest, UserFocus } from '../../types';
import { Button } from '../ui/Button';
import { QuestList } from '../quests/QuestList';
import { useCustomization } from '../../hooks/useCustomization';

type TaskType = 'simple' | 'stepwise';

export function FocusTasksPage() {
  const { playVictorySound } = useCustomization();
  const [focuses, setFocuses] = useState<UserFocus[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const [newFocusName, setNewFocusName] = useState('');
  const [selectedFocuses, setSelectedFocuses] = useState<number[]>([]);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('simple');
  const [steps, setSteps] = useState<string[]>(['']);
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
      return steps.some((s) => s.trim());
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
      setError('Не удалось создать фокус.');
    }
  };

  const handleDeleteFocus = async (id: number) => {
    try {
      await focusesAPI.delete(id);
      setFocuses((prev) => prev.filter((f) => f.id !== id));
      setSelectedFocuses((prev) => prev.filter((focusId) => focusId !== id));
    } catch (e) {
      setError('Не удалось удалить фокус.');
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
        difficulty: 'easy' as const,
        focus_ids: selectedFocuses,
        steps:
          taskType === 'stepwise'
            ? steps
                .map((title, idx) => ({ title: title.trim(), order: idx }))
                .filter((step) => step.title)
            : [],
      };
      const created = await questsAPI.create(payload);
      setQuests((prev) => [created, ...prev]);
      setTaskTitle('');
      setTaskDescription('');
      setSteps(['']);
      setTaskType('simple');
    } catch (e) {
      setError('Не удалось создать задание.');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteQuest = async (id: number) => {
    try {
      const updated = await questsAPI.complete(id);
      setQuests((prev) => prev.map((q) => (q.id === id ? updated : q)));
      playVictorySound();
    } catch (e) {
      setError('Не удалось завершить задание.');
    }
  };

  const handleDeleteQuest = async (id: number) => {
    try {
      await questsAPI.delete(id);
      setQuests((prev) => prev.filter((q) => q.id !== id));
    } catch (e) {
      setError('Не удалось удалить задание.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-10">
        <div className="panel-base panel-purple">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-300" />
            <h2 className="text-purple-200">Мои фокусы</h2>
          </div>
          <div className="flex gap-3 flex-wrap mb-4">
            {focuses.map((focus) => (
              <label
                key={focus.id}
                className={`px-3 py-2 rounded-lg border cursor-pointer ${
                  selectedFocuses.includes(focus.id)
                    ? 'border-amber-400 bg-amber-500/10 text-amber-100'
                    : 'border-purple-700/40 text-purple-200/70'
                }`}
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedFocuses.includes(focus.id)}
                  onChange={(e) => {
                    setSelectedFocuses((prev) =>
                      e.target.checked ? [...prev, focus.id] : prev.filter((id) => id !== focus.id)
                    );
                  }}
                />
                {focus.name}
                <button
                  type="button"
                  className="ml-2 text-xs text-rose-200"
                  onClick={() => handleDeleteFocus(focus.id)}
                >
                  удалить
                </button>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              value={newFocusName}
              onChange={(e) => setNewFocusName(e.target.value)}
              placeholder="Новый фокус"
              className="flex-1 rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
            />
            <Button onClick={handleAddFocus} size="sm">
              Добавить
            </Button>
          </div>
        </div>

        <div className="panel-base panel-orange">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-purple-300" />
            <h2 className="text-purple-200">Создать задание</h2>
          </div>
          <div className="space-y-3">
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Название задания"
              className="w-full rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
            />
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Описание"
              rows={3}
              className="w-full rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
            />
            <div className="flex gap-3">
              <label className="text-purple-200/80">
                <input
                  type="radio"
                  checked={taskType === 'simple'}
                  onChange={() => setTaskType('simple')}
                  className="mr-2"
                />
                Обычное
              </label>
              <label className="text-purple-200/80">
                <input
                  type="radio"
                  checked={taskType === 'stepwise'}
                  onChange={() => setTaskType('stepwise')}
                  className="mr-2"
                />
                Поэтапное
              </label>
            </div>
            {taskType === 'stepwise' && (
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={step}
                      onChange={(e) => {
                        const copy = [...steps];
                        copy[idx] = e.target.value;
                        setSteps(copy);
                      }}
                      placeholder={`Шаг ${idx + 1}`}
                      className="flex-1 rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSteps((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      удалить
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="ghost" onClick={() => setSteps((prev) => [...prev, ''])}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить шаг
                </Button>
              </div>
            )}
            {error && <p className="text-sm text-rose-200">{error}</p>}
            <Button onClick={handleCreateTask} disabled={!canCreateTask || saving}>
              {saving ? 'Создание...' : 'Создать задание'}
            </Button>
          </div>
        </div>

        <div className="panel-base panel-sky">
          <div className="panel-caption text-center">Мои задания</div>
          {loading ? (
            <p className="text-center text-purple-200/60">Загрузка...</p>
          ) : (
            <QuestList quests={quests} onComplete={handleCompleteQuest} onDelete={handleDeleteQuest} />
          )}
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, ClipboardList, Target } from 'lucide-react';
import { clanQuestsAPI, focusesAPI, questsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Clan, Quest, UserFocus } from '../../types';
import { Button } from '../ui/Button';
import { QuestList } from '../quests/QuestList';
import { useCustomization } from '../../hooks/useCustomization';

type TaskType = 'simple' | 'stepwise';
type QuestScope = 'personal' | 'clan';

export function FocusTasksPage() {
  const { playVictorySound } = useCustomization();
  const [focuses, setFocuses] = useState<UserFocus[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);

  const [newFocusName, setNewFocusName] = useState('');
  const [selectedFocusId, setSelectedFocusId] = useState<number | null>(null);
  const [selectedClanId, setSelectedClanId] = useState<number | null>(null);

  const [questScope, setQuestScope] = useState<QuestScope>('personal');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('simple');
  const [steps, setSteps] = useState<string[]>(['']);
  const [clanQuestMaxParticipants, setClanQuestMaxParticipants] = useState(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [focusList, questList, clanList] = await Promise.all([
        focusesAPI.getAll().catch(() => []),
        questsAPI.getAll().catch(() => []),
        socialAPI.getMyClans().catch(() => []),
      ]);
      setFocuses(focusList || []);
      setQuests(questList || []);
      setClans(clanList || []);
      setSelectedClanId((prev) => {
        if (prev && (clanList || []).some((clan) => clan.id === prev)) {
          return prev;
        }
        return (clanList || [])[0]?.id ?? null;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canCreateTask = useMemo(() => {
    if (!taskTitle.trim()) return false;
    if (questScope === 'clan') {
      return Boolean(selectedClanId) && clanQuestMaxParticipants >= 1;
    }
    if (taskType === 'stepwise') {
      return steps.some((s) => s.trim());
    }
    return true;
  }, [taskTitle, taskType, steps, questScope, selectedClanId, clanQuestMaxParticipants]);

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
      if (selectedFocusId === id) {
        setSelectedFocusId(null);
      }
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
      if (questScope === 'clan') {
        if (!selectedClanId) {
          setError('Выберите клан.');
          return;
        }
        await clanQuestsAPI.create({
          clan: selectedClanId,
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          max_participants: Math.max(1, clanQuestMaxParticipants),
        });
        setTaskTitle('');
        setTaskDescription('');
        setClanQuestMaxParticipants(2);
        return;
      }
      const payload = {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        difficulty: 'easy' as const,
        focus_ids: selectedFocusId ? [selectedFocusId] : [],
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
      setError(questScope === 'clan' ? 'Не удалось создать клановый квест.' : 'Не удалось создать квест.');
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
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <div className="min-h-screen flex items-start justify-center px-8 py-12">
        <div className="w-full max-w-[1400px]">
          <div className="flex flex-col items-center gap-10">
            <div className="panel-base panel-purple w-full max-w-[1200px]">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-teal-300" />
                <h2 className="text-slate-100">Мои фокусы</h2>
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
                      className="mr-1"
                      checked={selectedFocusId === focus.id}
                      onChange={() => setSelectedFocusId(focus.id)}
                    />
                    <span>{focus.name}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="ml-1 bg-rose-500/70 text-white hover:bg-rose-500/90 border border-rose-400/60"
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
                  placeholder="Новый фокус"
                  className="flex-1 rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                />
                <Button onClick={handleAddFocus} size="sm">
                  Добавить
                </Button>
              </div>
            </div>

            <div className="panel-base panel-orange w-full max-w-[1200px]">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 text-teal-300" />
                <h2 className="text-slate-100">Создать квест</h2>
              </div>
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="inline-flex rounded-lg border border-slate-600/40 bg-slate-950/40 p-1">
                  <button
                    type="button"
                    onClick={() => setQuestScope('personal')}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      questScope === 'personal'
                        ? 'bg-teal-400/20 text-teal-100'
                        : 'text-slate-300/70 hover:text-slate-100'
                    }`}
                  >
                    Личный квест
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestScope('clan')}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      questScope === 'clan'
                        ? 'bg-amber-400/20 text-amber-100'
                        : 'text-slate-300/70 hover:text-slate-100'
                    }`}
                  >
                    Клановый квест
                  </button>
                </div>
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
                    rows={3}
                    className="w-full rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                  />
                  {questScope === 'personal' ? (
                    <div className="flex items-center gap-3">
                      <label className="text-purple-200/80 text-sm">Фокус:</label>
                      <select
                        value={selectedFocusId ?? ''}
                        onChange={(e) => setSelectedFocusId(e.target.value ? Number(e.target.value) : null)}
                        className="rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                      >
                        <option value="">Без фокуса</option>
                        {focuses.map((focus) => (
                          <option key={focus.id} value={focus.id}>
                            {focus.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <label className="text-purple-200/80 text-sm">Клан:</label>
                      <select
                        value={selectedClanId ?? ''}
                        onChange={(e) => setSelectedClanId(e.target.value ? Number(e.target.value) : null)}
                        className="rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                      >
                        <option value="">Выберите клан</option>
                        {clans.map((clan) => (
                          <option key={clan.id} value={clan.id}>
                            {clan.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-4 space-y-3">
                  {questScope === 'personal' ? (
                    <>
                      <p className="text-sm text-slate-200">Тип квеста</p>
                      <label className="text-purple-200/80 text-sm flex items-center gap-2">
                        <input
                          type="radio"
                          checked={taskType === 'simple'}
                          onChange={() => setTaskType('simple')}
                        />
                        Обычный (100 XP)
                      </label>
                      <label className="text-purple-200/80 text-sm flex items-center gap-2">
                        <input
                          type="radio"
                          checked={taskType === 'stepwise'}
                          onChange={() => setTaskType('stepwise')}
                        />
                        Поэтапный (100 + 50 за шаг)
                      </label>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-200">Параметры</p>
                      <label className="text-purple-200/80 text-sm flex items-center justify-between">
                        Макс. участников
                        <input
                          type="number"
                          min={1}
                          value={clanQuestMaxParticipants}
                          onChange={(e) =>
                            setClanQuestMaxParticipants(Math.max(1, Number(e.target.value) || 1))
                          }
                          className="w-20 rounded-lg border border-purple-600/30 bg-slate-950/50 px-2 py-1 text-purple-100"
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
              {questScope === 'personal' && taskType === 'stepwise' && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-200 text-sm">Шаги квеста</p>
                    <Button size="sm" variant="ghost" onClick={() => setSteps((prev) => [...prev, ''])}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить шаг
                    </Button>
                  </div>
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
                          Удалить
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs text-slate-300/70">
                  {questScope === 'personal'
                    ? taskType === 'stepwise'
                      ? `Награда: ${100 + Math.max(steps.filter((s) => s.trim()).length - 1, 0) * 50} XP`
                      : 'Награда: 100 XP'
                    : 'Награда: клановый опыт по числу участников'}
                </p>
                <Button onClick={handleCreateTask} disabled={!canCreateTask || saving}>
                  {saving ? 'Создание...' : questScope === 'clan' ? 'Создать клановый квест' : 'Создать квест'}
                </Button>
              </div>
              {error && <p className="text-sm text-rose-200 mt-3">{error}</p>}
            </div>

          <div className="panel-base panel-sky w-full max-w-[1200px]">
            <div className="panel-caption text-center">Мои квесты по фокусам</div>
            {loading ? (
              <p className="text-center text-purple-200/60">Загрузка...</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...focuses, { id: 0, name: 'Без фокуса', created_at: '' }].map((focus) => {
                  const focusQuests =
                    focus.id === 0
                      ? quests.filter((q) => !q.focuses || q.focuses.length === 0)
                      : quests.filter((q) => q.focuses?.some((f) => f.id === focus.id));
                  if (focusQuests.length === 0) {
                    return null;
                  }
                  return (
                    <div key={focus.id} className="rounded-lg border border-purple-700/30 bg-slate-950/40 p-4">
                      <h3 className="text-purple-200 mb-3">{focus.name}</h3>
                      <QuestList quests={focusQuests} onComplete={handleCompleteQuest} onDelete={handleDeleteQuest} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, ClipboardList, Target } from 'lucide-react';
import { clanQuestsAPI, focusesAPI, questsAPI } from '../../api/quests';
import { socialAPI } from '../../api/social';
import { Quest, UserFocus, Clan } from '../../types';
import { Button } from '../ui/Button';
import { QuestList } from '../quests/QuestList';
import { useCustomization } from '../../hooks/useCustomization';

type TaskType = 'simple' | 'stepwise';
type QuestKind = 'personal' | 'clan';

export function FocusTasksPage() {
  const { playVictorySound } = useCustomization();
  const [focuses, setFocuses] = useState<UserFocus[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const [newFocusName, setNewFocusName] = useState('');
  const [selectedFocusId, setSelectedFocusId] = useState<number | null>(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('simple');
  const [questKind, setQuestKind] = useState<QuestKind>('personal');
  const [selectedClanId, setSelectedClanId] = useState<number | null>(null);
  const [maxParticipants, setMaxParticipants] = useState(2);
  const [steps, setSteps] = useState<string[]>(['']);
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
      if (clanList && clanList.length > 0) {
        setSelectedClanId((prev) =>
          prev && clanList.some((clanItem) => clanItem.id === prev) ? prev : clanList[0].id
        );
      } else {
        setSelectedClanId(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canCreateTask = useMemo(() => {
    if (!taskTitle.trim()) return false;
    if (questKind === 'clan') {
      return !!selectedClanId && maxParticipants >= 1;
    }
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
      if (questKind === 'clan') {
        if (!selectedClanId) {
          throw new Error('Выберите клан');
        }
        await clanQuestsAPI.create({
          clan: selectedClanId,
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          max_participants: maxParticipants,
        });
        setTaskTitle('');
        setTaskDescription('');
        setMaxParticipants(2);
      } else {
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
      }
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-10">
        <div className="panel-base panel-purple">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-300" />
            <h2 className="text-purple-200">Мои фокусы</h2>
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

        <div className="panel-base panel-orange">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-purple-300" />
            <h2 className="text-purple-200">Создать квест</h2>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              <label className="text-purple-200/80">
                <input
                  type="radio"
                  checked={questKind === 'personal'}
                  onChange={() => setQuestKind('personal')}
                  className="mr-2"
                />
                Личный квест
              </label>
              <label className="text-purple-200/80">
                <input
                  type="radio"
                  checked={questKind === 'clan'}
                  onChange={() => setQuestKind('clan')}
                  className="mr-2"
                />
                Клановый квест
              </label>
            </div>
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
            {questKind === 'personal' ? (
              <>
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
              </>
            ) : (
              <>
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
                <div className="flex items-center gap-3">
                  <label className="text-purple-200/80 text-sm">Макс. участников:</label>
                  <input
                    type="number"
                    min={1}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Math.max(1, Number(e.target.value) || 1))}
                    className="w-24 rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                  />
                </div>
                <p className="text-xs text-purple-200/50">
                  Клановые квесты отображаются на странице клана.
                </p>
              </>
            )}
            {error && <p className="text-sm text-rose-200">{error}</p>}
            <Button onClick={handleCreateTask} disabled={!canCreateTask || saving}>
              {saving ? 'Создание...' : 'Создать квест'}
            </Button>
          </div>
        </div>

        <div className="panel-base panel-sky">
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
  );
}

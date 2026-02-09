import { useMemo, useState } from 'react';
import { Award, CheckCircle2, Lock, Pin, PinOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { Button } from '../ui/Button';

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

const MAX_PINS = 3;

export function AchievementsPage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const total = user?.total_quests_completed || 0;
  const pinnedIds = user?.pinned_achievements || [];

  const unlocked = useMemo(() => ACHIEVEMENT_SLOTS.filter((slot) => total >= slot.req), [total]);

  const handleTogglePin = async (id: string) => {
    if (!user) return;
    setStatus(null);
    setSaving(true);
    try {
      const isPinned = pinnedIds.includes(id);
      const next = isPinned ? pinnedIds.filter((x) => x !== id) : [...pinnedIds, id];
      if (!isPinned && pinnedIds.length >= MAX_PINS) {
        setStatus(`Можно закрепить не больше ${MAX_PINS} достижений.`);
        return;
      }
      const formData = new FormData();
      formData.append('pinned_achievements', JSON.stringify(next));
      await authAPI.updateProfile(formData);
      await refreshUser();
      setStatus(isPinned ? 'Достижение откреплено.' : 'Достижение закреплено.');
    } catch (err) {
      console.error('Failed to update pinned achievements', err);
      setStatus('Не удалось сохранить изменения.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1200px] flex flex-col items-center gap-8 sm:gap-10">
          <div className="w-full flex items-center gap-2 text-slate-100">
            <Award className="w-5 h-5 text-teal-300" />
            <h2 className="text-slate-100">Достижения</h2>
          </div>

          <div className="panel-base panel-teal p-6 w-full">
            <div className="panel-caption text-left">Мои достижения</div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-300/70 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Получено: {unlocked.length} / {ACHIEVEMENT_SLOTS.length}
              </div>
              <div className="text-sm text-slate-300/70">
                Закреплено: {pinnedIds.length} / {MAX_PINS}
              </div>
            </div>
            {status && (
              <div className="mt-4 rounded-xl bg-slate-950/30 px-4 py-3">
                <p className="text-sm text-slate-100">{status}</p>
              </div>
            )}
          </div>

          <div className="panel-base panel-purple p-6 w-full">
            <div className="panel-caption text-left">Список достижений</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACHIEVEMENT_SLOTS.map((slot) => {
                const isUnlocked = total >= slot.req;
                const isPinned = pinnedIds.includes(slot.id);
                return (
                  <div
                    key={slot.id}
                    className={`rounded-2xl px-5 py-4 bg-slate-950/25 shadow-[0_14px_32px_-24px_rgba(0,0,0,0.75)] ${
                      isUnlocked ? '' : 'opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-slate-100 achievement-earned">{slot.title}</p>
                        <p className="text-xs text-slate-300/70 achievement-earned">Квестов: {slot.req}</p>
                      </div>
                      <div className="shrink-0">
                        {isUnlocked ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400/70" />
                        )}
                      </div>
                    </div>

                    {isUnlocked && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          size="sm"
                          variant={isPinned ? 'ghost' : 'primary'}
                          disabled={saving}
                          onClick={() => handleTogglePin(slot.id)}
                          className={`action-button ${isPinned ? '' : 'bg-black text-white hover:bg-neutral-900'}`}
                        >
                          {isPinned ? (
                            <>
                              <PinOff className="w-4 h-4 mr-2" />
                              Открепить
                            </>
                          ) : (
                            <>
                              <Pin className="w-4 h-4 mr-2" />
                              Закрепить
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


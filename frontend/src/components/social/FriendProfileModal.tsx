import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User as UserIcon, Trophy } from 'lucide-react';
import { socialAPI } from '../../api/social';
import { User } from '../../types';
import { resolveMediaUrl } from '../../utils/media';
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

interface FriendProfileModalProps {
  friendId: number | null;
  onClose: () => void;
}

export function FriendProfileModal({ friendId, onClose }: FriendProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!friendId) {
      setProfile(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    socialAPI
      .getUserById(friendId)
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((err) => {
        console.error('Failed to load friend profile', err);
        if (active) setError('Не удалось загрузить профиль');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [friendId]);

  const unlocked = useMemo(() => {
    const total = profile?.total_quests_completed ?? 0;
    return ACHIEVEMENT_SLOTS.filter((slot) => total >= slot.req);
  }, [profile?.total_quests_completed]);

  if (!friendId || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Закрыть профиль друга"
      />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[720px] -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-slate-700" />
              <h3 className="text-slate-900">Профиль друга</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="bg-black text-white hover:bg-slate-900 border border-black [&_*]:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {loading && <p className="text-sm text-slate-600">Загрузка профиля...</p>}
          {!loading && error && <p className="text-sm text-rose-700">{error}</p>}

          {!loading && profile && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {resolveMediaUrl(profile.avatar) ? (
                  <img
                    src={resolveMediaUrl(profile.avatar) as string}
                    alt={profile.username}
                    className="w-16 h-16 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <p className="text-slate-900">{profile.username}</p>
                  <p className="text-xs text-slate-600">Уровень {profile.level}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">Опыт</p>
                  <p className="text-slate-900">{profile.xp} XP</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">Квестов завершено</p>
                  <p className="text-slate-900">{profile.total_quests_completed}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-600">Описание</p>
                <p className="text-slate-900">
                  {profile.bio?.trim() ? profile.bio : 'Пока нет описания'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-900 mb-3">Достижения</p>
                {unlocked.length === 0 ? (
                  <p className="text-xs text-slate-600">Пока нет достижений</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {unlocked.map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                      >
                        <p className="text-sm text-slate-900 achievement-earned">{slot.title}</p>
                        <p className="text-xs text-slate-600 achievement-earned">Квестов: {slot.req}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User as UserIcon, Trophy } from 'lucide-react';
import { socialAPI } from '../../api/social';
import { User } from '../../types';
import { resolveMediaUrl } from '../../utils/media';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';

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
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';

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
        <div
          className={
            isLight
              ? 'rounded-2xl bg-white border border-slate-200 shadow-xl p-6'
              : 'rounded-2xl bg-slate-900/95 border border-slate-700/70 shadow-[0_22px_48px_-18px_rgba(15,23,42,0.95)] p-6'
          }
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className={isLight ? 'w-5 h-5 text-slate-700' : 'w-5 h-5 text-teal-300'} />
              <h3 className={isLight ? 'text-slate-900' : 'text-slate-50'}>Профиль друга</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={
                isLight
                  ? 'bg-black text-white hover:bg-slate-900 border border-black [&_*]:text-white'
                  : 'bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-600 [&_*]:text-slate-100'
              }
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {loading && (
            <p className={isLight ? 'text-sm text-slate-600' : 'text-sm text-slate-300/80'}>
              Загрузка профиля...
            </p>
          )}
          {!loading && error && (
            <p className={isLight ? 'text-sm text-rose-700' : 'text-sm text-rose-300'}>{error}</p>
          )}

          {!loading && profile && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {resolveMediaUrl(profile.avatar) ? (
                  <img
                    src={resolveMediaUrl(profile.avatar) as string}
                    alt={profile.username}
                    className={`w-16 h-16 rounded-full object-cover border ${
                      isLight ? 'border-slate-300' : 'border-teal-300/70'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isLight
                        ? 'bg-slate-100 border border-slate-300 text-slate-700'
                        : 'bg-slate-800/80 border border-teal-300/60 text-teal-100'
                    }`}
                  >
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <p className={isLight ? 'text-slate-900' : 'text-slate-50'}>{profile.username}</p>
                  <p className={isLight ? 'text-xs text-slate-600' : 'text-xs text-slate-400'}>
                    Уровень {profile.level}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={
                    isLight
                      ? 'rounded-xl border border-slate-200 bg-slate-50 p-4'
                      : 'rounded-xl border border-slate-700/70 bg-slate-900/80 p-4'
                  }
                >
                  <p className={isLight ? 'text-xs text-slate-600' : 'text-xs text-slate-400'}>Опыт</p>
                  <p className={isLight ? 'text-slate-900' : 'text-slate-50'}>{profile.xp} XP</p>
                </div>
                <div
                  className={
                    isLight
                      ? 'rounded-xl border border-slate-200 bg-slate-50 p-4'
                      : 'rounded-xl border border-slate-700/70 bg-slate-900/80 p-4'
                  }
                >
                  <p className={isLight ? 'text-xs text-slate-600' : 'text-xs text-slate-400'}>
                    Квестов завершено
                  </p>
                  <p className={isLight ? 'text-slate-900' : 'text-slate-50'}>
                    {profile.total_quests_completed}
                  </p>
                </div>
              </div>

              <div
                className={
                  isLight
                    ? 'rounded-xl border border-slate-200 bg-slate-50 p-4'
                    : 'rounded-xl border border-slate-700/70 bg-slate-900/80 p-4'
                }
              >
                <p className={isLight ? 'text-xs text-slate-600' : 'text-xs text-slate-400'}>Описание</p>
                <p className={isLight ? 'text-slate-900' : 'text-slate-50'}>
                  {profile.bio?.trim() ? profile.bio : 'Пока нет описания'}
                </p>
              </div>

              <div
                className={
                  isLight
                    ? 'rounded-xl border border-slate-200 bg-slate-50 p-4'
                    : 'rounded-xl border border-slate-700/70 bg-slate-900/80 p-4'
                }
              >
                <p className={isLight ? 'text-slate-900 mb-3' : 'text-slate-50 mb-3'}>Достижения</p>
                {unlocked.length === 0 ? (
                  <p className={isLight ? 'text-xs text-slate-600' : 'text-xs text-slate-400'}>
                    Пока нет достижений
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {unlocked.map((slot) => (
                      <div
                        key={slot.id}
                        className={
                          isLight
                            ? 'rounded-lg border border-slate-200 bg-white px-3 py-2'
                            : 'rounded-lg border border-teal-500/30 bg-slate-900/80 px-3 py-2'
                        }
                      >
                        <p className="text-sm text-slate-100 achievement-earned">{slot.title}</p>
                        <p className="text-xs text-slate-300/80 achievement-earned">
                          Квестов: {slot.req}
                        </p>
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

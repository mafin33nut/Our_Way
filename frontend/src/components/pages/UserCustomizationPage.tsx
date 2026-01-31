import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { User as UserIcon, ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { Button } from '../ui/Button';
import { resolveMediaUrl } from '../../utils/media';

export function UserCustomizationPage() {
  const { user, refreshUser } = useAuth();
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const avatarPreview = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      await authAPI.updateProfile(formData);
      await refreshUser();
      setStatus('Профиль обновлен');
      setAvatarFile(null);
    } catch (error) {
      console.error('Failed to update profile', error);
      setStatus('Не удалось обновить профиль');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append('avatar', '');
      await authAPI.updateProfile(formData);
      await refreshUser();
      setAvatarFile(null);
      setStatus('Аватар удален');
    } catch (error) {
      console.error('Failed to remove avatar', error);
      setStatus('Не удалось удалить аватар');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="panel-base panel-purple p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-purple-400" />
                <h1 className="text-2xl text-purple-300">Настройка профиля</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-6 flex flex-col items-center text-center gap-3">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/60"
                />
              ) : resolveMediaUrl(user.avatar) ? (
                <img
                  src={resolveMediaUrl(user.avatar) as string}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/60"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-800/70 border-2 border-purple-500/60 flex items-center justify-center text-purple-200 text-2xl">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
              )}
              <label className="w-full">
                <div className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border border-purple-600/30 bg-slate-900/50 text-purple-200 text-sm cursor-pointer hover:border-purple-500/60">
                  <Camera className="w-4 h-4" />
                  Загрузить фото
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </label>
              {(avatarPreview || user.avatar) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={saving}
                  className="w-full"
                >
                  Удалить аватар
                </Button>
              )}
              <p className="text-purple-200 mt-1">{user.username}</p>
              <p className="text-xs text-purple-200/60">Уровень {user.level}</p>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-4">
                <p className="text-xs text-purple-200/60">Email</p>
                <p className="text-purple-200">{user.email || '—'}</p>
              </div>
              <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-4">
                <p className="text-xs text-purple-200/60">Опыт</p>
                <p className="text-purple-200">{user.xp} XP</p>
              </div>
              <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-4">
                <p className="text-xs text-purple-200/60">Следующий уровень</p>
                <p className="text-purple-200">{user.xp_to_next_level} XP</p>
              </div>
              <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-4">
                <p className="text-xs text-purple-200/60">Выполнено квестов</p>
                <p className="text-purple-200">{user.total_quests_completed}</p>
              </div>
              <div className="rounded-lg border border-purple-600/20 bg-slate-950/40 p-4">
                <p className="text-xs text-purple-200/60">Описание</p>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-purple-600/30 bg-slate-950/50 p-3 text-purple-100 placeholder-purple-200/30 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Добавьте короткое описание"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                {status && (
                  <span className="text-sm text-purple-200/70">{status}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

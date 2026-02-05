import { Link } from 'react-router-dom';
import { useState } from 'react';
import { User as UserIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { Button } from '../ui/Button';
import { PanelHelp } from '../ui/PanelHelp';

export function UserCustomizationPage() {
  const { user, refreshUser } = useAuth();
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      await authAPI.updateProfile(formData);
      await refreshUser();
      setStatus('Профиль обновлен');
    } catch (error) {
      console.error('Failed to update profile', error);
      setStatus('Не удалось обновить профиль');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1200px]">
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

            <div className="space-y-4">
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
            <PanelHelp>
              <p>1) Обновите описание и сохраните изменения.</p>
              <p>2) Проверьте данные профиля ниже.</p>
            </PanelHelp>
          </div>
        </div>
      </div>
    </div>
  );
}

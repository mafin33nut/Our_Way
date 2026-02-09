import { useMemo, useState } from 'react';
import { ArrowLeft, Moon, Settings, Sun, User as UserIcon, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCustomization } from '../../hooks/useCustomization';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { Button } from '../ui/Button';
import { PanelHelp } from '../ui/PanelHelp';
import { resolveMediaUrl } from '../../utils/media';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { settings, updateSettings, playVictorySound } = useCustomization();

  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  if (!user) {
    return null;
  }

  const handleSaveProfile = async () => {
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
      setAvatarFile(null);
      setStatus('Настройки сохранены.');
    } catch (err) {
      console.error('Failed to update profile', err);
      setStatus('Не удалось сохранить настройки.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1200px]">
          <div className="panel-base panel-purple p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Settings className="w-6 h-6 text-purple-400" />
                  <h1 className="text-2xl text-purple-300">Настройки</h1>
                </div>
              </div>
              {status && <span className="text-sm text-slate-200/70">{status}</span>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="panel-base panel-teal p-6">
                <div className="panel-caption text-left">Профиль</div>

                <div className="flex items-center gap-4 mb-6">
                  {avatarPreview || resolveMediaUrl(user.avatar) ? (
                    <img
                      src={(avatarPreview || (resolveMediaUrl(user.avatar) as string)) as string}
                      alt={user.username}
                      className="w-20 h-20 rounded-full object-cover border-2 border-teal-300/60"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-800/70 border-2 border-teal-300/60 flex items-center justify-center text-slate-200">
                      <UserIcon className="w-9 h-9" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-slate-100">{user.username}</p>
                    <p className="text-xs text-slate-300/70">{user.email || '—'}</p>
                    <p className="text-xs text-slate-300/70">
                      Уровень {user.level} · {user.xp} XP
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300/70 mb-2">Аватар</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setAvatarFile(file);
                      }}
                      className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 px-4 py-3 text-slate-100"
                    />
                    <p className="text-xs text-slate-300/60 mt-2">Выберите изображение PNG/JPG/WebP.</p>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300/70 mb-2">Описание</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Добавьте короткое описание"
                      className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 px-4 py-3 text-slate-100"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving} className="action-button">
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="panel-base panel-orange p-6">
                <div className="panel-caption text-left">Интерфейс</div>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-200/80 mb-3">Тема</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateSettings({ theme: 'dark' })}
                        className={`rounded-2xl px-5 py-4 bg-slate-950/25 transition-all ${
                          settings.theme === 'dark' ? 'ring-2 ring-teal-300/50' : 'hover:ring-2 hover:ring-white/10'
                        }`}
                      >
                        <Moon className="w-6 h-6 text-teal-200 mb-2" />
                        <p className="text-sm text-slate-100">Темная</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSettings({ theme: 'light' })}
                        className={`rounded-2xl px-5 py-4 bg-slate-950/25 transition-all ${
                          settings.theme === 'light' ? 'ring-2 ring-purple-400/50' : 'hover:ring-2 hover:ring-white/10'
                        }`}
                      >
                        <Sun className="w-6 h-6 text-amber-300 mb-2" />
                        <p className="text-sm text-slate-100">Светлая</p>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300/60 mt-2">
                      Светлая тема: бело-серая с фиолетовым акцентом.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-200/80 mb-3">Звуки</p>
                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({ soundEnabled: !settings.soundEnabled });
                        if (!settings.soundEnabled) {
                          playVictorySound();
                        }
                      }}
                      className={`w-full rounded-2xl px-5 py-4 bg-slate-950/25 transition-all flex items-center justify-between ${
                        settings.soundEnabled ? 'ring-2 ring-teal-300/40' : 'hover:ring-2 hover:ring-white/10'
                      }`}
                    >
                      <span className="text-slate-100">
                        {settings.soundEnabled ? 'Звук включен' : 'Звук выключен'}
                      </span>
                      {settings.soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-teal-200" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-slate-300/70" />
                      )}
                    </button>
                  </div>

                  <div>
                    <p className="text-sm text-slate-200/80 mb-3">Подсказки</p>
                    <button
                      type="button"
                      onClick={() => updateSettings({ showHelp: !settings.showHelp })}
                      className={`w-full rounded-2xl px-5 py-4 bg-slate-950/25 transition-all flex items-center justify-between ${
                        settings.showHelp ? 'ring-2 ring-teal-300/40' : 'hover:ring-2 hover:ring-white/10'
                      }`}
                    >
                      <span className="text-slate-100">Показывать “Как это работает”</span>
                      <span className="text-xs text-slate-300/70">
                        {settings.showHelp ? 'Вкл' : 'Выкл'}
                      </span>
                    </button>
                    <PanelHelp>
                      <p>Подсказки отображаются под основными панелями и помогают ориентироваться по шагам.</p>
                    </PanelHelp>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


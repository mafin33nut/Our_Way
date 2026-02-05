import { useEffect, useState } from 'react';
import { Settings, Volume2, VolumeX, Eye, EyeOff, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';
import { BACKGROUND_OPTIONS } from '../../types';
import { Link } from 'react-router-dom';

export function SettingsPage() {
  const { settings, updateSettings, playVictorySound } = useCustomization();
  const isDynamic = settings.background === 'dynamic';
  const [bgImageLoaded, setBgImageLoaded] = useState(false);
  const backgroundOption = BACKGROUND_OPTIONS.find((bg) => bg.id === settings.background);
  const backgroundUrl = backgroundOption?.url || '';
  const hasBackground =
    settings.background &&
    settings.background !== 'dynamic' &&
    backgroundUrl &&
    backgroundUrl.trim() !== '';

  useEffect(() => {
    if (hasBackground && backgroundUrl) {
      const img = new window.Image();
      img.onload = () => setBgImageLoaded(true);
      img.onerror = () => setBgImageLoaded(false);
      img.src = backgroundUrl;
    } else {
      setBgImageLoaded(false);
    }
  }, [hasBackground, backgroundUrl]);

  return (
    <div
      className={`min-h-screen relative ${isDynamic ? 'bg-transparent' : 'bg-slate-950'} ${
        isDynamic || hasBackground ? '' : 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950'
      }`}
    >
      {hasBackground && (
        <div
          key={`bg-${settings.background}-${backgroundUrl}`}
          className="fixed inset-0 z-0"
          style={{
            backgroundColor: 'rgb(2 6 23)',
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className={`absolute inset-0 ${bgImageLoaded ? 'bg-slate-900/30' : 'bg-slate-900/70'} backdrop-blur-sm`} />
        </div>
      )}
      <div className="relative z-10 min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-4xl">
          <div className="panel-base panel-purple">
            <div className="p-6 border-b border-purple-600/30">
              <div className="flex items-center justify-between">
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
              </div>
            </div>

            <div className="p-6 space-y-8">
              <div>
                <h2 className="mb-4 text-xl text-purple-200">Фоновое изображение</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {BACKGROUND_OPTIONS.filter((bg) => bg.id !== 'custom').map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => updateSettings({ background: bg.id })}
                      className={`relative aspect-video rounded-lg border-2 overflow-hidden transition-all ${
                        settings.background === bg.id
                          ? 'border-purple-500 ring-2 ring-purple-400/50 shadow-lg'
                          : 'border-purple-600/30 hover:border-purple-500/50'
                      }`}
                    >
                      {bg.url ? (
                        <img
                          src={bg.url}
                          alt={bg.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <ImageIcon className="w-8 h-8 text-purple-400/40" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-center bg-black/70 text-white">
                        {bg.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-xl text-purple-200">Звуковые эффекты</h2>
                <button
                  onClick={() => {
                    updateSettings({ soundEnabled: !settings.soundEnabled });
                    if (!settings.soundEnabled) {
                      playVictorySound();
                    }
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                    settings.soundEnabled
                      ? 'border-purple-500 bg-purple-900/40 ring-2 ring-purple-400/50'
                      : 'border-purple-600/30 bg-slate-800/50'
                  }`}
                >
                  <span className="text-purple-200">
                    {settings.soundEnabled ? 'Звук включен' : 'Звук выключен'}
                  </span>
                  {settings.soundEnabled ? (
                    <Volume2 className="text-purple-400" />
                  ) : (
                    <VolumeX className="text-purple-400/60" />
                  )}
                </button>
              </div>

              <div>
                <h2 className="mb-4 text-xl text-purple-200">Отображение панелей</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => updateSettings({ showHelp: !settings.showHelp })}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                      settings.showHelp
                        ? 'border-purple-500 bg-purple-900/40 ring-2 ring-purple-400/50'
                        : 'border-purple-600/30 bg-slate-800/50'
                    }`}
                  >
                    <span className="text-purple-200">Подсказки "Как это работает"</span>
                    {settings.showHelp ? (
                      <Eye className="text-purple-400" />
                    ) : (
                      <EyeOff className="text-purple-400/60" />
                    )}
                  </button>
                  <button
                    onClick={() => updateSettings({ showFriends: !settings.showFriends })}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                      settings.showFriends
                        ? 'border-purple-500 bg-purple-900/40 ring-2 ring-purple-400/50'
                        : 'border-purple-600/30 bg-slate-800/50'
                    }`}
                  >
                    <span className="text-purple-200">Панель друзей</span>
                    {settings.showFriends ? (
                      <Eye className="text-purple-400" />
                    ) : (
                      <EyeOff className="text-purple-400/60" />
                    )}
                  </button>

                  <button
                    onClick={() => updateSettings({ showActivities: !settings.showActivities })}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                      settings.showActivities
                        ? 'border-purple-500 bg-purple-900/40 ring-2 ring-purple-400/50'
                        : 'border-purple-600/30 bg-slate-800/50'
                    }`}
                  >
                    <span className="text-purple-200">Лента активности</span>
                    {settings.showActivities ? (
                      <Eye className="text-purple-400" />
                    ) : (
                      <EyeOff className="text-purple-400/60" />
                    )}
                  </button>

                  <button
                    onClick={() => updateSettings({ showClan: !settings.showClan })}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                      settings.showClan
                        ? 'border-purple-500 bg-purple-900/40 ring-2 ring-purple-400/50'
                        : 'border-purple-600/30 bg-slate-800/50'
                    }`}
                  >
                    <span className="text-purple-200">Информация о клане</span>
                    {settings.showClan ? (
                      <Eye className="text-purple-400" />
                    ) : (
                      <EyeOff className="text-purple-400/60" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

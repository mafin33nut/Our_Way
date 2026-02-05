import { useState } from 'react';
import { Settings, X, Volume2, VolumeX, Sun, Moon, Eye, EyeOff, Image } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';
import { BACKGROUND_OPTIONS } from '../../types';

/**
 * Local type guard for theme to avoid TypeScript complaining when
 * settings.theme has a narrower literal type from elsewhere.
 *
 * This narrows unknown/union-ish theme values to 'light' | 'dark'.
 */
function isTheme(value: unknown): value is 'light' | 'dark' {
  return value === 'light' || value === 'dark';
}

export function CustomizationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings, playVictorySound } = useCustomization();
  const currentBackground = BACKGROUND_OPTIONS.find(bg => bg.id === settings.background);

  // Helpers to determine theme safely (using guard)
  const isLight = isTheme(settings.theme) && settings.theme === 'light';
  const isDark = isTheme(settings.theme) && settings.theme === 'dark';

  return (
    <>
      {/* Settings Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl panel-base panel-purple ${isLight ? 'bg-white/95' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-300" />
                <h2 className="text-slate-100">Настройки интерфейса</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg transition-colors hover:bg-slate-700/40 text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Theme Toggle */}
              <div>
                <h3 className="mb-3 text-slate-100">Тема оформления</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`p-4 rounded-lg border transition-all ${
                      isLight
                        ? 'border-teal-300/60 bg-teal-400/10'
                        : 'border-slate-600/40 bg-slate-900/50 hover:border-slate-500/60'
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-slate-100" />
                    <p className="text-sm text-slate-100">Светлая тема</p>
                  </button>

                  <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`p-4 rounded-lg border transition-all ${
                      isDark
                        ? 'border-teal-300/60 bg-teal-400/10'
                        : 'border-slate-600/40 bg-slate-900/50 hover:border-slate-500/60'
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-teal-200" />
                    <p className="text-sm text-slate-100">Темная тема</p>
                  </button>
                </div>
              </div>

              {/* Background Selection */}
              <div>
                <h3 className="mb-3 text-slate-100">Фоновое изображение</h3>
                <div className="grid grid-cols-3 gap-3">
                  {BACKGROUND_OPTIONS.filter((bg) => bg.id !== 'custom').map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => updateSettings({ background: bg.id })}
                      className={`relative aspect-video rounded-lg border overflow-hidden transition-all ${
                        settings.background === bg.id
                          ? 'border-teal-300/60 ring-2 ring-teal-300/30'
                          : 'border-slate-600/40 hover:border-slate-500/60'
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
                          <Image className="w-8 h-8 text-teal-200/60" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-center bg-black/60 text-slate-100">
                        {bg.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Toggle */}
              <div>
                <h3 className="mb-3 text-slate-100">Звуковые эффекты</h3>
                <button
                  onClick={() => {
                    updateSettings({ soundEnabled: !settings.soundEnabled });
                    if (!settings.soundEnabled) {
                      playVictorySound();
                    }
                  }}
                  className={`w-full p-4 rounded-lg border transition-all flex items-center justify-between ${
                    settings.soundEnabled
                      ? 'border-teal-300/60 bg-teal-400/10'
                      : 'border-slate-600/40 bg-slate-900/50'
                  }`}
                >
                  <span className="text-slate-100">
                    {settings.soundEnabled ? 'Звук включен' : 'Звук выключен'}
                  </span>
                  {settings.soundEnabled ? (
                    <Volume2 className="text-teal-200" />
                  ) : (
                    <VolumeX className="text-teal-200/60" />
                  )}
                </button>
              </div>

              {/* Visibility Settings */}
              <div>
                <h3 className="mb-3 text-slate-100">Отображение панелей</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateSettings({ showHelp: !settings.showHelp })}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                      settings.showHelp
                        ? 'border-teal-300/60 bg-slate-800/50'
                        : 'border-slate-600/40 bg-slate-900/50'
                    }`}
                  >
                    <span className="text-slate-100">
                      Подсказки "Как это работает"
                    </span>
                    {settings.showHelp ? (
                      <Eye className="text-teal-200" />
                    ) : (
                      <EyeOff className="text-teal-200/60" />
                    )}
                  </button>
                  <button
                    onClick={() => updateSettings({ showFriends: !settings.showFriends })}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                      settings.showFriends
                        ? 'border-teal-300/60 bg-slate-800/50'
                        : 'border-slate-600/40 bg-slate-900/50'
                    }`}
                  >
                    <span className="text-slate-100">
                      Панель друзей
                    </span>
                    {settings.showFriends ? (
                      <Eye className="text-teal-200" />
                    ) : (
                      <EyeOff className="text-teal-200/60" />
                    )}
                  </button>

                  <button
                    onClick={() => updateSettings({ showActivities: !settings.showActivities })}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                      settings.showActivities
                        ? 'border-teal-300/60 bg-slate-800/50'
                        : 'border-slate-600/40 bg-slate-900/50'
                    }`}
                  >
                    <span className="text-slate-100">
                      Лента активности
                    </span>
                    {settings.showActivities ? (
                      <Eye className="text-teal-200" />
                    ) : (
                      <EyeOff className="text-teal-200/60" />
                    )}
                  </button>

                  <button
                    onClick={() => updateSettings({ showClan: !settings.showClan })}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                      settings.showClan
                        ? 'border-teal-300/60 bg-slate-800/50'
                        : 'border-slate-600/40 bg-slate-900/50'
                    }`}
                  >
                    <span className="text-slate-100">
                      Информация о клане
                    </span>
                    {settings.showClan ? (
                      <Eye className="text-teal-200" />
                    ) : (
                      <EyeOff className="text-teal-200/60" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`p-4 border-t ${isLight ? 'border-slate-200' : 'border-teal-400/30'}`}>
              <Button onClick={() => setIsOpen(false)} className="w-full">
                Применить настройки
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
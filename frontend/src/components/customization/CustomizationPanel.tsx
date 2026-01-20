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
          <div className={`w-full max-w-2xl rounded-lg shadow-2xl ${
            isLight
              ? 'bg-white border-2 border-amber-300'
              : 'bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-2 border-purple-600/50'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isLight ? 'border-amber-200' : 'border-purple-600/30'
            }`}>
              <div className="flex items-center gap-2">
                <Settings className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-purple-400'}`} />
                <h2 className={isLight ? 'text-amber-900' : 'text-purple-300'}>
                  Настройки интерфейса
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isLight
                    ? 'hover:bg-amber-100 text-amber-600'
                    : 'hover:bg-slate-700 text-purple-400'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Theme Toggle */}
              <div>
                <h3 className={`mb-3 ${isLight ? 'text-amber-800' : 'text-purple-200'}`}>
                  Тема оформления
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isLight
                        ? 'border-amber-500 bg-amber-50 shadow-lg'
                        : (isTheme(settings.theme) && settings.theme === 'light')
                          ? 'border-amber-200 bg-amber-50/50 hover:border-amber-400'
                          : 'border-purple-600/30 bg-slate-800/50 hover:border-purple-500/50'
                    }`}
                  >
                    <Sun className={`w-6 h-6 mx-auto mb-2 ${
                      isLight ? 'text-amber-600' : 'text-amber-400/60'
                    }`} />
                    <p className={`text-sm ${
                      isLight ? 'text-amber-900' : 'text-amber-200/60'
                    }`}>
                      Светлая тема
                    </p>
                  </button>

                  <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isDark
                        ? 'border-purple-500 bg-purple-900/40 shadow-lg'
                        : isLight
                        ? 'border-amber-200 bg-white hover:border-amber-400'
                        : 'border-purple-600/30 bg-slate-950/30 hover:border-purple-500/50'
                    }`}
                  >
                    <Moon className={`w-6 h-6 mx-auto mb-2 ${
                      isDark ? 'text-purple-300' : 'text-purple-400/60'
                    }`} />
                    <p className={`text-sm ${
                      isDark ? 'text-purple-200' : 'text-purple-200/60'
                    }`}>
                      Темная тема
                    </p>
                  </button>
                </div>
              </div>

              {/* Background Selection */}
              <div>
                <h3 className={`mb-3 ${isLight ? 'text-amber-800' : 'text-purple-200'}`}>
                  Фоновое изображение
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {BACKGROUND_OPTIONS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => updateSettings({ background: bg.id })}
                      className={`relative aspect-video rounded-lg border-2 overflow-hidden transition-all ${
                        settings.background === bg.id
                          ? (isLight
                              ? 'border-amber-500 ring-2 ring-amber-300'
                              : 'border-purple-500 ring-2 ring-purple-400/50')
                          : (isLight
                              ? 'border-amber-200 hover:border-amber-400'
                              : 'border-purple-600/30 hover:border-purple-500/50')
                      }`}
                    >
                      {bg.url ? (
                        <img
                          src={bg.url}
                          alt={bg.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          isLight ? 'bg-amber-50' : 'bg-slate-800'
                        }`}>
                          <Image className={`w-8 h-8 ${
                            isLight ? 'text-amber-400' : 'text-purple-400/40'
                          }`} />
                        </div>
                      )}
                      <div className={`absolute bottom-0 left-0 right-0 p-2 text-xs text-center ${
                        isLight
                          ? 'bg-white/90 text-amber-900'
                          : 'bg-black/60 text-white'
                      }`}>
                        {bg.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Toggle */}
              <div>
                <h3 className={`mb-3 ${isLight ? 'text-amber-800' : 'text-purple-200'}`}>
                  Звуковые эффекты
                </h3>
                <button
                  onClick={() => {
                    updateSettings({ soundEnabled: !settings.soundEnabled });
                    if (!settings.soundEnabled) {
                      playVictorySound();
                    }
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                    settings.soundEnabled
                      ? (isLight ? 'border-amber-500 bg-amber-50' : 'border-purple-500 bg-purple-900/40')
                      : (isLight ? 'border-amber-200 bg-white' : 'border-purple-600/30 bg-slate-950/30')
                  }`}
                >
                  <span className={isLight ? 'text-amber-900' : 'text-purple-200'}>
                    {settings.soundEnabled ? 'Звук включен' : 'Звук выключен'}
                  </span>
                  {settings.soundEnabled ? (
                    <Volume2 className={isLight ? 'text-amber-600' : 'text-purple-400'} />
                  ) : (
                    <VolumeX className={isLight ? 'text-amber-400' : 'text-purple-400/60'} />
                  )}
                </button>
              </div>

              {/* Visibility Settings */}
              <div>
                <h3 className={`mb-3 ${isLight ? 'text-amber-800' : 'text-purple-200'}`}>
                  Отображение панелей
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateSettings({ showFriends: !settings.showFriends })}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                      settings.showFriends
                        ? (isLight ? 'border-amber-300 bg-amber-50' : 'border-purple-600/50 bg-slate-800/50')
                        : (isLight ? 'border-amber-200 bg-white' : 'border-purple-600/30 bg-slate-950/30')
                    }`}
                  >
                    <span className={isLight ? 'text-amber-900' : 'text-purple-200'}>
                      Панель друзей
                    </span>
                    {settings.showFriends ? (
                      <Eye className={isLight ? 'text-amber-600' : 'text-purple-400'} />
                    ) : (
                      <EyeOff className={isLight ? 'text-amber-400' : 'text-purple-400/60'} />
                    )}
                  </button>

                  <button
                    onClick={() => updateSettings({ showActivities: !settings.showActivities })}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                      settings.showActivities
                        ? (isLight ? 'border-amber-300 bg-amber-50' : 'border-purple-600/50 bg-slate-800/50')
                        : (isLight ? 'border-amber-200 bg-white' : 'border-purple-600/30 bg-slate-950/30')
                    }`}
                  >
                    <span className={isLight ? 'text-amber-900' : 'text-purple-200'}>
                      Лента активности
                    </span>
                    {settings.showActivities ? (
                      <Eye className={isLight ? 'text-amber-600' : 'text-purple-400'} />
                    ) : (
                      <EyeOff className={isLight ? 'text-amber-400' : 'text-purple-400/60'} />
                    )}
                  </button>

                  <button
                    onClick={() => updateSettings({ showClan: !settings.showClan })}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                      settings.showClan
                        ? (isLight ? 'border-amber-300 bg-amber-50' : 'border-purple-600/50 bg-slate-800/50')
                        : (isLight ? 'border-amber-200 bg-white' : 'border-purple-600/30 bg-slate-950/30')
                    }`}
                  >
                    <span className={isLight ? 'text-amber-900' : 'text-purple-200'}>
                      Информация о клане
                    </span>
                    {settings.showClan ? (
                      <Eye className={isLight ? 'text-amber-600' : 'text-purple-400'} />
                    ) : (
                      <EyeOff className={isLight ? 'text-amber-400' : 'text-purple-400/60'} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`p-4 border-t ${isLight ? 'border-amber-200' : 'border-purple-600/30'}`}>
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
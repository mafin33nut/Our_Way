import { createContext, useState, useEffect, ReactNode } from 'react';
import { CustomizationSettings, BACKGROUND_OPTIONS } from '../types';
interface CustomizationContextType {
  settings: CustomizationSettings;
  updateSettings: (settings: Partial<CustomizationSettings>) => void;
  playVictorySound: () => void;
}
const defaultSettings: CustomizationSettings = {
  theme: 'light',
  background: BACKGROUND_OPTIONS[0].id,
  soundEnabled: true,
  showFriends: true,
  showActivities: true,
  showClan: true,
};
export const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);
interface CustomizationProviderProps {
  children: ReactNode;
}
export function CustomizationProvider({ children }: CustomizationProviderProps) {
  const [settings, setSettings] = useState<CustomizationSettings>(() => {
    const saved = localStorage.getItem('customization_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  useEffect(() => {
    localStorage.setItem('customization_settings', JSON.stringify(settings));
  }, [settings]);
  const updateSettings = (newSettings: Partial<CustomizationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };
  const playVictorySound = () => {
    if (settings.soundEnabled) {
      // Create victory sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Victory fanfare sequence
      const notes = [
        { freq: 523.25, time: 0, duration: 0.15 },    // C5
        { freq: 659.25, time: 0.15, duration: 0.15 },  // E5
        { freq: 783.99, time: 0.3, duration: 0.15 },   // G5
        { freq: 1046.50, time: 0.45, duration: 0.3 },  // C6
      ];
      notes.forEach(({ freq, time, duration }) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + duration);
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + duration);
      });
    }
  };
  return (
    <CustomizationContext.Provider value={{ settings, updateSettings, playVictorySound }}>
      {children}
    </CustomizationContext.Provider>
  );
}
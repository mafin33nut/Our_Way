import * as React from "react";
import { User as UserIcon, Trophy, Sparkles } from 'lucide-react';

interface CharacterData {
  id: number | string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalQuestsCompleted: number;
}

interface CharacterProfileProps {
  character: CharacterData;
  questsCompletedToday: number;
  onResetDay: () => void;
}

export function CharacterProfile({ character, questsCompletedToday, onResetDay }: CharacterProfileProps) {
  const xpPercentage = character.xpToNextLevel > 0 ? (character.xp / character.xpToNextLevel) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-amber-600/50 p-6 shadow-2xl backdrop-blur-sm">
      {/* Character Avatar */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center border-4 border-purple-400 shadow-lg">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 rounded-full w-10 h-10 flex items-center justify-center border-2 border-amber-300">
            {character.level}
          </div>
        </div>
      </div>

      {/* Character Name */}
      <div className="text-center mb-6">
        <h2 className="text-amber-300 mb-1">{character.name}</h2>
        <p className="text-amber-200/60">Авантюрист {character.level} уровня</p>
      </div>

      {/* XP Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-amber-200/80 mb-2">
          <span>Опыт</span>
          <span>{character.xp} / {character.xpToNextLevel} XP</span>
        </div>
        <div className="h-4 bg-slate-950/50 rounded-full overflow-hidden border border-amber-600/30">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500 ease-out shadow-lg shadow-purple-500/50"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between bg-amber-900/20 p-3 rounded-lg border border-amber-600/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-200 text-sm">Заданий сегодня</span>
          </div>
          <span className="text-amber-100">{questsCompletedToday}</span>
        </div>

        <div className="flex items-center justify-between bg-purple-900/20 p-3 rounded-lg border border-purple-600/30">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-purple-200 text-sm">Всего заданий</span>
          </div>
          <span className="text-purple-100">{character.totalQuestsCompleted}</span>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={onResetDay}
        className="w-full bg-slate-700/50 hover:bg-slate-700 text-amber-200 py-2 px-4 rounded-lg border border-slate-600 transition-colors text-sm"
      >
        Очистить выполненные
      </button>
    </div>
  );
}
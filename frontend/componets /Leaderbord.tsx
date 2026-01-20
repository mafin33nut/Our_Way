import * as React from "react";
import { Trophy, Medal, Award } from 'lucide-react';

interface Player {
  id: number | string;
  name: string;
  level: number;
  questsCompletedToday: number;
  isOnline?: boolean;
}

interface LeaderboardProps {
  friends: Player[];
  currentPlayer: Player;
}

export function Leaderboard({ friends, currentPlayer }: LeaderboardProps) {
  const allPlayers = [
    { ...currentPlayer, id: currentPlayer.id ?? 'player', isOnline: true },
    ...friends,
  ].sort((a, b) => b.questsCompletedToday - a.questsCompletedToday);

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 1:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'border-amber-500/50 bg-amber-900/20';
      case 1:
        return 'border-slate-400/50 bg-slate-800/20';
      case 2:
        return 'border-amber-700/50 bg-amber-900/10';
      default:
        return 'border-slate-600/30 bg-slate-800/10';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-amber-600/50 p-6 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-amber-400" />
        <h2 className="text-amber-300">Таблица лидеров</h2>
      </div>

      <div className="space-y-2">
        {allPlayers.slice(0, 10).map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${getMedalColor(index)} ${
              player.id === currentPlayer.id ? 'ring-2 ring-purple-500/50' : ''
            }`}
          >
            <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
              {getMedalIcon(index) || <span className="text-slate-400">{index + 1}</span>}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm truncate ${player.id === currentPlayer.id ? 'text-purple-200' : 'text-amber-100'}`}>
                  {player.name}
                  {player.id === currentPlayer.id && ' (Вы)'}
                </span>
              </div>
              <p className="text-xs text-amber-200/60">Уровень {player.level}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-amber-100">{player.questsCompletedToday}</p>
              <p className="text-xs text-amber-200/60">заданий</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import * as React from "react";
import { History, Sparkles, Flame, Skull } from 'lucide-react';

interface Quest {
  id: number | string;
  title: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  completedAt?: string;
  xpReward?: number;
}

interface QuestHistoryProps {
  completedQuests: Quest[];
}

export function QuestHistory({ completedQuests }: QuestHistoryProps) {
  const stats = {
    easy: completedQuests.filter(q => q.difficulty === 'easy').length,
    medium: completedQuests.filter(q => q.difficulty === 'medium').length,
    hard: completedQuests.filter(q => q.difficulty === 'hard').length,
  };

  const totalXP = completedQuests.reduce((sum, q) => sum + (q.xpReward ?? 0), 0);

  const recentQuests = [...completedQuests]
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return <Sparkles className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <Flame className="w-4 h-4 text-yellow-400" />;
      case 'hard':
        return <Skull className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours === 0) {
      if (minutes === 0) return 'только что';
      return `${minutes} мин назад`;
    }
    if (hours < 24) return `${hours} ч назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-emerald-600/50 p-6 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-emerald-400" />
        <h2 className="text-emerald-300">История заданий</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 text-center">
          <Sparkles className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-green-100 text-xl">{stats.easy}</p>
          <p className="text-green-200/60 text-xs">Легких</p>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 text-center">
          <Flame className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-yellow-100 text-xl">{stats.medium}</p>
          <p className="text-yellow-200/60 text-xs">Средних</p>
        </div>
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3 text-center">
          <Skull className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-red-100 text-xl">{stats.hard}</p>
          <p className="text-red-200/60 text-xs">Сложных</p>
        </div>
      </div>

      <div className="bg-emerald-900/20 border border-emerald-600/30 rounded-lg p-3 mb-4 text-center">
        <p className="text-emerald-200/60 text-xs mb-1">Всего заработано</p>
        <p className="text-emerald-100 text-2xl">{totalXP} XP</p>
      </div>

      {recentQuests.length > 0 ? (
        <div>
          <h3 className="text-emerald-300 text-sm mb-3">Недавно выполнено</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentQuests.map((quest) => (
              <div key={quest.id} className="bg-slate-950/40 border border-emerald-600/20 rounded-lg p-2 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  {getDifficultyIcon(quest.difficulty)}
                  <span className="text-emerald-100 truncate flex-1">{quest.title}</span>
                </div>
                {quest.completedAt && <p className="text-emerald-200/40 text-xs">{formatTime(quest.completedAt)}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <History className="w-12 h-12 text-emerald-400/20 mx-auto mb-2" />
          <p className="text-emerald-200/40 text-sm">Пока нет завершенных заданий</p>
        </div>
      )}
    </div>
  );
}
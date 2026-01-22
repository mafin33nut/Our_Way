import * as React from "react";
import { CheckCircle2, Circle, Trash2, Sparkles, Flame, Skull } from 'lucide-react';

interface Quest {
  id: number | string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  completed?: boolean;
}

interface QuestListProps {
  quests: Quest[];
  onCompleteQuest: (id: number | string) => void;
  onDeleteQuest: (id: number | string) => void;
}

const difficultyConfig = {
  easy: {
    icon: Sparkles,
    color: 'text-green-400',
    bg: 'bg-green-900/20',
    border: 'border-green-600/40',
    label: 'Легкое задание',
  },
  medium: {
    icon: Flame,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-600/40',
    label: 'Среднее задание',
  },
  hard: {
    icon: Skull,
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-600/40',
    label: 'Сложное задание',
  },
};

export function QuestList({ quests, onCompleteQuest, onDeleteQuest }: QuestListProps) {
  const activeQuests = quests.filter(q => !q.completed);
  const completedQuests = quests.filter(q => q.completed);

  const renderQuest = (quest: Quest) => {
    const config = difficultyConfig[quest.difficulty];
    const Icon = config.icon;

    return (
      <div
        key={quest.id}
        className={`${config.bg} ${config.border} border-2 rounded-lg p-4 transition-all hover:scale-[1.01] ${
          quest.completed ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={() => !quest.completed && onCompleteQuest(quest.id)}
            disabled={quest.completed}
            className="mt-1 flex-shrink-0 transition-transform hover:scale-110 disabled:cursor-not-allowed"
          >
            {quest.completed ? (
              <CheckCircle2 className="w-6 h-6 text-amber-400" />
            ) : (
              <Circle className="w-6 h-6 text-amber-400/40 hover:text-amber-400" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`text-amber-100 ${quest.completed ? 'line-through' : ''}`}>
                {quest.title}
              </h3>
              <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
            </div>
            
            {quest.description && (
              <p className="text-amber-200/60 text-sm mb-3">{quest.description}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs ${config.color}`}>{config.label}</span>
                <span className="text-amber-400 text-sm">+{quest.xpReward} XP</span>
              </div>
              
              <button
                onClick={() => onDeleteQuest(quest.id)}
                className="text-red-400/60 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {activeQuests.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg border-2 border-amber-600/30 p-6 backdrop-blur-sm">
          <h2 className="text-amber-300 mb-4 flex items-center gap-2">
            <Circle className="w-5 h-5" />
            Активные задания ({activeQuests.length})
          </h2>
          <div className="space-y-3">
            {activeQuests.map(renderQuest)}
          </div>
        </div>
      )}

      {completedQuests.length > 0 && (
        <div className="bg-slate-800/30 rounded-lg border-2 border-emerald-600/20 p-6 backdrop-blur-sm">
          <h2 className="text-emerald-300 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Выполнено сегодня ({completedQuests.length})
          </h2>
          <div className="space-y-3">
            {completedQuests.map(renderQuest)}
          </div>
        </div>
      )}

      {quests.length === 0 && (
        <div className="bg-slate-800/30 rounded-lg border-2 border-amber-600/20 p-12 text-center backdrop-blur-sm">
          <Sparkles className="w-12 h-12 text-amber-400/40 mx-auto mb-4" />
          <p className="text-amber-200/60">Пока нет заданий. Создайте своё первое задание выше!</p>
        </div>
      )}
    </div>
  );
}
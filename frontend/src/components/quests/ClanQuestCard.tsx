import { ClanQuest } from '../../types';
import { Users, Crown, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';
interface ClanQuestCardProps {
  quest: ClanQuest;
  onContribute: (id: number) => void;
  onDelete: (id: number) => void;
  currentUsername: string;
}
export function ClanQuestCard({ quest, onContribute, onDelete, currentUsername }: ClanQuestCardProps) {
  const safeParticipants = quest.participants ?? [];
  const [isContributing, setIsContributing] = useState(false);
  const participantCount =
    quest.participant_count ??
    safeParticipants.length;
  const maxParticipants = quest.max_participants ?? quest.required_progress ?? 1;
  const progressPercentage = maxParticipants > 0 ? (participantCount / maxParticipants) * 100 : 0;
  const difficultyLabel =
    quest.difficulty === 'hard' ? 'Сложный' : quest.difficulty === 'medium' ? 'Средний' : 'Легкий';
  const hasJoined = safeParticipants.some((participant) => participant.username === currentUsername);
  const isFull = participantCount >= maxParticipants;
  const handleContribute = async () => {
    setIsContributing(true);
    await onContribute(quest.id);
    setIsContributing(false);
  };
  const getDaysLeft = () => {
    if (!quest.expires_at) {
      return null;
    }
    const now = new Date();
    const expiresAt = new Date(quest.expires_at);
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  return (
    <div
      className={`bg-teal-950/40 rounded-xl border p-6 transition-all ${
        quest.completed
          ? 'border-teal-600/40 opacity-80'
          : 'border-teal-300/60 shadow-lg shadow-teal-400/10 ring-1 ring-teal-300/60 ring-offset-2 ring-offset-teal-950'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-teal-300" />
            <span className="text-xs px-2 py-1 rounded bg-teal-800/50 text-teal-100">
              {difficultyLabel}
            </span>
          </div>
          <h3 className={`text-lg mb-2 ${quest.completed ? 'text-slate-300 line-through' : 'text-slate-100'}`}>
            {quest.title}
          </h3>
          <p className="text-slate-300/70 text-sm">{quest.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl text-teal-200">
            +{quest.xp_reward}
          </div>
          <div className="text-xs text-slate-300/60">XP награда</div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-300/80 mb-2">
          <span>Участники</span>
          <span>{participantCount} / {maxParticipants}</span>
        </div>
        <div className="w-full h-4 bg-teal-950/50 rounded-full overflow-hidden border border-teal-600/40">
          <div
            className="h-full transition-all duration-500 bg-gradient-to-r from-teal-400 to-cyan-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-teal-300" />
          <span className="text-sm text-slate-300/80">Участники ({safeParticipants.length})</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {safeParticipants.slice(0, 6).map((participant) => (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-2 rounded bg-teal-900/40 border ${
                participant.username === currentUsername
                  ? 'border-teal-300/60'
                  : 'border-teal-700/50'
              }`}
            >
              <div>
                <p className="text-slate-200 text-sm">{participant.username}</p>
                <p className="text-slate-300/60 text-xs">Уровень {participant.level}</p>
              </div>
            </div>
          ))}
        </div>
        {safeParticipants.length > 6 && (
          <p className="text-slate-300/60 text-xs text-center mt-2">
            +{safeParticipants.length - 6} ещё участников
          </p>
        )}
      </div>
      {getDaysLeft() !== null && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-teal-900/40 rounded border border-teal-600/40">
          <Clock className="w-4 h-4 text-teal-300" />
          <span className="text-sm text-slate-300/80">
            Осталось дней: <span className="text-teal-200">{getDaysLeft()}</span>
          </span>
        </div>
      )}
      {!quest.completed && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleContribute}
            disabled={isContributing || hasJoined || isFull}
            size="md"
            className="flex-1 px-5 py-3 rounded-xl text-base"
          >
            {isContributing ? 'Отправка...' : hasJoined ? 'Вы участвуете' : isFull ? 'Набор завершён' : 'Участвовать'}
          </Button>
        </div>
      )}
      <div className="mt-3">
        <Button variant="ghost" size="sm" onClick={() => onDelete(quest.id)}>
          Удалить
        </Button>
      </div>
    </div>
  );
}
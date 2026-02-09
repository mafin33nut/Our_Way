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
      className={`rounded-xl border p-6 transition-all bg-white border-slate-200 ${
        quest.completed ? 'opacity-80' : 'shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-slate-700" />
            <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
              {difficultyLabel}
            </span>
          </div>
          <h3 className={`text-lg mb-2 ${quest.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
            {quest.title}
          </h3>
          <p className="text-slate-600 text-sm">
            {quest.description}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl text-slate-900">+{quest.xp_reward}</div>
          <div className="text-xs text-slate-500">XP награда</div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2 text-slate-600">
          <span>Участники</span>
          <span>{participantCount} / {maxParticipants}</span>
        </div>
        <div className="w-full h-4 rounded-full overflow-hidden border bg-slate-100 border-slate-200">
          <div
            className="h-full transition-all duration-500 bg-black"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-slate-700" />
          <span className="text-sm text-slate-600">
            Участники ({safeParticipants.length})
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {safeParticipants.slice(0, 6).map((participant) => (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-2 rounded border ${
                participant.username === currentUsername
                  ? 'bg-slate-50 border-black'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <p className="text-sm text-slate-900">{participant.username}</p>
                <p className="text-xs text-slate-500">Уровень {participant.level}</p>
              </div>
            </div>
          ))}
        </div>
        {safeParticipants.length > 6 && (
          <p className="text-xs text-center mt-2 text-slate-500">
            +{safeParticipants.length - 6} ещё участников
          </p>
        )}
      </div>
      {getDaysLeft() !== null && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded border bg-slate-50 border-slate-200">
          <Clock className="w-4 h-4 text-slate-700" />
          <span className="text-sm text-slate-600">
            Осталось дней: <span className="text-slate-900">{getDaysLeft()}</span>
          </span>
        </div>
      )}
      {!quest.completed && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleContribute}
            disabled={isContributing || hasJoined || isFull}
            size="md"
            className="flex-1 px-5 py-3 rounded-xl text-base bg-black text-white hover:bg-slate-900 border border-black"
          >
            {isContributing ? 'Отправка...' : hasJoined ? 'Вы участвуете' : isFull ? 'Набор завершён' : 'Участвовать'}
          </Button>
        </div>
      )}
      <div className="mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(quest.id)}
          className="bg-black text-white hover:bg-slate-900 border border-black px-4 py-2 rounded-xl"
        >
          Удалить
        </Button>
      </div>
    </div>
  );
}
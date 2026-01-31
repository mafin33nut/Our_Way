import { ClanQuest } from '../../types';
import { Users, Crown, Clock, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';
interface ClanQuestCardProps {
  quest: ClanQuest;
  onContribute: (id: number) => void;
  onDelete: (id: number) => void;
  currentUsername: string;
}
export function ClanQuestCard({ quest, onContribute, onDelete, currentUsername }: ClanQuestCardProps) {
  const [isContributing, setIsContributing] = useState(false);
  const participantCount =
    quest.participant_count ??
    quest.participants.filter((participant) => participant.contribution > 0).length;
  const maxParticipants = quest.max_participants ?? quest.required_progress;
  const progressPercentage = (quest.total_progress / quest.required_progress) * 100;
  const isEpic = quest.difficulty === 'epic';
  const userParticipation = quest.participants.find(p => p.username === currentUsername);
  const hasJoined = (userParticipation?.contribution || 0) > 0;
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
      className={`bg-slate-950/40 rounded-lg border-2 p-6 transition-all ${
        quest.completed
          ? 'border-purple-600/30 opacity-75'
          : 'border-purple-500/50 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/60 ring-offset-2 ring-offset-slate-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-purple-400" />
            <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-300">
              {isEpic ? 'Эпическое' : 'Легендарное'}
            </span>
          </div>
          <h3 className={`text-lg mb-2 ${quest.completed ? 'text-purple-200 line-through' : 'text-purple-100'}`}>
            {quest.title}
          </h3>
          <p className="text-purple-200/60 text-sm">{quest.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl text-purple-300">
            +{quest.xp_reward}
          </div>
          <div className="text-xs text-purple-200/40">XP награда</div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-purple-200/80 mb-2">
          <span>Участники</span>
          <span>{participantCount} / {maxParticipants}</span>
        </div>
        <div className="w-full h-4 bg-slate-950/50 rounded-full overflow-hidden border border-purple-600/30">
          <div
            className="h-full transition-all duration-500 bg-gradient-to-r from-purple-600 to-purple-400"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-200/80">Участники ({quest.participants.length})</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quest.participants.slice(0, 6).map((participant) => (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-2 rounded bg-slate-800/50 border ${
                participant.username === currentUsername
                  ? 'border-purple-500/50'
                  : 'border-slate-700/50'
              }`}
            >
              <div>
                <p className="text-purple-200 text-sm">{participant.username}</p>
                <p className="text-purple-200/40 text-xs">Уровень {participant.level}</p>
              </div>
              <div className="text-right">
                <div className="text-purple-300 text-sm">+{participant.contribution}</div>
                <TrendingUp className="w-3 h-3 text-purple-400/60 ml-auto" />
              </div>
            </div>
          ))}
        </div>
        {quest.participants.length > 6 && (
          <p className="text-purple-200/40 text-xs text-center mt-2">
            +{quest.participants.length - 6} ещё участников
          </p>
        )}
      </div>
      {getDaysLeft() !== null && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-slate-800/50 rounded border border-purple-600/20">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-200/80">
            Осталось дней: <span className="text-purple-300">{getDaysLeft()}</span>
          </span>
        </div>
      )}
      {!quest.completed && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleContribute}
            disabled={isContributing || hasJoined}
            className="flex-1"
          >
            {isContributing ? 'Отправка...' : hasJoined ? 'Вы участвуете' : 'Участвовать'}
          </Button>
        </div>
      )}
      <div className="mt-3">
        <Button variant="ghost" size="sm" onClick={() => onDelete(quest.id)}>
          Удалить
        </Button>
      </div>
      {userParticipation && (
        <div className="mt-3 p-2 bg-purple-900/20 rounded border border-purple-600/30">
          <p className="text-purple-200 text-sm">
            Ваш вклад: <span className="text-purple-300">+{userParticipation.contribution}</span>
          </p>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Crown, Users, Shield, TrendingUp, X, User as UserIcon } from 'lucide-react';
import { Clan, ClanQuest } from '../../types';
import { socialAPI } from '../../api/social';
import { ClanQuestList } from '../quests/ClanQuestList';
import { useAuth } from '../../hooks/useAuth';
import { resolveMediaUrl } from '../../utils/media';

interface ClanPanelProps {
  clan: Clan;
  clanQuests: ClanQuest[];
  onContribute: (id: number, contribution: number) => void;
  onClanUpdated: () => void;
}

export function ClanPanel({ clan, clanQuests, onContribute, onClanUpdated }: ClanPanelProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [clanDetails, setClanDetails] = useState<Clan | null>(clan);

  useEffect(() => {
    // Refresh clan details when panel is expanded
    if (isExpanded) {
      loadClanDetails();
    }
  }, [isExpanded]);

  const loadClanDetails = async () => {
    try {
      const updatedClan = await socialAPI.getClan();
      if (updatedClan) {
        setClanDetails(updatedClan);
      }
    } catch (error) {
      console.error('Failed to load clan details:', error);
    }
  };

  const currentClan = clanDetails || clan;
  const sortedMembers = [...(currentClan.members || [])].sort(
    (a, b) => (b.level ?? 0) - (a.level ?? 0) || a.username.localeCompare(b.username)
  );

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-purple-500/50 p-6 shadow-2xl backdrop-blur-sm ring-2 ring-yellow-500/60 ring-offset-2 ring-offset-slate-900">
      {/* Header - Always Visible */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-400" />
          <h2 className="text-purple-300 text-xl">{currentClan.name}</h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 border border-purple-600/50 transition-colors"
          aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
        >
          {isExpanded ? (
            <X className="w-4 h-4 text-purple-300" />
          ) : (
            <Shield className="w-4 h-4 text-purple-300" />
          )}
        </button>
      </div>

      {/* Quick Stats - Always Visible */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-950/40 rounded-lg p-3 border border-purple-600/20">
          <div className="text-xs text-purple-200/60 mb-1">Уровень</div>
          <div className="text-lg text-purple-300 font-semibold">{currentClan.level || 1}</div>
        </div>
        <div className="bg-slate-950/40 rounded-lg p-3 border border-purple-600/20">
          <div className="text-xs text-purple-200/60 mb-1">Участники</div>
          <div className="text-lg text-purple-300 font-semibold">{currentClan.members?.length || 0}</div>
        </div>
        <div className="bg-slate-950/40 rounded-lg p-3 border border-purple-600/20">
          <div className="text-xs text-purple-200/60 mb-1">Опыт</div>
          <div className="text-lg text-purple-300 font-semibold">{(currentClan.total_xp || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-6 mt-6 pt-6 border-t border-purple-600/30">
          {/* Clan Members Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-purple-300">Участники клана</h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedMembers.length > 0 ? (
                sortedMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg border bg-slate-950/40 ${
                      member.username === user?.username
                        ? 'border-purple-500/50 bg-purple-900/20'
                        : 'border-purple-600/20 hover:border-purple-500/50'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-purple-200/60 w-5 text-right">
                        {index + 1}
                      </span>
                      {resolveMediaUrl(member.avatar) ? (
                        <img
                          src={resolveMediaUrl(member.avatar) as string}
                          alt={member.username}
                          className="w-10 h-10 rounded-full object-cover border border-purple-500/60"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800/70 border border-purple-500/60 flex items-center justify-center text-purple-200">
                          <UserIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="text-purple-200 font-medium">
                          {member.username}
                          {member.username === user?.username && (
                            <span className="ml-2 text-xs text-purple-400">(Вы)</span>
                          )}
                        </p>
                        <p className="text-purple-200/60 text-xs">Уровень {member.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400/60" />
                      <span className="text-purple-300 text-sm font-medium">{member.contribution || 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-purple-200/60">
                  <p className="text-sm">Нет участников</p>
                </div>
              )}
            </div>
          </div>

          {/* Clan Quests Section */}
          {clanQuests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-purple-400" />
                <h3 className="text-purple-300">Клановые задания</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <ClanQuestList
                  quests={clanQuests}
                  onContribute={onContribute}
                  currentUsername={user?.username || ''}
                />
              </div>
            </div>
          )}

          {clanQuests.length === 0 && (
            <div className="text-center py-4 text-purple-200/60">
              <p className="text-sm">Пока нет клановых заданий</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

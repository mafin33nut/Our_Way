import * as React from "react";
import { Shield, TrendingUp, Users, Crown } from 'lucide-react';

interface ClanMember {
  id: number | string;
  name: string;
  level: number;
  contribution: number;
}

interface Clan {
  id: number | string;
  name: string;
  level: number;
  totalXP: number;
  members: ClanMember[];
}

interface ClanPanelProps {
  clan: Clan | null;
}

export function ClanPanel({ clan }: ClanPanelProps) {
  if (!clan) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-blue-600/50 p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-400" />
          <h2 className="text-blue-300">Клан</h2>
        </div>
        <p className="text-blue-200/60 text-sm mb-4">Вы еще не в клане</p>
        <button className="w-full bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 py-2 px-4 rounded-lg border border-blue-600/30 hover:border-blue-500/50 transition-all">
          Вступить в клан
        </button>
      </div>
    );
  }

  const sortedMembers = [...clan.members].sort((a, b) => b.contribution - a.contribution);
  const topContributor = sortedMembers[0];

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-blue-600/50 p-6 shadow-2xl backdrop-blur-sm">
      {/* Clan Header */}
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-400" />
        <h2 className="text-blue-300">{clan.name}</h2>
      </div>

      {/* Clan Level */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-200/80 text-sm">Уровень клана</span>
          <span className="text-blue-100 text-xl">{clan.level}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-blue-200/60 text-xs">Всего {clan.totalXP.toLocaleString()} опыта</span>
        </div>
      </div>

      {/* Members */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-blue-400" />
          <h3 className="text-blue-300 text-sm">Участники ({clan.members.length})</h3>
        </div>
        
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sortedMembers.map((member) => (
            <div
              key={member.id}
              className="bg-slate-950/40 border border-blue-600/20 rounded-lg p-3 hover:border-blue-600/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {topContributor && member.id === topContributor.id && (
                    <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  )}
                  <span className="text-blue-100 text-sm truncate">
                    {member.name}
                    {member.id === 'player' && ' (Вы)'}
                  </span>
                </div>
                <span className="text-blue-300 text-xs flex-shrink-0">Ур {member.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200/60 text-xs">Вклад</span>
                <span className="text-blue-200 text-xs">{member.contribution.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clan Actions */}
      <div className="pt-4 border-t border-blue-600/20">
        <button className="w-full bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 py-2 px-4 rounded-lg border border-blue-600/30 hover:border-blue-500/50 transition-all text-sm">
          Чат клана
        </button>
      </div>
    </div>
  );
}
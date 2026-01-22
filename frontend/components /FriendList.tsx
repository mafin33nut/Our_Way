import * as React from "react";
import { Users, Trophy, Circle } from 'lucide-react';

interface Friend {
  id: number | string;
  name: string;
  level: number;
  questsCompletedToday: number;
  isOnline: boolean;
}

interface FriendsListProps {
  friends: Friend[];
}

export function FriendsList({ friends }: FriendsListProps) {
  const sortedFriends = [...friends].sort((a, b) => b.questsCompletedToday - a.questsCompletedToday);

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-emerald-600/50 p-6 shadow-2xl backdrop-blur-sm h-fit sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-emerald-400" />
        <h2 className="text-emerald-300">Друзья</h2>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {sortedFriends.map((friend, index) => (
          <div
            key={friend.id}
            className="bg-slate-950/40 border border-emerald-600/20 rounded-lg p-4 hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-emerald-100 text-sm truncate">{friend.name}</h3>
                  <Circle 
                    className={`w-2 h-2 flex-shrink-0 ${
                      friend.isOnline ? 'text-green-400 fill-green-400' : 'text-slate-600 fill-slate-600'
                    }`} 
                  />
                </div>
                <p className="text-emerald-200/60 text-xs">Уровень {friend.level}</p>
              </div>
              
              {index === 0 && sortedFriends[0].questsCompletedToday > 0 && (
                <div className="text-amber-400" title="Лучший результат сегодня">
                  <Trophy className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-emerald-200/60 text-xs">Заданий сегодня</span>
              <span className="text-emerald-300 text-sm">{friend.questsCompletedToday}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-emerald-600/20">
        <button className="w-full bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-300 py-2 px-4 rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-all text-sm">
          Добавить друга
        </button>
      </div>
    </div>
  );
}
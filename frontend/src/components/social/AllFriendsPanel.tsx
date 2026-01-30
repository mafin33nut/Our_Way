import { Friend } from '../../types';
import { Users } from 'lucide-react';

interface AllFriendsPanelProps {
  friends: Friend[];
}

export function AllFriendsPanel({ friends }: AllFriendsPanelProps) {
  return (
    <div className="panel-base panel-purple p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-purple-400" />
        <h2 className="text-purple-300">Все друзья</h2>
      </div>
      {friends.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-purple-600/20 hover:border-purple-500/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-purple-200 text-sm truncate">{friend.username}</p>
                <p className="text-purple-200/40 text-xs">Уровень {friend.level}</p>
              </div>
              <span className={`text-xs ${friend.is_online ? 'text-green-400' : 'text-purple-200/50'}`}>
                {friend.is_online ? 'Онлайн' : 'Оффлайн'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-purple-200/40 text-sm">Пока нет друзей</p>
        </div>
      )}
    </div>
  );
}

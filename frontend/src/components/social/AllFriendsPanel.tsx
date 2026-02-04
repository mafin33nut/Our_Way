import { useState } from 'react';
import { Friend } from '../../types';
import { Users, User as UserIcon } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';
import { Button } from '../ui/Button';
import { FriendProfileModal } from './FriendProfileModal';

interface AllFriendsPanelProps {
  friends: Friend[];
}

export function AllFriendsPanel({ friends }: AllFriendsPanelProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
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
              <div className="flex items-center gap-3 min-w-0">
                {resolveMediaUrl(friend.avatar) ? (
                  <img
                    src={resolveMediaUrl(friend.avatar) as string}
                    alt={friend.username}
                    className="w-8 h-8 rounded-full object-cover border border-purple-500/60"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800/70 border border-purple-500/60 flex items-center justify-center text-purple-200">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-purple-200 text-sm truncate">{friend.username}</p>
                  <p className="text-purple-200/40 text-xs">Уровень {friend.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${friend.is_online ? 'text-green-400' : 'text-purple-200/50'}`}>
                  {friend.is_online ? 'Онлайн' : 'Оффлайн'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedFriendId(friend.id)}
                >
                  Смотреть профиль
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-purple-200/40 text-sm">Пока нет друзей</p>
        </div>
      )}
      <FriendProfileModal
        friendId={selectedFriendId}
        onClose={() => setSelectedFriendId(null)}
      />
    </div>
  );
}

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
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-8">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-slate-800" />
        <h2 className="text-slate-900">Все друзья</h2>
      </div>
      {friends.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:border-slate-300"
            >
              <div className="flex items-center gap-3 min-w-0">
                {resolveMediaUrl(friend.avatar) ? (
                  <img
                    src={resolveMediaUrl(friend.avatar) as string}
                    alt={friend.username}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full border flex items-center justify-center bg-slate-100 border-slate-200 text-slate-600"
                  >
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm truncate text-slate-900">{friend.username}</p>
                  <p className="text-xs text-slate-600">Уровень {friend.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs ${
                    friend.is_online
                      ? 'text-slate-900'
                      : 'text-slate-500'
                  }`}
                >
                  {friend.is_online ? 'Онлайн' : 'Оффлайн'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedFriendId(friend.id)}
                  className="text-slate-700 hover:text-slate-900"
                >
                  Смотреть профиль
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-slate-600">Пока нет друзей</p>
        </div>
      )}
      <FriendProfileModal
        friendId={selectedFriendId}
        onClose={() => setSelectedFriendId(null)}
      />
    </div>
  );
}

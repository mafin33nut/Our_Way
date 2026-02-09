import { useState } from 'react';
import { Friend } from '../../types';
import { Users, User as UserIcon } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';
import { Button } from '../ui/Button';
import { FriendProfileModal } from './FriendProfileModal';

interface AllFriendsPanelProps {
  friends: Friend[];
  isLight?: boolean;
}

export function AllFriendsPanel({ friends, isLight = false }: AllFriendsPanelProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  return (
    <div
      className={
        isLight
          ? 'rounded-2xl bg-white border border-slate-200 shadow-xl p-6'
          : 'panel-base panel-purple p-6'
      }
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className={`w-5 h-5 ${isLight ? 'text-violet-600' : 'text-purple-400'}`} />
        <h2 className={isLight ? 'text-slate-900' : 'text-purple-300'}>Все друзья</h2>
      </div>
      {friends.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-slate-950/40 border-purple-600/20 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {resolveMediaUrl(friend.avatar) ? (
                  <img
                    src={resolveMediaUrl(friend.avatar) as string}
                    alt={friend.username}
                    className={`w-8 h-8 rounded-full object-cover border ${
                      isLight ? 'border-slate-300' : 'border-purple-500/60'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-600'
                        : 'bg-slate-800/70 border-purple-500/60 text-purple-200'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className={`text-sm truncate ${isLight ? 'text-slate-900' : 'text-purple-200'}`}>
                    {friend.username}
                  </p>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-purple-200/40'}`}>
                    Уровень {friend.level}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs ${
                    friend.is_online
                      ? 'text-green-600'
                      : isLight
                        ? 'text-slate-500'
                        : 'text-purple-200/50'
                  }`}
                >
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
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-purple-200/40'}`}>Пока нет друзей</p>
        </div>
      )}
      <FriendProfileModal
        friendId={selectedFriendId}
        onClose={() => setSelectedFriendId(null)}
      />
    </div>
  );
}

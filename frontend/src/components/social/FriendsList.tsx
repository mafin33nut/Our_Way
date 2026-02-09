import { useState } from 'react';
import { Friend } from '../../types';
import { Users, Circle, User as UserIcon } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';
import { Button } from '../ui/Button';
import { FriendProfileModal } from './FriendProfileModal';
interface FriendsListProps {
  friends: Friend[];
}
export function FriendsList({ friends }: FriendsListProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const onlineFriends = friends.filter(f => f.is_online);
  const topFriends = [...friends].sort((a, b) => b.quests_completed_today - a.quests_completed_today).slice(0, 5);
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-slate-800" />
        <h2 className="text-slate-900">Друзья</h2>
      </div>
      <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-slate-700 text-sm">
          Онлайн: <span className="text-slate-900">{onlineFriends.length}</span> из {friends.length}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-slate-600 text-sm mb-3">Активные сегодня:</p>
        {topFriends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Circle
                className={`w-2 h-2 ${
                  friend.is_online ? 'fill-black text-black' : 'fill-slate-300 text-slate-300'
                }`}
              />
              {resolveMediaUrl(friend.avatar) ? (
                <img
                  src={resolveMediaUrl(friend.avatar) as string}
                  alt={friend.username}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <div>
                <p className="text-slate-900 text-sm">{friend.username}</p>
                <p className="text-slate-500 text-xs">Уровень {friend.level}</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div>
                <p className="text-slate-900 text-sm">{friend.quests_completed_today}</p>
                <p className="text-slate-500 text-xs">квестов</p>
              </div>
              <Button
                size="sm"
                onClick={() => setSelectedFriendId(friend.id)}
                className="px-4 py-2 rounded-xl text-sm bg-black text-white hover:bg-slate-900 border border-black"
              >
                Смотреть профиль
              </Button>
            </div>
          </div>
        ))}
      </div>
      {friends.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-600 text-sm">Пока нет друзей</p>
        </div>
      )}
      <FriendProfileModal
        friendId={selectedFriendId}
        onClose={() => setSelectedFriendId(null)}
      />
    </div>
  );
}
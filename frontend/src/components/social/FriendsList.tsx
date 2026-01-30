import { Friend } from '../../types';
import { Users, Circle, User as UserIcon } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';
interface FriendsListProps {
  friends: Friend[];
}
export function FriendsList({ friends }: FriendsListProps) {
  const onlineFriends = friends.filter(f => f.is_online);
  const topFriends = [...friends].sort((a, b) => b.quests_completed_today - a.quests_completed_today).slice(0, 5);
  return (
    <div className="panel-base panel-rose p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-purple-400" />
        <h2 className="text-purple-300">Друзья</h2>
      </div>
      <div className="mb-4 p-3 bg-purple-900/20 rounded-lg border border-purple-600/30">
        <p className="text-purple-200/80 text-sm">
          Онлайн: <span className="text-purple-300">{onlineFriends.length}</span> из {friends.length}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-purple-200/60 text-sm mb-3">Активные сегодня:</p>
        {topFriends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-purple-600/20 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Circle
                className={`w-2 h-2 ${
                  friend.is_online ? 'fill-green-400 text-green-400' : 'fill-gray-500 text-gray-500'
                }`}
              />
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
              <div>
                <p className="text-purple-200 text-sm">{friend.username}</p>
                <p className="text-purple-200/40 text-xs">Уровень {friend.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-purple-300 text-sm">{friend.quests_completed_today}</p>
              <p className="text-purple-200/40 text-xs">заданий</p>
            </div>
          </div>
        ))}
      </div>
      {friends.length === 0 && (
        <div className="text-center py-8">
          <p className="text-purple-200/40 text-sm">Пока нет друзей</p>
        </div>
      )}
    </div>
  );
}
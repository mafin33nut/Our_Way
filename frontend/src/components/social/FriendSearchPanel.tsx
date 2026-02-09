import { useState } from 'react';
import { Users, Search, UserPlus, Loader2, User as UserIcon } from 'lucide-react';
import { socialAPI, User } from '../../api/social';
import { Button } from '../ui/Button';
import { resolveMediaUrl } from '../../utils/media';

interface FriendSearchPanelProps {
  onFriendAdded: () => void | Promise<void>;
  friendIds?: number[];
  currentUserId?: number;
}

export function FriendSearchPanel({ onFriendAdded, friendIds = [], currentUserId }: FriendSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingFriend, setAddingFriend] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError('');
    try {
      const results = await socialAPI.searchUsers(searchQuery);
      const filtered = results.filter(
        (user) => user.id !== currentUserId && !friendIds.includes(user.id)
      );
      setSearchResults(filtered);
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Ошибка поиска пользователей');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (userId: number) => {
    setAddingFriend(userId);
    setError('');
    setStatus('');
    try {
      await socialAPI.addFriend(Number(userId));
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      await onFriendAdded();
      setStatus('Заявка отправлена.');
    } catch (err: any) {
      console.error('Add friend error:', err);
      setError(err.response?.data?.detail || 'Не удалось добавить друга');
    } finally {
      setAddingFriend(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-8">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-slate-800" />
        <h2 className="text-slate-900">Найти друзей</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Введите имя пользователя"
              className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none transition-colors bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching}
            size="md"
            className="px-5 py-3 rounded-xl text-base bg-black text-white hover:bg-slate-900 border border-black"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg border bg-rose-50 border-rose-200">
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {status && !error && (
          <div className="p-3 rounded-lg border bg-slate-50 border-slate-200">
            <p className="text-sm text-slate-700">{status}</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-white border-slate-200 hover:border-slate-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {resolveMediaUrl(user.avatar) ? (
                    <img
                      src={resolveMediaUrl(user.avatar) as string}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full border flex items-center justify-center bg-slate-100 border-slate-200 text-slate-600"
                    >
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-slate-900 truncate">{user.username}</p>
                    <p className="text-xs text-slate-600">Уровень {user.level}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleAddFriend(user.id)}
                  disabled={addingFriend === user.id}
                  size="md"
                  className="px-5 py-3 rounded-xl text-base bg-black text-white hover:bg-slate-900 border border-black"
                >
                  {addingFriend === user.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Добавить
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !searching && (
          <div className="text-center py-4 text-slate-600">
            <p className="text-sm">Пользователи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}

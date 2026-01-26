import { useState } from 'react';
import { Users, Search, UserPlus, Loader2 } from 'lucide-react';
import { socialAPI, User } from '../../api/social';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';

interface FriendSearchPanelProps {
  onFriendAdded: () => void;
}

export function FriendSearchPanel({ onFriendAdded }: FriendSearchPanelProps) {
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingFriend, setAddingFriend] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError('');
    try {
      const results = await socialAPI.searchUsers(searchQuery);
      setSearchResults(results);
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
    try {
      await socialAPI.addFriend(userId);
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      onFriendAdded();
    } catch (err: any) {
      console.error('Add friend error:', err);
      setError(err.response?.data?.detail || 'Не удалось добавить друга');
    } finally {
      setAddingFriend(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-purple-500/50 p-6 shadow-2xl backdrop-blur-sm ring-2 ring-rose-400/50 ring-offset-2 ring-offset-slate-900">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-purple-400" />
        <h2 className="text-purple-300">Найти друзей</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Введите имя пользователя"
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-slate-950/50 border-purple-600/30 text-purple-100 placeholder-purple-200/30 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching}
            size="sm"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg border bg-red-900/30 border-red-600/50">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-slate-950/40 border-purple-600/20 hover:border-purple-500/50 transition-colors"
              >
                <div>
                  <p className="text-purple-200">{user.username}</p>
                  <p className="text-xs text-purple-200/60">
                    Уровень {user.level}
                  </p>
                </div>
                <Button
                  onClick={() => handleAddFriend(user.id)}
                  disabled={addingFriend === user.id}
                  size="sm"
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
          <div className="text-center py-4 text-purple-200/60">
            <p className="text-sm">Пользователи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}

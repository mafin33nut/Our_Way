import { useState } from 'react';
import { Crown, Shield, Search, Plus, Loader2, Lock } from 'lucide-react';
import { socialAPI } from '../../api/social';
import { Clan } from '../../types';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';

interface ClanCreationPanelProps {
  onClanCreated: () => void | Promise<void>;
}

export function ClanCreationPanel({ onClanCreated }: ClanCreationPanelProps) {
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [clanName, setClanName] = useState('');
  const [clanDescription, setClanDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [joinPassword, setJoinPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Clan[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [requesting, setRequesting] = useState<number | null>(null);
  const [requestedClanIds, setRequestedClanIds] = useState<number[]>([]);
  const [joinPasswords, setJoinPasswords] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  const handleCreateClan = async () => {
    if (!clanName.trim()) {
      setError('Введите название клана');
      return;
    }
    if (!isPublic && !joinPassword.trim()) {
      setError('Для приватного клана нужен пароль');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await socialAPI.createClan({
        name: clanName.trim(),
        description: clanDescription.trim() || undefined,
        is_public: isPublic,
        join_password: isPublic ? undefined : joinPassword.trim(),
      });
      await onClanCreated();
    } catch (err: any) {
      console.error('Create clan error:', err);
      console.error('Error response:', err.response?.data);
      const errorDetail = err.response?.data?.detail || 
                         err.response?.data?.name?.[0] || 
                         err.response?.data?.name || 
                         err.message || 
                         'Не удалось создать клан';
      setError(errorDetail);
    } finally {
      setCreating(false);
    }
  };

  const handleSearchClans = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError('');
    try {
      const results = await socialAPI.searchClans(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      console.error('Search clans error:', err);
      setError('');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleJoinClan = async (clan: Clan) => {
    if (!clan.is_public && !joinPasswords[clan.id]?.trim()) {
      setError('Для приватного клана нужен пароль');
      return;
    }
    setRequesting(clan.id);
    setError('');
    try {
      await socialAPI.requestJoinClan(clan.id, joinPasswords[clan.id]?.trim());
      setRequestedClanIds((prev) => (prev.includes(clan.id) ? prev : [...prev, clan.id]));
    } catch (err: any) {
      console.error('Join clan error:', err);
      setError(err.response?.data?.detail || 'Не удалось отправить запрос');
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-slate-800" />
        <h2 className="text-slate-900">Клан</h2>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            setMode('create');
            setError('');
            setSearchQuery('');
            setSearchResults([]);
            setRequestedClanIds([]);
          }}
          className={`flex-1 py-3 px-5 rounded-xl text-sm font-medium transition-colors border ${
            mode === 'create'
              ? 'bg-black text-white border-black'
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
          }`}
        >
          Создать
        </button>
        <button
          onClick={() => {
            setMode('join');
            setError('');
            setClanName('');
            setClanDescription('');
            setIsPublic(true);
            setJoinPassword('');
            setJoinPasswords({});
            setRequestedClanIds([]);
          }}
          className={`flex-1 py-3 px-5 rounded-xl text-sm font-medium transition-colors border ${
            mode === 'join'
              ? 'bg-black text-white border-black'
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
          }`}
        >
          Вступить
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border mb-4 bg-rose-50 border-rose-200">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {mode === 'create' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-slate-800">
              Название клана
            </label>
            <input
              type="text"
              value={clanName}
              onChange={(e) => setClanName(e.target.value)}
              placeholder="Введите название"
              className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none transition-colors bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-slate-800">
              Описание (необязательно)
            </label>
            <textarea
              value={clanDescription}
              onChange={(e) => setClanDescription(e.target.value)}
              placeholder="Введите описание клана"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none transition-colors resize-none bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400"
            />
          </div>
          <div
            className="rounded-xl border p-4 border-slate-200 bg-slate-50"
          >
            <p className="text-sm mb-2 text-slate-800">Доступ</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${
                  isPublic
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Публичный
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${
                  !isPublic
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Приватный
              </button>
            </div>
            {!isPublic && (
              <div className="mt-3">
                <label className="block text-sm mb-2 text-slate-800">
                  Пароль для вступления
                </label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400"
                />
              </div>
            )}
          </div>
          <Button
            onClick={handleCreateClan}
            disabled={creating || !clanName.trim()}
            className="w-full bg-black text-white hover:bg-slate-900 border border-black px-5 py-3 rounded-xl text-base"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Создать клан
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClans()}
                placeholder="Введите название клана"
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none transition-colors bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400"
              />
            </div>
            <Button
              onClick={handleSearchClans}
              disabled={searching}
              size="md"
              className="px-5 py-3 rounded-xl text-base bg-black text-white hover:bg-slate-900 border border-black"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((clan) => {
                const clanIsPublic = clan.is_public !== false;
                return (
                  <div
                    key={clan.id}
                    className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-white border-slate-200 hover:border-slate-300"
                  >
                  <div className="flex items-center gap-2">
                    <Shield
                      className="w-4 h-4 text-slate-700"
                    />
                    <div>
                      <p className="text-slate-900">
                        {clan.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {clan.members.length} участников • Уровень {clan.level}
                      </p>
                      <p className="text-xs text-slate-500">
                        {clanIsPublic ? 'Публичный' : 'Приватный'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!clanIsPublic && (
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                        />
                        <input
                          type="password"
                          value={joinPasswords[clan.id] || ''}
                          onChange={(e) =>
                            setJoinPasswords((prev) => ({ ...prev, [clan.id]: e.target.value }))
                          }
                          placeholder="Пароль"
                          className="w-44 pl-9 pr-3 py-2 rounded-lg border focus:outline-none transition-colors bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400"
                        />
                      </div>
                    )}
                    <Button
                      onClick={() =>
                        handleJoinClan({
                          ...clan,
                          is_public: clanIsPublic,
                        })
                      }
                      disabled={requesting === clan.id || requestedClanIds.includes(clan.id)}
                      size="md"
                      className="px-5 py-3 rounded-xl text-base bg-black text-white hover:bg-slate-900 border border-black"
                    >
                      {requesting === clan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : requestedClanIds.includes(clan.id) ? (
                        'Запрос отправлен'
                      ) : (
                        'Отправить запрос'
                      )}
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searching && (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">Кланы не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

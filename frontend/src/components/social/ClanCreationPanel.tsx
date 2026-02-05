import { useState } from 'react';
import { Crown, Shield, Search, Plus, Loader2, Lock } from 'lucide-react';
import { socialAPI } from '../../api/social';
import { Clan } from '../../types';
import { Button } from '../ui/Button';

interface ClanCreationPanelProps {
  onClanCreated: () => void | Promise<void>;
}

export function ClanCreationPanel({ onClanCreated }: ClanCreationPanelProps) {
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
      setError('Ошибка поиска кланов');
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
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-600/50 p-6 shadow-2xl backdrop-blur-sm ring-1 ring-teal-300/40 ring-offset-2 ring-offset-slate-900">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-teal-300" />
        <h2 className="text-slate-100">Клан</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setMode('create');
            setError('');
            setSearchQuery('');
            setSearchResults([]);
            setRequestedClanIds([]);
          }}
          className={`flex-1 py-2 px-4 rounded-lg text-sm transition-colors ${
            mode === 'create'
              ? 'bg-slate-800/60 text-teal-100 border border-teal-300/50'
              : 'bg-slate-950/40 text-slate-300/70 hover:bg-slate-950/60'
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
          className={`flex-1 py-2 px-4 rounded-lg text-sm transition-colors ${
            mode === 'join'
              ? 'bg-slate-800/60 text-teal-100 border border-teal-300/50'
              : 'bg-slate-950/40 text-slate-300/70 hover:bg-slate-950/60'
          }`}
        >
          Вступить
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border mb-4 bg-rose-900/30 border-rose-400/40">
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}

      {mode === 'create' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-slate-200">
              Название клана
            </label>
            <input
              type="text"
              value={clanName}
              onChange={(e) => setClanName(e.target.value)}
              placeholder="Введите название"
              className="w-full px-4 py-2 rounded-lg border bg-slate-950/50 border-slate-600/40 text-slate-100 placeholder-slate-400/40 focus:outline-none focus:border-teal-300 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-slate-200">
              Описание (необязательно)
            </label>
            <textarea
              value={clanDescription}
              onChange={(e) => setClanDescription(e.target.value)}
              placeholder="Введите описание клана"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border bg-slate-950/50 border-slate-600/40 text-slate-100 placeholder-slate-400/40 focus:outline-none focus:border-teal-300 transition-colors resize-none"
            />
          </div>
          <div className="rounded-lg border border-slate-600/40 bg-slate-950/40 p-3">
            <p className="text-sm text-slate-200 mb-2">Доступ</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm transition-colors ${
                  isPublic
                    ? 'bg-slate-800/60 text-teal-100 border border-teal-300/50'
                    : 'bg-slate-950/40 text-slate-300/70 hover:bg-slate-950/60'
                }`}
              >
                Публичный
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm transition-colors ${
                  !isPublic
                    ? 'bg-slate-800/60 text-teal-100 border border-teal-300/50'
                    : 'bg-slate-950/40 text-slate-300/70 hover:bg-slate-950/60'
                }`}
              >
                Приватный
              </button>
            </div>
            {!isPublic && (
              <div className="mt-3">
                <label className="block text-sm mb-2 text-slate-200">
                  Пароль для вступления
                </label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full px-4 py-2 rounded-lg border bg-slate-950/50 border-slate-600/40 text-slate-100 placeholder-slate-400/40 focus:outline-none focus:border-teal-300 transition-colors"
                />
              </div>
            )}
          </div>
          <Button
            onClick={handleCreateClan}
            disabled={creating || !clanName.trim()}
            className="w-full"
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
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClans()}
                placeholder="Введите название клана"
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-slate-950/50 border-slate-600/40 text-slate-100 placeholder-slate-400/40 focus:outline-none focus:border-teal-300 transition-colors"
              />
            </div>
            <Button
              onClick={handleSearchClans}
              disabled={searching}
              size="sm"
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
                  className="flex items-center justify-between p-3 rounded-lg border bg-slate-950/40 border-purple-600/20 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-purple-200">{clan.name}</p>
                      <p className="text-xs text-purple-200/60">
                        {clan.members.length} участников • Уровень {clan.level}
                      </p>
                      <p className="text-xs text-purple-200/60">
                        {clanIsPublic ? 'Публичный' : 'Приватный'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!clanIsPublic && (
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                        <input
                          type="password"
                          value={joinPasswords[clan.id] || ''}
                          onChange={(e) =>
                            setJoinPasswords((prev) => ({ ...prev, [clan.id]: e.target.value }))
                          }
                          placeholder="Пароль"
                          className="w-44 pl-9 pr-3 py-2 rounded-lg border bg-slate-950/50 border-slate-600/40 text-slate-100 placeholder-slate-400/40 focus:outline-none focus:border-teal-300 transition-colors"
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
                      size="sm"
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
            <div className="text-center py-4 text-purple-200/60">
              <p className="text-sm">Кланы не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

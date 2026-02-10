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
    <div
      className={
        isLight
          ? 'rounded-2xl border border-slate-200 bg-white shadow-lg p-7'
          : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-600/50 p-6 shadow-2xl backdrop-blur-sm ring-1 ring-teal-300/40 ring-offset-2 ring-offset-slate-900'
      }
    >
      <div className="flex items-center gap-2 mb-4">
        <Crown className={`w-5 h-5 ${isLight ? 'text-slate-800' : 'text-teal-400'}`} />
        <h2 className={isLight ? 'text-slate-900 text-lg font-semibold' : 'text-slate-100'}>Клан</h2>
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
              ? isLight
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-800/60 text-teal-100 border-teal-300/50'
              : isLight
                ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                : 'bg-slate-950/40 text-slate-300/70 border-slate-700/60 hover:bg-slate-950/60'
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
              ? isLight
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-800/60 text-teal-100 border-teal-300/50'
              : isLight
                ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                : 'bg-slate-950/40 text-slate-300/70 border-slate-700/60 hover:bg-slate-950/60'
          }`}
        >
          Вступить
        </button>
      </div>

      {error && (
        <div className={`p-4 rounded-lg border mb-4 ${isLight ? 'bg-white border-slate-200' : 'bg-rose-900/30 border-rose-400/40'}`}>
          <p className={`text-sm ${isLight ? 'text-slate-700' : 'text-rose-200'}`}>{error}</p>
        </div>
      )}

      {mode === 'create' ? (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm mb-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Название клана
            </label>
            <input
              type="text"
              value={clanName}
              onChange={(e) => setClanName(e.target.value)}
              placeholder="Введите название"
              className={`w-full px-4 py-3 rounded-xl border text-base focus:outline-none transition-colors ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                  : 'bg-slate-950/50 border-slate-600/40 text-slate-100 placeholder-slate-400/40 focus:border-teal-300'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Описание (необязательно)
            </label>
            <textarea
              value={clanDescription}
              onChange={(e) => setClanDescription(e.target.value)}
              placeholder="Введите описание клана"
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border text-base focus:outline-none transition-colors resize-none ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                  : 'bg-slate-950/50 border-slate-600/40 text-slate-100 placeholder-slate-400/40 focus:border-teal-300'
              }`}
            />
          </div>
          <div className={`rounded-xl border p-5 ${isLight ? 'border-slate-200 bg-white' : 'border-slate-600/40 bg-slate-950/40'}`}>
            <p className={`text-sm mb-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Доступ</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${
                  isPublic
                    ? isLight
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-800/60 text-teal-100 border-teal-300/50'
                    : isLight
                      ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                      : 'bg-slate-950/40 text-slate-300/70 border-slate-700/60 hover:bg-slate-950/60'
                }`}
              >
                Публичный
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${
                  !isPublic
                    ? isLight
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-800/60 text-teal-100 border-teal-300/50'
                    : isLight
                      ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                      : 'bg-slate-950/40 text-slate-300/70 border-slate-700/60 hover:bg-slate-950/60'
                }`}
              >
                Приватный
              </button>
            </div>
            {!isPublic && (
              <div className="mt-3">
                <label className={`block text-sm mb-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Пароль для вступления
                </label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                      : 'bg-slate-950/50 border-slate-600/40 text-slate-100 placeholder-slate-400/40 focus:border-teal-300'
                  }`}
                />
              </div>
            )}
          </div>
          <Button
            onClick={handleCreateClan}
            disabled={creating || !clanName.trim()}
            className={
              isLight
                ? 'w-full bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 px-6 py-3.5 rounded-xl text-[17px] font-semibold shadow-sm'
                : 'w-full action-button'
            }
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
                className={`w-full px-4 py-3 rounded-xl border text-base focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                    : 'bg-slate-950/50 border-slate-600/40 text-slate-100 placeholder-slate-400/40 focus:border-teal-300'
                }`}
              />
            </div>
            <Button
              onClick={handleSearchClans}
              disabled={searching}
              size="md"
              className={
                isLight
                  ? 'px-6 py-3.5 rounded-xl text-[17px] font-semibold bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 shadow-sm'
                  : ''
              }
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
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-slate-950/40 border-purple-600/20 hover:border-purple-500/50'
                    }`}
                  >
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${isLight ? 'text-slate-700' : 'text-purple-400'}`} />
                    <div>
                      <p className={isLight ? 'text-slate-900' : 'text-purple-200'}>
                        {clan.name}
                      </p>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-purple-200/60'}`}>
                        {clan.members.length} участников • Уровень {clan.level}
                      </p>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-purple-200/60'}`}>
                        {clanIsPublic ? 'Публичный' : 'Приватный'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!clanIsPublic && (
                      <div className="relative">
                        <Lock
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-slate-500' : 'text-purple-300'}`}
                        />
                        <input
                          type="password"
                          value={joinPasswords[clan.id] || ''}
                          onChange={(e) =>
                            setJoinPasswords((prev) => ({ ...prev, [clan.id]: e.target.value }))
                          }
                          placeholder="Пароль"
                          className={`w-44 pl-9 pr-3 py-2 rounded-lg border focus:outline-none transition-colors ${
                            isLight
                              ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                              : 'bg-slate-950/50 border-slate-600/40 text-slate-100 placeholder-slate-400/40 focus:border-teal-300'
                          }`}
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
                      className={
                        isLight
                          ? 'px-6 py-3.5 rounded-xl text-[17px] font-semibold bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 shadow-sm'
                          : ''
                      }
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
              <p className={isLight ? 'text-sm text-slate-500' : 'text-sm text-purple-200/60'}>Кланы не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

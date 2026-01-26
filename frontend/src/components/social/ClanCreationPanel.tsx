import { useState } from 'react';
import { Crown, Shield, Search, Plus, Loader2 } from 'lucide-react';
import { socialAPI, Clan } from '../../api/social';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';

interface ClanCreationPanelProps {
  onClanCreated: () => void;
}

export function ClanCreationPanel({ onClanCreated }: ClanCreationPanelProps) {
  const { settings } = useCustomization();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [clanName, setClanName] = useState('');
  const [clanDescription, setClanDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Clan[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleCreateClan = async () => {
    if (!clanName.trim()) {
      setError('Введите название клана');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await socialAPI.createClan({
        name: clanName.trim(),
        description: clanDescription.trim() || undefined,
      });
      onClanCreated();
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

  const handleJoinClan = async (clanId: number) => {
    setJoining(clanId);
    setError('');
    try {
      await socialAPI.joinClan(clanId);
      onClanCreated();
    } catch (err: any) {
      console.error('Join clan error:', err);
      setError(err.response?.data?.detail || 'Не удалось вступить в клан');
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-purple-500/50 p-6 shadow-2xl backdrop-blur-sm ring-2 ring-amber-500/60 ring-offset-2 ring-offset-slate-900">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-purple-400" />
        <h2 className="text-purple-300">Клан</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setMode('create');
            setError('');
            setSearchQuery('');
            setSearchResults([]);
          }}
          className={`flex-1 py-2 px-4 rounded-lg text-sm transition-colors ${
            mode === 'create'
              ? 'bg-purple-900/30 text-purple-300 border border-purple-600/50'
              : 'bg-slate-950/40 text-purple-200/60 hover:bg-slate-950/60'
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
          }}
          className={`flex-1 py-2 px-4 rounded-lg text-sm transition-colors ${
            mode === 'join'
              ? 'bg-purple-900/30 text-purple-300 border border-purple-600/50'
              : 'bg-slate-950/40 text-purple-200/60 hover:bg-slate-950/60'
          }`}
        >
          Вступить
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border mb-4 bg-red-900/30 border-red-600/50">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {mode === 'create' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-purple-200">
              Название клана
            </label>
            <input
              type="text"
              value={clanName}
              onChange={(e) => setClanName(e.target.value)}
              placeholder="Введите название"
              className="w-full px-4 py-2 rounded-lg border bg-slate-950/50 border-purple-600/30 text-purple-100 placeholder-purple-200/30 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-purple-200">
              Описание (необязательно)
            </label>
            <textarea
              value={clanDescription}
              onChange={(e) => setClanDescription(e.target.value)}
              placeholder="Введите описание клана"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border bg-slate-950/50 border-purple-600/30 text-purple-100 placeholder-purple-200/30 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchClans()}
                placeholder="Введите название клана"
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-slate-950/50 border-purple-600/30 text-purple-100 placeholder-purple-200/30 focus:outline-none focus:border-purple-500 transition-colors"
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
              {searchResults.map((clan) => (
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
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinClan(clan.id)}
                    disabled={joining === clan.id}
                    size="sm"
                  >
                    {joining === clan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Вступить'
                    )}
                  </Button>
                </div>
              ))}
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

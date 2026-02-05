import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Clan, ClanJoinRequest } from '../../types';
import { socialAPI } from '../../api/social';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface ClanChatPanelProps {
  clan: Clan;
  onClanUpdated: () => void | Promise<void>;
}

export function ClanChatPanel({ clan, onClanUpdated }: ClanChatPanelProps) {
  const { user } = useAuth();
  const [joinRequests, setJoinRequests] = useState<ClanJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningRequestId, setActioningRequestId] = useState<number | null>(null);

  const isLeader = useMemo(() => {
    const member = clan.members?.find((item) => item.username === user?.username);
    return member?.role === 'leader';
  }, [clan.members, user?.username]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const requestsRes = await socialAPI.getClanJoinRequests(clan.id).catch(() => []);
      setJoinRequests(requestsRes);
    } catch (err) {
      console.error('Failed to load clan chat data:', err);
      setError('Не удалось загрузить заявки.');
    } finally {
      setLoading(false);
    }
  }, [clan.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingRequests = joinRequests.filter((request) => request.status === 'pending');

  const handleApprove = async (requestId: number) => {
    setActioningRequestId(requestId);
    setError(null);
    try {
      const updated = await socialAPI.approveClanJoinRequest(requestId);
      setJoinRequests((prev) => prev.map((item) => (item.id === requestId ? updated : item)));
      await onClanUpdated();
    } catch (err) {
      console.error('Failed to approve join request:', err);
      setError('Не удалось одобрить запрос.');
    } finally {
      setActioningRequestId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setActioningRequestId(requestId);
    setError(null);
    try {
      const updated = await socialAPI.rejectClanJoinRequest(requestId);
      setJoinRequests((prev) => prev.map((item) => (item.id === requestId ? updated : item)));
    } catch (err) {
      console.error('Failed to reject join request:', err);
      setError('Не удалось отклонить запрос.');
    } finally {
      setActioningRequestId(null);
    }
  };

  return (
    <div className="panel-base panel-rose p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-slate-100">Прием заявок</h2>
      </div>
      <p className="text-xs text-rose-200/60 mb-3">
        Просмотр и обработка заявок на вступление в клан.
      </p>

      {error && (
        <div className="p-3 rounded-lg border mb-4 bg-rose-900/30 border-rose-400/40">
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-rose-200/70">Загрузка...</div>
      ) : isLeader ? (
        <div className="rounded-lg border border-rose-400/30 bg-slate-950/40 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-rose-200/80">Заявки</p>
            <span className="text-xs text-rose-200/60">Ожидают: {pendingRequests.length}</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-4 text-rose-200/60 text-sm">
                Нет заявок
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border border-rose-400/30 bg-slate-950/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-rose-100 truncate">{request.username || 'Игрок'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="softAmber"
                      onClick={() => handleApprove(request.id)}
                      disabled={actioningRequestId === request.id}
                    >
                      {actioningRequestId === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(request.id)}
                      disabled={actioningRequestId === request.id}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm text-rose-200/60">Доступно только лидеру клана.</div>
      )}
    </div>
  );
}

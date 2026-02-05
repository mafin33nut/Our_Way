import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { Clan, ClanJoinRequest, ClanMessage } from '../../types';
import { socialAPI } from '../../api/social';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface ClanChatPanelProps {
  clan: Clan;
  onClanUpdated: () => void | Promise<void>;
}

export function ClanChatPanel({ clan, onClanUpdated }: ClanChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ClanMessage[]>([]);
  const [joinRequests, setJoinRequests] = useState<ClanJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioningRequestId, setActioningRequestId] = useState<number | null>(null);
  const [actioningMemberId, setActioningMemberId] = useState<number | null>(null);

  const isLeader = useMemo(() => {
    const member = clan.members?.find((item) => item.username === user?.username);
    return member?.role === 'leader';
  }, [clan.members, user?.username]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [messagesRes, requestsRes] = await Promise.all([
        socialAPI.getClanMessages(clan.id).catch(() => []),
        socialAPI.getClanJoinRequests(clan.id).catch(() => []),
      ]);
      setMessages(messagesRes);
      setJoinRequests(requestsRes);
    } catch (err) {
      console.error('Failed to load clan chat data:', err);
      setError('Не удалось загрузить чат клана.');
    } finally {
      setLoading(false);
    }
  }, [clan.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingRequests = joinRequests.filter((request) => request.status === 'pending');

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    setError(null);
    try {
      const created = await socialAPI.sendClanMessage(clan.id, newMessage.trim());
      setMessages((prev) => [...prev, created]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send clan message:', err);
      setError('Не удалось отправить сообщение.');
    } finally {
      setSending(false);
    }
  };

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

  const handlePromote = async (memberId: number) => {
    setActioningMemberId(memberId);
    setError(null);
    try {
      await socialAPI.promoteClanMember(memberId);
      await onClanUpdated();
    } catch (err) {
      console.error('Failed to promote member:', err);
      setError('Не удалось назначить лидера.');
    } finally {
      setActioningMemberId(null);
    }
  };

  const handleRemove = async (memberId: number) => {
    setActioningMemberId(memberId);
    setError(null);
    try {
      await socialAPI.removeClanMember(memberId);
      await onClanUpdated();
    } catch (err) {
      console.error('Failed to remove member:', err);
      setError('Не удалось исключить участника.');
    } finally {
      setActioningMemberId(null);
    }
  };

  return (
    <div className="panel-base panel-rose p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-rose-200" />
        <h2 className="text-slate-100">Чат клана</h2>
      </div>
      <p className="text-xs text-rose-200/60 mb-3">
        Общий чат и быстрые объявления для участников.
      </p>

      {error && (
        <div className="p-3 rounded-lg border mb-4 bg-rose-900/30 border-rose-400/40">
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-rose-200/70">Загрузка...</div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-rose-200/80">Участники клана</p>
              <span className="text-xs text-rose-200/60">{clan.members?.length || 0}</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(clan.members || []).length === 0 ? (
                <div className="text-center py-4 text-rose-200/60 text-sm">Участников пока нет</div>
              ) : (
                (clan.members || []).map((member) => {
                  const isSelf = member.username === user?.username;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-rose-400/30 bg-slate-950/40 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-rose-100 truncate">
                          {member.username}
                          {member.role === 'leader' && (
                            <span className="ml-2 text-xs text-rose-200/60">лидер</span>
                          )}
                        </p>
                      </div>
                      {isLeader && !isSelf && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="softAmber"
                            onClick={() => handlePromote(member.id)}
                            disabled={actioningMemberId === member.id}
                          >
                            {actioningMemberId === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Лидер'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemove(member.id)}
                            disabled={actioningMemberId === member.id}
                          >
                            Исключить
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {isLeader && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-rose-200/80">Прием заявок</p>
                <span className="text-xs text-rose-200/60">Ожидают: {pendingRequests.length}</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
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
          )}

          <div className="rounded-lg border border-rose-400/30 bg-slate-950/40 p-3">
            <div className="max-h-64 overflow-y-auto space-y-4 mb-3">
              {messages.length === 0 ? (
                <div className="text-center py-4 text-rose-200/60 text-sm">
                  Сообщений пока нет
                </div>
              ) : (
                messages.map((message, index) => {
                  const prev = messages[index - 1];
                  const showAuthor = !prev || prev.username !== message.username;
                  return (
                    <div key={message.id} className="px-1 py-1">
                      {showAuthor && (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[0.5rem] text-rose-200/10 truncate">{message.username}</p>
                          <span className="text-[0.5rem] text-rose-200/10">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      <p className="text-sm text-rose-50/90 mt-1">{message.content}</p>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 rounded-lg border border-rose-400/30 bg-slate-950/40 px-3 py-2 text-slate-100"
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="px-4 py-3"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

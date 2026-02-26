import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Send, Users, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';
import { useAuth } from '../../hooks/useAuth';
import { socialAPI } from '../../api/social';
import { Clan, Friend, ClanMessage, ClanJoinRequest } from '../../types';

type ChatTab = 'clans' | 'friends';

type ChatHubPanelProps = {
  className?: string;
};

export function ChatHubPanel({ className = '' }: ChatHubPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>('clans');
  const [clans, setClans] = useState<Clan[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingClans, setLoadingClans] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedClanId, setSelectedClanId] = useState<number | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [chatDraft, setChatDraft] = useState('');
  const [clanChatDraft, setClanChatDraft] = useState('');
  const [chatMessages, setChatMessages] = useState<
    Record<number, Array<{ id: number; text: string; createdAt: string; senderId: number }>>
  >({});
  const [clanChatMessages, setClanChatMessages] = useState<Record<number, ClanMessage[]>>({});
  const [loadingClanMessages, setLoadingClanMessages] = useState(false);
  const [clanJoinRequests, setClanJoinRequests] = useState<Record<number, ClanJoinRequest[]>>({});
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false);
  const [actioningJoinRequestId, setActioningJoinRequestId] = useState<number | null>(null);
  const { settings } = useCustomization();
  const { user } = useAuth();
  const isLight = settings.theme === 'light';

  const loadClans = useCallback(async () => {
    if (!user) return;
    setLoadingClans(true);
    try {
      const list = await socialAPI.getMyClans().catch(() => []);
      setClans(list || []);
      setSelectedClanId((prev) =>
        prev && list.some((item) => item.id === prev) ? prev : list[0]?.id ?? null
      );
    } finally {
      setLoadingClans(false);
    }
  }, [user]);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoadingFriends(true);
    try {
      const list = await socialAPI.getFriends().catch(() => []);
      setFriends(list || []);
      setSelectedFriendId((prev) =>
        prev && list.some((item) => item.id === prev) ? prev : list[0]?.id ?? null
      );
    } finally {
      setLoadingFriends(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      loadClans();
      loadFriends();
    }
  }, [isOpen, loadClans, loadFriends]);

  const selectedClan = useMemo(
    () => clans.find((item) => item.id === selectedClanId) || null,
    [clans, selectedClanId]
  );

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.id === selectedFriendId) || null,
    [friends, selectedFriendId]
  );

  const isClanMember = useMemo(() => {
    if (!user || !selectedClan) return false;
    return (selectedClan.members || []).some((member) => member.username === user.username);
  }, [selectedClan, user]);

  const isClanLeader = useMemo(() => {
    if (!user || !selectedClan) return false;
    const me = (selectedClan.members || []).find((member) => member.username === user.username);
    return me?.role === 'leader';
  }, [selectedClan, user]);

  const getChatKey = (userId: number, friendId: number) => {
    const [a, b] = userId < friendId ? [userId, friendId] : [friendId, userId];
    return `friend_chat_${a}_${b}`;
  };

  const loadChatMessages = useCallback(() => {
    if (!user || !selectedFriendId) return;
    const key = getChatKey(user.id, selectedFriendId);
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as Array<{ id: number; text: string; createdAt: string; senderId: number }>) : [];
    setChatMessages((prev) => ({
      ...prev,
      [selectedFriendId]: parsed,
    }));
  }, [user, selectedFriendId]);

  useEffect(() => {
    if (selectedFriendId) {
      loadChatMessages();
    }
  }, [selectedFriendId, loadChatMessages]);

  const currentMessages = selectedFriendId ? chatMessages[selectedFriendId] || [] : [];

  const loadClanMessages = useCallback(async () => {
    if (!selectedClanId) return;
    setLoadingClanMessages(true);
    try {
      const list = await socialAPI.getClanMessages(selectedClanId).catch(() => []);
      setClanChatMessages((prev) => ({
        ...prev,
        [selectedClanId]: list || [],
      }));
    } finally {
      setLoadingClanMessages(false);
    }
  }, [selectedClanId]);

  useEffect(() => {
    if (selectedClanId) {
      loadClanMessages();
    }
  }, [selectedClanId, loadClanMessages]);

  const loadClanJoinRequests = useCallback(async () => {
    if (!selectedClanId) return;
    if (!isClanLeader) {
      setClanJoinRequests((prev) => ({ ...prev, [selectedClanId]: [] }));
      return;
    }
    setLoadingJoinRequests(true);
    try {
      const list = await socialAPI.getClanJoinRequests(selectedClanId).catch(() => []);
      setClanJoinRequests((prev) => ({ ...prev, [selectedClanId]: list || [] }));
    } finally {
      setLoadingJoinRequests(false);
    }
  }, [selectedClanId, isClanLeader]);

  useEffect(() => {
    if (selectedClanId) {
      loadClanJoinRequests();
    }
  }, [selectedClanId, loadClanJoinRequests]);

  const handleApproveJoinRequest = async (requestId: number) => {
    if (!selectedClanId) return;
    setActioningJoinRequestId(requestId);
    try {
      await socialAPI.approveClanJoinRequest(requestId);
      await Promise.all([loadClans(), loadClanJoinRequests()]);
    } finally {
      setActioningJoinRequestId(null);
    }
  };

  const handleRejectJoinRequest = async (requestId: number) => {
    if (!selectedClanId) return;
    setActioningJoinRequestId(requestId);
    try {
      await socialAPI.rejectClanJoinRequest(requestId);
      await loadClanJoinRequests();
    } finally {
      setActioningJoinRequestId(null);
    }
  };

  const handleSendMessage = () => {
    if (!user || !selectedFriendId || !chatDraft.trim()) return;
    const message = {
      id: Date.now(),
      text: chatDraft.trim(),
      createdAt: new Date().toISOString(),
      senderId: user.id,
    };
    setChatMessages((prev) => {
      const next = [...(prev[selectedFriendId] || []), message];
      const key = getChatKey(user.id, selectedFriendId);
      localStorage.setItem(key, JSON.stringify(next));
      return {
        ...prev,
        [selectedFriendId]: next,
      };
    });
    setChatDraft('');
  };

  const handleSendClanMessage = async () => {
    if (!user || !selectedClanId || !clanChatDraft.trim() || !isClanMember) return;
    try {
      const created = await socialAPI.sendClanMessage(selectedClanId, clanChatDraft.trim());
      setClanChatMessages((prev) => {
        const next = [...(prev[selectedClanId] || []), created];
        return { ...prev, [selectedClanId]: next };
      });
      setClanChatDraft('');
    } catch (err) {
      console.error('Failed to send clan message:', err);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        size="md"
        onClick={() => setIsOpen(true)}
        aria-label="Открыть чат"
        className={`flex items-center gap-2 sm:flex-col sm:gap-2 sm:px-4 sm:py-3 sm:text-base sm:rounded-xl ${
          isLight
            ? 'sm:bg-white/90 sm:hover:bg-slate-100 text-slate-900'
            : 'sm:bg-slate-800/50 sm:hover:bg-slate-800/80 text-white'
        } ${className}`}
      >
        <MessageCircle className="w-5 h-5 sm:hidden" />
        <span className="hidden sm:inline">Чат</span>
      </Button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[80]">
            <button
              type="button"
              className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть окно чатов"
            />
            <div
              className={`absolute right-0 top-0 h-full w-full max-w-full sm:max-w-[360px] md:max-w-[450px] lg:max-w-[560px] ${
                isLight
                  ? 'bg-white shadow-[0_28px_70px_-26px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70'
                  : 'bg-gradient-to-br from-slate-900/95 to-slate-950/95 shadow-[0_32px_86px_-30px_rgba(2,6,23,0.95)] ring-1 ring-slate-600/35'
              }`}
            >
              <div
                className={`flex items-center justify-between px-6 py-4 ${
                  isLight ? 'bg-white/95 backdrop-blur' : 'bg-slate-950/35 backdrop-blur'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className={`${isLight ? 'text-slate-800' : 'text-teal-200'}`} />
                  <h2 className={`${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Чат</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-[calc(100%-72px)] flex flex-col">
                <div className="px-5 pt-5">
                  {!user && (
                    <div className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300/70'}`}>
                      Войдите, чтобы пользоваться чатом.
                    </div>
                  )}
                  {user && (
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('clans')}
                        className={`px-8 py-3 rounded-lg border text-base transition-colors min-w-[200px] ${
                          activeTab === 'clans'
                            ? isLight
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-teal-300/60 bg-teal-400/10 text-teal-100'
                            : isLight
                              ? 'border-slate-300 text-slate-700 hover:border-slate-400'
                              : 'border-slate-600/60 text-slate-300/70 hover:border-slate-500/60'
                        }`}
                      >
                        Кланы
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('friends')}
                        className={`px-8 py-3 rounded-lg border text-base transition-colors min-w-[200px] ${
                          activeTab === 'friends'
                            ? isLight
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-purple-400/60 bg-purple-500/10 text-purple-100'
                            : isLight
                              ? 'border-slate-300 text-slate-700 hover:border-slate-400'
                              : 'border-slate-600/60 text-slate-300/70 hover:border-slate-500/60'
                        }`}
                      >
                        Друзья
                      </button>
                    </div>
                  )}
                </div>

                {user && (
                  <div className="flex-1 overflow-hidden px-5 pb-5 pt-5">
                    {activeTab === 'clans' && (
                      <div className="panel-base panel-flat p-0 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-5 h-5 text-teal-300" />
                          <h3 className="text-slate-100">Клановые чаты</h3>
                        </div>
                        <p className="text-xs text-slate-300/70 mb-4">
                          Сообщения внутри вашего клана. Ввод всегда снизу, без видимых границ чата.
                        </p>

                        {loadingClans ? (
                          <div className="text-sm text-slate-300/70">Загрузка кланов...</div>
                        ) : clans.length === 0 ? (
                          <div className="text-sm text-slate-300/70">Вы пока не состоите в кланах.</div>
                        ) : selectedClan ? (
                          <>
                            <p className="text-xs text-slate-300/80 mb-2">Выберите клан</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {clans.map((clan) => (
                                <button
                                  key={clan.id}
                                  onClick={() => setSelectedClanId(clan.id)}
                                  title={`Клан: ${clan.name}`}
                                  className={`rounded-lg border text-xs transition-colors px-4 py-2 flex items-center gap-2 ${
                                    selectedClanId === clan.id
                                      ? 'border-teal-300/60 bg-teal-400/10 text-teal-100'
                                      : 'border-slate-600/60 text-slate-300/70 hover:border-slate-500/60'
                                  }`}
                                >
                                  <span className="w-7 h-7 rounded-full border border-teal-300/50 bg-teal-400/10 flex items-center justify-center text-[0.7rem]">
                                    {clan.name[0]?.toUpperCase()}
                                  </span>
                                  <span>{clan.name}</span>
                                </button>
                              ))}
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col gap-3">
                              {isClanLeader && (
                                <div className="space-y-2">
                                  <p className="text-xs text-purple-200/70">Заявки в клан</p>
                                  {loadingJoinRequests ? (
                                    <div className="text-xs text-purple-200/60">Загрузка заявок...</div>
                                  ) : (clanJoinRequests[selectedClanId] || []).filter((r) => r.status === 'pending')
                                      .length === 0 ? (
                                    <div className="text-xs text-purple-200/60">Нет заявок</div>
                                  ) : (
                                    <div className="space-y-2">
                                      {(clanJoinRequests[selectedClanId] || [])
                                        .filter((r) => r.status === 'pending')
                                        .map((request) => (
                                          <div
                                            key={request.id}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/25 px-4 py-3"
                                          >
                                            <div className="min-w-0">
                                              <p className="text-sm text-purple-100 truncate">
                                                {request.username || 'Игрок'}
                                              </p>
                                              <p className="text-xs text-purple-200/60">Хочет вступить в клан</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                              <Button
                                                size="sm"
                                                onClick={() => handleApproveJoinRequest(request.id)}
                                                disabled={actioningJoinRequestId === request.id}
                                              >
                                                Принять
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRejectJoinRequest(request.id)}
                                                disabled={actioningJoinRequestId === request.id}
                                              >
                                                Отклонить
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              )}

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {loadingClanMessages ? (
                                  <div className="text-center py-4 text-purple-200/60 text-sm">
                                    Загрузка сообщений...
                                  </div>
                                ) : (clanChatMessages[selectedClanId] || []).length === 0 ? (
                                  <div className="text-center py-4 text-purple-200/60 text-sm">
                                    Напишите первое сообщение
                                  </div>
                                ) : (
                                  (clanChatMessages[selectedClanId] || []).map((message, index) => {
                                    const prev = (clanChatMessages[selectedClanId] || [])[index - 1];
                                    const showAuthor = !prev || prev.user !== message.user;
                                    return (
                                      <div
                                        key={message.id}
                                        className={`flex ${
                                          message.user === user?.id ? 'justify-end' : 'justify-start'
                                        }`}
                                      >
                                        <div
                                          className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                                            isLight
                                              ? 'bg-white border border-slate-200 text-slate-900'
                                              : 'bg-slate-950/20 text-purple-100'
                                          }`}
                                        >
                                          {showAuthor && (
                                            <div className="mb-1">
                                              <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                                                  isLight
                                                    ? 'bg-slate-100 text-slate-700'
                                                    : 'bg-purple-500/15 text-purple-100'
                                                }`}
                                              >
                                                {message.username || 'Участник'}
                                              </span>
                                            </div>
                                          )}
                                          <p className="text-sm leading-snug whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {!isClanMember && (
                                <p className="text-xs text-purple-200/60">
                                  Писать могут только участники клана.
                                </p>
                              )}

                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  value={clanChatDraft}
                                  onChange={(e) => setClanChatDraft(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSendClanMessage();
                                    }
                                  }}
                                  placeholder="Напишите сообщение..."
                                  className={`flex-1 rounded-xl border px-4 py-3 ${
                                    isLight
                                      ? 'border-slate-300 bg-white text-slate-900'
                                      : 'border-purple-600/25 bg-slate-950/30 text-purple-100'
                                  }`}
                                  disabled={!isClanMember}
                                />
                                <Button
                                  onClick={handleSendClanMessage}
                                  disabled={!clanChatDraft.trim() || !isClanMember}
                                  className="px-4 py-3"
                                >
                                  <Send className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-slate-300/70">Клан недоступен.</div>
                        )}
                      </div>
                    )}

                    {activeTab === 'friends' && (
                      <div className="panel-base panel-flat p-0 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-5 h-5 text-purple-400" />
                          <h3 className="text-purple-200">Чат с друзьями</h3>
                        </div>
                        <p className="text-xs text-purple-200/60 mb-4">
                          Личные диалоги. Ваши сообщения справа, сообщения собеседника слева.
                        </p>

                        {loadingFriends ? (
                          <div className="text-sm text-purple-200/60">Загрузка друзей...</div>
                        ) : friends.length === 0 ? (
                          <div className="text-sm text-purple-200/60">Добавьте друзей, чтобы начать чат.</div>
                        ) : (
                          <div className="flex-1 overflow-hidden flex flex-col gap-3">
                            <p className="text-xs text-purple-200/70">Выберите друга</p>
                            <div className="flex flex-wrap gap-2">
                              {friends.map((friend) => (
                                <button
                                  key={friend.id}
                                  onClick={() => setSelectedFriendId(friend.id)}
                                  title={`Друг: ${friend.username}`}
                                  className={`rounded-lg border text-xs transition-colors px-4 py-2 flex items-center gap-2 ${
                                    selectedFriendId === friend.id
                                      ? 'border-purple-400/60 bg-purple-500/10 text-purple-100'
                                      : 'border-purple-600/40 text-purple-200/70 hover:border-purple-500/60'
                                  }`}
                                >
                                  <span className="w-7 h-7 rounded-full border border-purple-400/50 bg-purple-500/10 flex items-center justify-center text-[0.7rem]">
                                    {friend.username[0]?.toUpperCase()}
                                  </span>
                                  <span>{friend.username}</span>
                                </button>
                              ))}
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col gap-3">
                              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {currentMessages.length === 0 ? (
                                  <div className="text-center py-4 text-purple-200/60 text-sm">
                                    Напишите первое сообщение
                                  </div>
                                ) : (
                                  currentMessages.map((message) => (
                                    <div
                                      key={message.id}
                                      className={`flex ${
                                        message.senderId === user?.id ? 'justify-end' : 'justify-start'
                                      }`}
                                    >
                                      <div
                                        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                                          isLight
                                            ? 'bg-white border border-slate-200 text-slate-900'
                                            : message.senderId === user?.id
                                              ? 'bg-purple-500/15 text-purple-50'
                                              : 'bg-slate-950/20 text-purple-100'
                                        }`}
                                      >
                                        <p className="text-base leading-relaxed whitespace-pre-wrap">
                                          {message.text}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  value={chatDraft}
                                  onChange={(e) => setChatDraft(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSendMessage();
                                    }
                                  }}
                                  placeholder="Напишите сообщение..."
                                  className={`flex-1 rounded-xl border px-4 py-3 ${
                                    isLight
                                      ? 'border-slate-300 bg-white text-slate-900'
                                      : 'border-purple-600/25 bg-slate-950/30 text-purple-100'
                                  }`}
                                />
                                <Button
                                  onClick={handleSendMessage}
                                  disabled={!chatDraft.trim() || !selectedFriendId}
                                  className="px-4 py-3"
                                >
                                  <Send className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

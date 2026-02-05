import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Send, Users, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';
import { useAuth } from '../../hooks/useAuth';
import { socialAPI } from '../../api/social';
import { Clan, Friend, ClanMessage } from '../../types';
import { ClanChatPanel } from './ClanChatPanel';

type ChatTab = 'clans' | 'friends';

export function ChatHubPanel() {
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
        variant="ghost"
        size="md"
        onClick={() => setIsOpen(true)}
        aria-label="Открыть чат"
        className="flex items-center gap-2"
      >
        <MessageCircle className="w-5 h-5" />
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
              className={`absolute right-0 top-0 h-full w-full max-w-full sm:max-w-[420px] md:max-w-[520px] lg:max-w-[640px] ${
                isLight
                  ? 'bg-white border-l border-slate-200'
                  : 'bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-l border-slate-700/60'
              }`}
            >
              <div
                className={`flex items-center justify-between px-6 py-4 border-b ${
                  isLight ? 'border-slate-200' : 'border-slate-700/60'
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

              <div className="h-[calc(100%-136px)] overflow-y-auto px-[19px] py-[19px] space-y-[19px]">
                {!user && (
                  <div className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300/70'}`}>
                    Войдите, чтобы пользоваться чатом.
                  </div>
                )}
                {user && (
                  <>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('clans')}
                        className={`px-8 py-3 rounded-lg border text-base transition-colors min-w-[200px] ${
                          activeTab === 'clans'
                            ? 'border-teal-300/60 bg-teal-400/10 text-teal-100'
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
                            ? 'border-purple-400/60 bg-purple-500/10 text-purple-100'
                            : 'border-slate-600/60 text-slate-300/70 hover:border-slate-500/60'
                        }`}
                      >
                        Друзья
                      </button>
                    </div>

                    {activeTab === 'clans' && (
                      <div className="panel-base panel-teal p-6 w-full">
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="w-5 h-5 text-teal-300" />
                          <h3 className="text-slate-100">Клановые чаты</h3>
                        </div>
                        <p className="text-xs text-slate-300/70 mb-3">
                          Быстрые сообщения внутри вашего клана.
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
                            <div className="panel-base panel-rose p-6 w-full mb-6">
                              <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-purple-400" />
                                <h3 className="text-purple-200">Чат клана</h3>
                              </div>
                              <div className="rounded-lg border border-purple-600/30 bg-slate-950/40 p-3">
                                <div className="max-h-48 overflow-y-auto space-y-4 mb-3">
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
                                        <div key={message.id} className="px-1 py-1 text-purple-200">
                                          {showAuthor && (
                                            <p className="text-[0.5rem] text-purple-200/10">
                                              {message.username || 'Участник'}
                                            </p>
                                          )}
                                          <p className="text-sm">{message.content}</p>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                                {!isClanMember && (
                                  <p className="text-xs text-purple-200/60 mb-2">
                                    Писать могут только участники клана.
                                  </p>
                                )}
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    value={clanChatDraft}
                                    onChange={(e) => setClanChatDraft(e.target.value)}
                                    placeholder="Напишите сообщение..."
                                    className="flex-1 rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
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
                            </div>
                            <ClanChatPanel clan={selectedClan} onClanUpdated={loadClans} />
                          </>
                        ) : (
                          <div className="text-sm text-slate-300/70">Клан недоступен.</div>
                        )}
                      </div>
                    )}

                    {activeTab === 'friends' && (
                      <div className="panel-base panel-rose p-6 w-full">
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="w-5 h-5 text-purple-400" />
                          <h3 className="text-purple-200">Чат с друзьями</h3>
                        </div>
                        <p className="text-xs text-purple-200/60 mb-3">
                          Личные диалоги с друзьями.
                        </p>
                        {loadingFriends ? (
                          <div className="text-sm text-purple-200/60">Загрузка друзей...</div>
                        ) : friends.length === 0 ? (
                          <div className="text-sm text-purple-200/60">Добавьте друзей, чтобы начать чат.</div>
                        ) : (
                          <>
                            <p className="text-xs text-purple-200/70 mb-2">Выберите друга</p>
                            <div className="flex flex-wrap gap-2 mb-4">
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
                            <div className="rounded-lg border border-purple-600/30 bg-slate-950/40 p-3">
                              <div className="max-h-48 overflow-y-auto space-y-4 mb-3">
                                {currentMessages.length === 0 ? (
                                  <div className="text-center py-4 text-purple-200/60 text-sm">
                                    Напишите первое сообщение
                                  </div>
                                ) : (
                                  currentMessages.map((message, index) => {
                                    const prev = currentMessages[index - 1];
                                    const showAuthor = !prev || prev.senderId !== message.senderId;
                                    return (
                                      <div
                                        key={message.id}
                                        className={`px-1 py-1 ${
                                          message.senderId === user?.id ? 'text-purple-100' : 'text-purple-200'
                                        }`}
                                      >
                                        {showAuthor && (
                                          <div
                                            className={`${
                                              index === 0 ? '' : 'mt-2 pt-2 border-t border-purple-600/30'
                                            }`}
                                          >
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/40 text-sm text-purple-100">
                                              {message.senderId === user?.id
                                                ? user.username
                                                : selectedFriend?.username || 'Друг'}
                                            </span>
                                          </div>
                                        )}
                                        <p className="text-sm">{message.text}</p>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  value={chatDraft}
                                  onChange={(e) => setChatDraft(e.target.value)}
                                  placeholder="Напишите сообщение..."
                                  className="flex-1 rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
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
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div
                className={`flex items-center justify-end px-6 py-4 border-t ${
                  isLight ? 'border-slate-200' : 'border-slate-700/60'
                }`}
              >
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

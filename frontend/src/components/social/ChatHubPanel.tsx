import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Send, Users, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';
import { useAuth } from '../../hooks/useAuth';
import { socialAPI } from '../../api/social';
import { Clan, Friend } from '../../types';
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
  const [chatMessages, setChatMessages] = useState<
    Record<number, Array<{ id: number; text: string; createdAt: string; isMe: boolean }>>
  >({});
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

  const currentMessages = selectedFriendId ? chatMessages[selectedFriendId] || [] : [];

  const handleSendMessage = () => {
    if (!selectedFriendId || !chatDraft.trim()) return;
    const message = {
      id: Date.now(),
      text: chatDraft.trim(),
      createdAt: new Date().toISOString(),
      isMe: true,
    };
    setChatMessages((prev) => ({
      ...prev,
      [selectedFriendId]: [...(prev[selectedFriendId] || []), message],
    }));
    setChatDraft('');
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
              className={`absolute right-0 top-0 h-full w-full max-w-full sm:max-w-[60vw] ${
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

              <div className="h-[calc(100%-72px)] overflow-y-auto px-8 py-6 space-y-[19px]">
                {!user && (
                  <div className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300/70'}`}>
                    Войдите, чтобы пользоваться чатом.
                  </div>
                )}
                {user && (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('clans')}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
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
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                          activeTab === 'friends'
                            ? 'border-purple-400/60 bg-purple-500/10 text-purple-100'
                            : 'border-slate-600/60 text-slate-300/70 hover:border-slate-500/60'
                        }`}
                      >
                        Друзья
                      </button>
                    </div>

                    {activeTab === 'clans' && (
                      <div className="panel-base panel-teal p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="w-5 h-5 text-teal-300" />
                          <h3 className="text-slate-100">Клановые чаты</h3>
                        </div>
                        {loadingClans ? (
                          <div className="text-sm text-slate-300/70">Загрузка кланов...</div>
                        ) : clans.length === 0 ? (
                          <div className="text-sm text-slate-300/70">Вы пока не состоите в кланах.</div>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {clans.map((clan) => (
                                <button
                                  key={clan.id}
                                  onClick={() => setSelectedClanId(clan.id)}
                                  className={`rounded-lg border text-xs transition-colors px-4 py-2 ${
                                    selectedClanId === clan.id
                                      ? 'border-teal-300/60 bg-teal-400/10 text-teal-100'
                                      : 'border-slate-600/60 text-slate-300/70 hover:border-slate-500/60'
                                  }`}
                                >
                                  {clan.name}
                                </button>
                              ))}
                            </div>
                            {selectedClan && (
                              <ClanChatPanel clan={selectedClan} onClanUpdated={loadClans} />
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {activeTab === 'friends' && (
                      <div className="panel-base panel-rose p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="w-5 h-5 text-purple-400" />
                          <h3 className="text-purple-200">Чат с друзьями</h3>
                        </div>
                        {loadingFriends ? (
                          <div className="text-sm text-purple-200/60">Загрузка друзей...</div>
                        ) : friends.length === 0 ? (
                          <div className="text-sm text-purple-200/60">Добавьте друзей, чтобы начать чат.</div>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {friends.map((friend) => (
                                <button
                                  key={friend.id}
                                  onClick={() => setSelectedFriendId(friend.id)}
                                  className={`rounded-lg border text-xs transition-colors px-4 py-2 ${
                                    selectedFriendId === friend.id
                                      ? 'border-purple-400/60 bg-purple-500/10 text-purple-100'
                                      : 'border-purple-600/40 text-purple-200/70 hover:border-purple-500/60'
                                  }`}
                                >
                                  {friend.username}
                                </button>
                              ))}
                            </div>
                            <div className="rounded-lg border border-purple-600/30 bg-slate-950/40 p-3">
                              <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                                {currentMessages.length === 0 ? (
                                  <div className="text-center py-4 text-purple-200/60 text-sm">
                                    Напишите первое сообщение
                                  </div>
                                ) : (
                                  currentMessages.map((message) => (
                                    <div
                                      key={message.id}
                                      className={`rounded-lg border px-3 py-2 ${
                                        message.isMe
                                          ? 'border-purple-400/40 bg-purple-500/10 text-purple-100'
                                          : 'border-purple-600/30 bg-slate-950/40 text-purple-200'
                                      }`}
                                    >
                                      <p className="text-xs text-purple-200/60">
                                        {selectedFriend?.username || 'Друг'}
                                      </p>
                                      <p className="text-sm">{message.text}</p>
                                    </div>
                                  ))
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  value={chatDraft}
                                  onChange={(e) => setChatDraft(e.target.value)}
                                  placeholder="Напишите сообщение..."
                                  className="flex-1 rounded-lg border border-purple-600/30 bg-slate-950/50 px-3 py-2 text-purple-100"
                                />
                                <Button onClick={handleSendMessage} disabled={!chatDraft.trim() || !selectedFriendId}>
                                  <Send className="w-4 h-4" />
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
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

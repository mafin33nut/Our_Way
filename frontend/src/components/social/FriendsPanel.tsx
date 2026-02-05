import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Send, Users, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';
import { useAuth } from '../../hooks/useAuth';
import { socialAPI } from '../../api/social';
import { FriendSearchPanel } from './FriendSearchPanel';
import { AllFriendsPanel } from './AllFriendsPanel';
import { Friend } from '../../types';

export function FriendsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChatFriendId, setSelectedChatFriendId] = useState<number | null>(null);
  const [chatDraft, setChatDraft] = useState('');
  const [chatMessages, setChatMessages] = useState<
    Record<number, Array<{ id: number; text: string; createdAt: string; isMe: boolean }>>
  >({});
  const { settings } = useCustomization();
  const { user } = useAuth();

  const isLight = settings.theme === 'light';

  const loadFriends = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      const list = await socialAPI.getFriends().catch(() => []);
      setFriends(list || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen, loadFriends]);

  useEffect(() => {
    if (!selectedChatFriendId && friends.length > 0) {
      setSelectedChatFriendId(friends[0].id);
    }
  }, [friends, selectedChatFriendId]);

  const selectedChatFriend = useMemo(
    () => friends.find((friend) => friend.id === selectedChatFriendId) || null,
    [friends, selectedChatFriendId]
  );

  const currentMessages = selectedChatFriendId ? chatMessages[selectedChatFriendId] || [] : [];

  const handleSendMessage = () => {
    if (!selectedChatFriendId || !chatDraft.trim()) return;
    const message = {
      id: Date.now(),
      text: chatDraft.trim(),
      createdAt: new Date().toISOString(),
      isMe: true,
    };
    setChatMessages((prev) => ({
      ...prev,
      [selectedChatFriendId]: [...(prev[selectedChatFriendId] || []), message],
    }));
    setChatDraft('');
  };

  return (
    <>
      <Button
        variant="ghost"
        size="md"
        onClick={() => setIsOpen(true)}
        aria-label="Открыть друзей"
        className="flex items-center gap-2"
      >
        <Users className="w-5 h-5" />
        <span className="hidden sm:inline">Друзья</span>
      </Button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[80]">
            <button
              type="button"
              className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть окно друзей"
            />
            <div
              className={`absolute right-0 top-0 h-full w-full max-w-full sm:max-w-[50vw] ${
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
                  <Users className={`${isLight ? 'text-slate-800' : 'text-teal-200'}`} />
                  <h2 className={`${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Друзья</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-[calc(100%-72px)] overflow-y-auto px-8 py-6 space-y-8">
                {!user && (
                  <div className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300/70'}`}>
                    Войдите, чтобы управлять друзьями.
                  </div>
                )}
                {user && (
                  <>
                    <FriendSearchPanel
                      onFriendAdded={loadFriends}
                      friendIds={friends.map((friend) => friend.id)}
                      currentUserId={user.id}
                    />
                    <div className="panel-comment">
                      Найдите новых друзей по имени или никнейму.
                    </div>
                    {loading ? (
                      <div className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300/70'}`}>
                        Загрузка списка друзей...
                      </div>
                    ) : (
                      <>
                        <div className="panel-comment">
                          Список друзей с быстрым доступом к профилям.
                        </div>
                        <AllFriendsPanel friends={friends} />
                      </>
                    )}
                    <div className="panel-base panel-rose p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-purple-400" />
                        <h3 className="text-purple-200">Чат с друзьями</h3>
                      </div>
                      {friends.length === 0 ? (
                        <div className="text-sm text-purple-200/60">Добавьте друзей, чтобы начать чат.</div>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {friends.map((friend) => (
                              <button
                                key={friend.id}
                                onClick={() => setSelectedChatFriendId(friend.id)}
                                className={`rounded-lg border text-xs transition-colors px-4 py-2 ${
                                  selectedChatFriendId === friend.id
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
                                      {selectedChatFriend?.username || 'Друг'}
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
                              <Button onClick={handleSendMessage} disabled={!chatDraft.trim() || !selectedChatFriendId}>
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
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

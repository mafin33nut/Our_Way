import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCustomization } from '../../hooks/useCustomization';
import { useAuth } from '../../hooks/useAuth';
import { socialAPI } from '../../api/social';
import { FriendSearchPanel } from './FriendSearchPanel';
import { AllFriendsPanel } from './AllFriendsPanel';
import { Friend, FriendRequest } from '../../types';

type FriendsPanelProps = {
  className?: string;
};

export function FriendsPanel({ className = '' }: FriendsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actioningRequestId, setActioningRequestId] = useState<number | null>(null);
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

  const loadRequests = useCallback(async () => {
    if (!user) return;
    setLoadingRequests(true);
    try {
      const list = await socialAPI
        .getFriendRequests({ direction: 'incoming', status: 'pending' })
        .catch(() => []);
      setRequests(list || []);
    } finally {
      setLoadingRequests(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
      loadRequests();
    }
  }, [isOpen, loadFriends, loadRequests]);

  const handleApprove = async (requestId: number) => {
    setActioningRequestId(requestId);
    try {
      await socialAPI.approveFriendRequest(requestId);
      await Promise.all([loadFriends(), loadRequests()]);
    } finally {
      setActioningRequestId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setActioningRequestId(requestId);
    try {
      await socialAPI.rejectFriendRequest(requestId);
      await loadRequests();
    } finally {
      setActioningRequestId(null);
    }
  };


  return (
    <>
      <Button
        variant="primary"
        size="md"
        onClick={() => setIsOpen(true)}
        aria-label="Открыть друзей"
        className={`flex items-center gap-2 sm:flex-col sm:gap-2 sm:px-4 sm:py-3 sm:text-base sm:rounded-xl sm:border ${
          isLight
            ? 'sm:border-slate-200 sm:bg-white/90 sm:hover:bg-slate-100 text-slate-900'
            : 'sm:border-slate-600/60 sm:bg-slate-800/50 sm:hover:bg-slate-800/80 text-white'
        } ${className}`}
      >
        <Users className="w-5 h-5 sm:hidden" />
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
            <div className="absolute right-0 top-0 h-full w-full max-w-full sm:max-w-[50vw] bg-white border-l border-slate-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="text-slate-800" />
                  <h2 className="text-slate-900">Друзья</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="bg-black text-white hover:bg-slate-900 border border-black [&_*]:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-[calc(100%-72px)] overflow-y-auto px-8 sm:px-10 py-8 sm:py-10 space-y-8">
                {!user && (
                  <div className="text-sm text-slate-600">Войдите, чтобы управлять друзьями.</div>
                )}
                {user && (
                  <>
                    <div
                      className="rounded-2xl bg-white border border-slate-200 shadow-xl p-8"
                    >
                      <div className="text-slate-900 font-medium mb-4">Заявки в друзья</div>
                      {loadingRequests ? (
                        <div className="text-sm text-slate-600">Загрузка заявок...</div>
                      ) : requests.length === 0 ? (
                        <div className="text-sm text-slate-600">Нет входящих заявок.</div>
                      ) : (
                        <div className="space-y-2">
                          {requests.map((req) => (
                            <div
                              key={req.id}
                              className="flex items-center justify-between gap-3 rounded-xl px-5 py-4 bg-slate-50 border border-slate-200"
                            >
                              <div className="min-w-0">
                                <p className="text-slate-900 truncate">{req.from_user_username}</p>
                                <p className="text-xs text-slate-600">Хочет добавить вас в друзья</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Button
                                  size="md"
                                  onClick={() => handleApprove(req.id)}
                                  disabled={actioningRequestId === req.id}
                                  className="px-5 py-3 rounded-xl text-base bg-black text-white hover:bg-slate-900 border border-black"
                                >
                                  Принять
                                </Button>
                                <Button
                                  size="md"
                                  variant="ghost"
                                  onClick={() => handleReject(req.id)}
                                  disabled={actioningRequestId === req.id}
                                  className="px-5 py-3 rounded-xl text-base border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400"
                                >
                                  Отклонить
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <FriendSearchPanel
                      onFriendAdded={async () => {
                        await loadFriends();
                        await loadRequests();
                      }}
                      friendIds={friends.map((friend) => friend.id)}
                      currentUserId={user.id}
                    />
                    <div className="text-sm font-medium text-slate-700">Поиск друзей</div>
                    {loading ? (
                      <div className="text-sm text-slate-600">Загрузка списка друзей...</div>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-slate-700">Ваши друзья</div>
                        <AllFriendsPanel friends={friends} />
                      </>
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

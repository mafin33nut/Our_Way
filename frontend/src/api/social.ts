import { apiClient, unwrapListResponse } from './client';
import { Friend, Clan, Activity, User, ClanJoinRequest, ClanMessage } from '../types';
export type { User } from '../types';

export interface ClanCreateData {
  name: string;
  description?: string;
  is_public?: boolean;
  join_password?: string;
}

interface ActivityLog {
  id: number;
  activity: number;
  activity_title?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string | null;
}

export const socialAPI = {
  getFriends: async (): Promise<Friend[]> => {
    const response = await apiClient.get<Friend[] | { results: Friend[] }>('/api/friends/');
    return unwrapListResponse(response.data);
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get<User[] | { results: User[] }>(
      `/api/users/?search=${encodeURIComponent(query)}`
    );
    return unwrapListResponse(response.data);
  },

  getUserById: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/api/users/${userId}/`);
    return response.data;
  },

  addFriend: async (userId: number): Promise<void> => {
    await apiClient.post(`/api/friends/`, { user_id: userId });
  },

  getClan: async (): Promise<Clan | null> => {
    try {
      const response = await apiClient.get<Clan>('/api/clans/clan/');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  getMyClans: async (): Promise<Clan[]> => {
    const response = await apiClient.get<Clan[] | { results: Clan[] }>('/api/clans/my/');
    return unwrapListResponse(response.data);
  },

  createClan: async (data: ClanCreateData): Promise<Clan> => {
    const response = await apiClient.post<Clan>('/api/clans/clans/', data);
    return response.data;
  },

  requestJoinClan: async (clanId: number, joinPassword?: string): Promise<ClanJoinRequest> => {
    const response = await apiClient.post<ClanJoinRequest>('/api/clans/join-requests/', {
      clan: clanId,
      join_password: joinPassword || undefined,
    });
    return response.data;
  },

  getClanJoinRequests: async (clanId: number): Promise<ClanJoinRequest[]> => {
    const response = await apiClient.get<ClanJoinRequest[] | { results: ClanJoinRequest[] }>(
      `/api/clans/join-requests/?clan=${clanId}`
    );
    return unwrapListResponse(response.data);
  },

  approveClanJoinRequest: async (requestId: number): Promise<ClanJoinRequest> => {
    const response = await apiClient.post<ClanJoinRequest>(
      `/api/clans/join-requests/${requestId}/approve/`
    );
    return response.data;
  },

  rejectClanJoinRequest: async (requestId: number): Promise<ClanJoinRequest> => {
    const response = await apiClient.post<ClanJoinRequest>(
      `/api/clans/join-requests/${requestId}/reject/`
    );
    return response.data;
  },

  getClanMessages: async (clanId: number): Promise<ClanMessage[]> => {
    const response = await apiClient.get<ClanMessage[] | { results: ClanMessage[] }>(
      `/api/clans/messages/?clan=${clanId}`
    );
    return unwrapListResponse(response.data);
  },

  sendClanMessage: async (clanId: number, content: string): Promise<ClanMessage> => {
    const response = await apiClient.post<ClanMessage>('/api/clans/messages/', {
      clan: clanId,
      content,
    });
    return response.data;
  },

  searchClans: async (query: string): Promise<Clan[]> => {
    const response = await apiClient.get<Clan[] | { results: Clan[] }>(
      `/api/clans/clans/?search=${encodeURIComponent(query)}`
    );
    return unwrapListResponse(response.data);
  },

  getActivities: async (): Promise<Activity[]> => {
    const response = await apiClient.get<ActivityLog[]>('/api/activities/logs/');
    const logs = unwrapListResponse(response.data);
    return logs.map((log) => ({
      id: log.id,
      type: log.status === 'completed' ? 'quest_complete' : 'friend_achievement',
      title: log.activity_title?.trim() || `Задача #${log.activity}`,
      message: log.notes?.trim() || '',
      timestamp: log.completed_at || log.created_at,
      icon: log.status,
    }));
  },

  getLeaderboard: async (): Promise<any[]> => {
    const response = await apiClient.get<User[] | { results: User[] }>('/api/users/?page_size=1000');
    const users = unwrapListResponse(response.data);
    return users.sort((a, b) => (b.level ?? 0) - (a.level ?? 0)).slice(0, 10);
  },
  getClanLeaders: async (): Promise<Clan[]> => {
    const response = await apiClient.get<Clan[] | { results: Clan[] }>('/api/clans/clans/');
    return unwrapListResponse(response.data);
  },
};

import { apiClient } from './client';
import { Friend, Clan, Activity } from '../types';

export interface User {
  id: number;
  username: string;
  level: number;
  email?: string;
}

export interface ClanCreateData {
  name: string;
  description?: string;
}

interface ActivityLog {
  id: number;
  activity: number;
  notes?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string | null;
}

export const socialAPI = {
  getFriends: async (): Promise<Friend[]> => {
    const response = await apiClient.get<Friend[]>('/api/friends/');
    return response.data;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/api/users/?search=${encodeURIComponent(query)}`);
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

  createClan: async (data: ClanCreateData): Promise<Clan> => {
    const response = await apiClient.post<Clan>('/api/clans/clans/', data);
    return response.data;
  },

  joinClan: async (clanId: number): Promise<void> => {
    await apiClient.post('/api/clans/members/', { clan: clanId });
  },

  searchClans: async (query: string): Promise<Clan[]> => {
    const response = await apiClient.get<Clan[]>(`/api/clans/clans/?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  getActivities: async (): Promise<Activity[]> => {
    const response = await apiClient.get<ActivityLog[]>('/api/activities/logs/');
    const logs = Array.isArray(response.data) ? response.data : [];
    return logs.map((log) => ({
      id: log.id,
      type: log.status === 'completed' ? 'quest_complete' : 'friend_achievement',
      message: log.notes?.trim() || `Задача #${log.activity} ${log.status === 'completed' ? 'выполнена' : 'создана'}`,
      timestamp: log.completed_at || log.created_at,
      icon: log.status,
    }));
  },

  getLeaderboard: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/api/leaderboard/');
    return response.data;
  },
};

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

export const socialAPI = {
  getFriends: async (): Promise<Friend[]> => {
    const response = await apiClient.get<Friend[]>('/friends/');
    return response.data;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/users/?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  addFriend: async (userId: number): Promise<void> => {
    await apiClient.post(`/friends/`, { user_id: userId });
  },

  getClan: async (): Promise<Clan | null> => {
    try {
      const response = await apiClient.get<Clan>('/clan/');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  createClan: async (data: ClanCreateData): Promise<Clan> => {
    const response = await apiClient.post<Clan>('/clans/clans/', data);
    return response.data;
  },

  joinClan: async (clanId: number): Promise<void> => {
    await apiClient.post('/clans/members/', { clan: clanId });
  },

  searchClans: async (query: string): Promise<Clan[]> => {
    const response = await apiClient.get<Clan[]>(`/clans/clans/?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  getActivities: async (): Promise<Activity[]> => {
    const response = await apiClient.get<Activity[]>('/activities/');
    return response.data;
  },

  getLeaderboard: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/leaderboard/');
    return response.data;
  },
};

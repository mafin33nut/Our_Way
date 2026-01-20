import { apiClient } from './client';
import { Quest, QuestCreate, ClanQuest } from '../types';

export const questsAPI = {
  getAll: async (): Promise<Quest[]> => {
    const response = await apiClient.get<Quest[]>('/quests/');
    return response.data;
  },

  getById: async (id: number): Promise<Quest> => {
    const response = await apiClient.get<Quest>(`/quests/${id}/`);
    return response.data;
  },

  generateByFocus: async (focus: string): Promise<Quest[]> => {
    const response = await apiClient.post<Quest[]>('/quests/generate/', { focus });
    return response.data;
  },

  complete: async (id: number): Promise<Quest> => {
    const response = await apiClient.post<Quest>(`/quests/${id}/complete/`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/quests/${id}/`);
  },
};

export const clanQuestsAPI = {
  getAll: async (): Promise<ClanQuest[]> => {
    const response = await apiClient.get<ClanQuest[]>('/clan-quests/');
    return response.data;
  },

  contribute: async (id: number, contribution: number): Promise<ClanQuest> => {
    const response = await apiClient.post<ClanQuest>(`/clan-quests/${id}/contribute/`, {
      contribution,
    });
    return response.data;
  },
};
export const timersAPI = {
  startTimer: async (activityId?: number) => {
    const payload = activityId ? { activity: activityId } : {};
    const response = await apiClient.post('/activities/timers/start/', payload);
    return response.data; // expected ActivityTimer object
  },

  stopTimer: async (timerId: number) => {
    const response = await apiClient.post(`/activities/timers/${timerId}/stop/`);
    return response.data; // updated ActivityTimer object
  },
};
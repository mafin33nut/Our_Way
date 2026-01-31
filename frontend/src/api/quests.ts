import { apiClient, unwrapListResponse } from './client';
import { Quest, QuestCreate, ClanQuest, QuestStep, UserFocus } from '../types';

export const questsAPI = {
  getAll: async (): Promise<Quest[]> => {
    const response = await apiClient.get<Quest[] | { results: Quest[] }>(
      '/api/activities/quests/'
    );
    return unwrapListResponse(response.data);
  },

  getById: async (id: number): Promise<Quest> => {
    const response = await apiClient.get<Quest>(`/api/activities/quests/${id}/`);
    return response.data;
  },

  complete: async (id: number): Promise<Quest> => {
    const response = await apiClient.post<Quest>(`/api/activities/quests/${id}/complete/`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/activities/quests/${id}/`);
  },

  create: async (payload: QuestCreate): Promise<Quest> => {
    const response = await apiClient.post<Quest>(`/api/activities/quests/`, payload);
    return response.data;
  },
};

export const clanQuestsAPI = {
  getAll: async (): Promise<ClanQuest[]> => {
    const response = await apiClient.get<ClanQuest[] | { results: ClanQuest[] }>(
      '/api/clans/quests/'
    );
    return unwrapListResponse(response.data);
  },

  contribute: async (id: number, contribution: number): Promise<ClanQuest> => {
    const response = await apiClient.post<ClanQuest>(`/api/clans/quests/${id}/contribute/`, {
      contribution,
    });
    return response.data;
  },

  generate: async (): Promise<ClanQuest[]> => {
    const response = await apiClient.post<ClanQuest[]>(`/api/clans/quests/generate/`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/clans/quests/${id}/`);
  },
};
export const timersAPI = {
  startTimer: async (activityId?: number) => {
    const payload = activityId ? { activity: activityId } : {};
    const response = await apiClient.post('/api/activities/timers/start/', payload);
    return response.data;
  },

  stopTimer: async (timerId: number) => {
    const response = await apiClient.post(`/api/activities/timers/${timerId}/stop/`);
    return response.data;
  },
};

export const focusesAPI = {
  getAll: async (): Promise<UserFocus[]> => {
    const response = await apiClient.get<UserFocus[] | { results: UserFocus[] }>(
      '/api/activities/focuses/'
    );
    return unwrapListResponse(response.data);
  },
  create: async (name: string): Promise<UserFocus> => {
    const response = await apiClient.post<UserFocus>('/api/activities/focuses/', { name });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/activities/focuses/${id}/`);
  },
};

export const questStepsAPI = {
  complete: async (id: number): Promise<QuestStep> => {
    const response = await apiClient.post<QuestStep>(`/api/activities/quest-steps/${id}/complete/`);
    return response.data;
  },
};
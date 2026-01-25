import { apiClient } from './client';
import { User, AuthTokens, LoginCredentials, RegisterData } from '../types';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    try {
      console.log('Sending login request with:', { username: credentials.username, password: '***' });
      const response = await apiClient.post<AuthTokens>('/auth/token/', {
        username: credentials.username,
        password: credentials.password,
      });
      console.log('Login response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register/', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/user/');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout/');
  },
};
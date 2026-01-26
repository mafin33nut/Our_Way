import { apiClient } from './client';
import { User, AuthTokens, LoginCredentials, RegisterData } from '../types';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    try {
      console.log('Sending login request with:', { username: credentials.username, password: '***' });
      
      // Ensure we're sending proper JSON
      const response = await apiClient.post<AuthTokens>(
        '/auth/token/',
        {
          username: credentials.username.trim(),
          password: credentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Login response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Request config:', error.config);
      
      // If we get HTML back, it's likely a Django error page
      if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!doctype html>')) {
        const errorMsg = new Error('Backend returned an error page. Check server logs.');
        (errorMsg as any).response = error.response;
        throw errorMsg;
      }
      
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

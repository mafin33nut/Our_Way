import { apiClient } from './client';
import { User, AuthTokens, LoginCredentials, RegisterData } from '../types';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    try {
      console.log('Sending login request with:', { username: credentials.username, password: '***' });
      
      // Ensure we're sending proper JSON
      const response = await apiClient.post<AuthTokens>(
        '/api/auth/token/',
        {
          username: credentials.username.trim(),
          password: credentials.password,
        },
        {
          timeout: 20000,
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
    try {
      const response = await apiClient.post<User>('/api/auth/register/', {
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password,
        password2: data.password2,
      });
      return response.data;
    } catch (error: any) {
      console.error('Register API error:', error?.response?.status, error?.response?.data);
      throw error;
    }
  },

  requestPasswordReset: async (email: string): Promise<{ detail: string }> => {
    const response = await apiClient.post<{ detail: string }>('/api/auth/password-reset/request/', {
      email: email.trim(),
    });
    return response.data;
  },

  confirmPasswordReset: async (payload: {
    email: string;
    code: string;
    password: string;
    password2: string;
  }): Promise<{ detail: string }> => {
    const response = await apiClient.post<{ detail: string }>('/api/auth/password-reset/confirm/', {
      email: payload.email.trim(),
      code: payload.code.trim(),
      password: payload.password,
      password2: payload.password2,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/user/', { timeout: 20000 });
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await apiClient.post('/api/auth/logout/', { refresh: refreshToken });
      } catch (err) {
        console.error('Logout API error:', err);
      }
    }
  },

  updateProfile: async (formData: FormData): Promise<User> => {
    const response = await apiClient.patch<User>('/api/auth/user/', formData, {
      transformRequest: (data, headers) => {
        if (headers) {
          delete (headers as Record<string, string>)['Content-Type'];
        }
        return data;
      },
    });
    return response.data;
  },
};

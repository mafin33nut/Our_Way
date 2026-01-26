import { apiClient } from './client';
import { User, AuthTokens, LoginCredentials, RegisterData } from '../types';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    try {
      console.log('Sending login request with:', {
        username: credentials.username,
        password: '***',
      });

      // отправляем JSON на правильный URL /api/auth/token/
      const response = await apiClient.post<AuthTokens>(
        '/api/auth/token/',
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
      // axios-ошибка?
      if (error.response) {
        const { status, data } = error.response;
        console.error('Login API error:', status, data);

        // если backend вернул HTML‑страницу с 400
        if (typeof data === 'string' && data.includes('<!doctype html')) {
          throw new Error('Сервер вернул ошибку 400 (Bad Request). Проверьте лог сервера.');
        }

        // если DRF / SimpleJWT вернули JSON, пробуем достать сообщение
        if (typeof data === 'object') {
          // SimpleJWT при неверном пароле часто шлёт:
          // { "detail": "No active account found with the given credentials" }
          if (data.detail) {
            throw new Error(String(data.detail));
          }
        }

        // общее сообщение
        throw new Error(`Ошибка авторизации (${status}).`);
      }

      console.error('Login unknown error:', error);
      throw new Error('Не удалось выполнить запрос авторизации.');
    }
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post<User>('/api/auth/register/', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/user/');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout/');
  },
};
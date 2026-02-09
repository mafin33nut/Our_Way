import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// Берём базовый URL из Vite-окружения. Если не задан, используем текущий hostname и порт 8000.
// Это соответствует схеме деплоя: фронт на :443, бек на :8000.
const RUNTIME_DEFAULT_BASE_URL =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://127.0.0.1:8000';

const BASE_URL = import.meta.env.VITE_API_URL ?? RUNTIME_DEFAULT_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL, // БЕЗ /api здесь
  headers: {
    'Content-Type': 'application/json',
  },
});

type PaginatedResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};

export function unwrapListResponse<T>(data: T[] | PaginatedResponse<T> | undefined | null): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.results ?? [];
}

// Расширяем тип конфигурации, чтобы добавить флаг _retry
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Request interceptor — добавляет access token, если есть
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — пытается обновить токен при 401 (если есть refresh)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const responseStatus = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (responseStatus === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const resp = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const access = (resp.data as any)?.access;
        if (access) {
          localStorage.setItem('access_token', access);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${access}`;

          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../api/auth';
import { User, LoginCredentials } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const userData = await authAPI.getCurrentUser();
          if (mounted) setUser(userData);
        }
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const tokens = await authAPI.login(credentials);
    if (tokens?.access) {
      localStorage.setItem('access_token', tokens.access);
      if ((tokens as any).refresh) {
        localStorage.setItem('refresh_token', (tokens as any).refresh);
      }
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } else {
      throw new Error('No tokens received');
    }
  };

  const logout = () => {
    authAPI.logout().finally(() => {
      setUser(null);
      window.location.href = '/login';
    });
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
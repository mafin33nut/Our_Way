import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../api/auth';
import { User, LoginCredentials, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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
    try {
      const tokens = await authAPI.login(credentials);
      console.log('Login tokens received:', tokens ? 'Yes' : 'No');
      
      if (tokens?.access) {
        localStorage.setItem('access_token', tokens.access);
        if ((tokens as any).refresh) {
          localStorage.setItem('refresh_token', (tokens as any).refresh);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          console.log('Fetching user data...');
          const userData = await authAPI.getCurrentUser();
          console.log('User data received:', userData);
          setUser(userData);
        } catch (userErr: any) {
          console.error('Failed to get user data after login:', userErr);
          console.error('Error response:', userErr.response);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          const errorMsg = userErr.response?.data?.detail 
            || userErr.response?.data?.message
            || userErr.message 
            || 'Failed to get user information. Please try again.';
          throw new Error(errorMsg);
        }
      } else {
        throw new Error('No tokens received from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message) {
        throw err;
      }
      throw new Error(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const userData = await authAPI.register(data);
      await login({ username: data.username, password: data.password });
    } catch (err: any) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      window.location.href = '/login';
    }
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
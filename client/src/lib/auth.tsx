import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './queryClient';

export interface User {
  id: number;
  username: string;
  displayName?: string | null;
  birthday?: string | null;
  bio?: string | null;
  themeColor?: string | null;
  isPrivate?: boolean | null;
  customMessage?: string | null;
  viewCount?: number | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName?: string, birthday?: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const response = await apiRequest<{ user: User | null }>('/api/auth/me');
      return response.user;
    },
    retry: false,
  });

  const user = userData || null;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      return response.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({
      username,
      password,
      displayName,
      birthday,
    }: {
      username: string;
      password: string;
      displayName?: string;
      birthday?: string;
    }) => {
      const response = await apiRequest<{ user: User }>('/api/auth/register', {
        method: 'POST',
        body: { username, password, displayName, birthday },
      });
      return response.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.clear();
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const register = async (username: string, password: string, displayName?: string, birthday?: string) => {
    await registerMutation.mutateAsync({ username, password, displayName, birthday });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refetchUser: refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

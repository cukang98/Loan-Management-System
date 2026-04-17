'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { setAccessToken, clearAuth } from '@/lib/auth';
import api from '@/lib/axios';

export interface UserGroup {
  id: string;
  name: string;
  isSuperAdmin: boolean;
  permissions: Array<{ module: string; action: string }>;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  userGroup: UserGroup | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const { accessToken, user: authUser } = res.data.data;
        setAccessToken(accessToken);
        setUser(authUser);
      } catch {
        // No valid session
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: authUser } = res.data.data;
    setAccessToken(accessToken);
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      if (!user?.userGroup) return false;
      if (user.userGroup.isSuperAdmin) return true;
      return user.userGroup.permissions.some(
        (p) => p.module === module && p.action === action,
      );
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { setAccessToken, clearAuth } from '@/lib/auth';
import { login as loginApi, logout as logoutApi, refreshToken } from '@/services/auth.api';

export type ActorType = 'USER' | 'LENDER';

export interface UserGroup {
  id: string;
  name: string;
  isSuperAdmin: boolean;
  permissions: Array<{ module: string; action: string }>;
}

export interface AuthUser {
  id: string;
  userId: string;
  email?: string | null;
  name: string;
  actorType: ActorType;
  userGroup: UserGroup | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
  isLender: boolean;
}

const LENDER_PERMISSIONS = [
  { module: 'loans', action: 'read' },
  { module: 'repayments', action: 'read' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { accessToken, user: authUser } = await refreshToken();
        setAccessToken(accessToken);
        setUser(authUser as AuthUser);
      } catch {
        // No valid session
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (userId: string, password: string) => {
    const { accessToken, user: authUser } = await loginApi({ userId, password });
    setAccessToken(accessToken);
    setUser(authUser as AuthUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      clearAuth();
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      if (!user) return false;

      if (user.actorType === 'LENDER') {
        return LENDER_PERMISSIONS.some((p) => p.module === module && p.action === action);
      }

      if (!user.userGroup) return false;
      if (user.userGroup.isSuperAdmin) return true;

      return user.userGroup.permissions.some(
        (p) => p.module === module && p.action === action,
      );
    },
    [user],
  );

  const isLender = user?.actorType === 'LENDER';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission, isLender }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error('useAuth must be used within AuthProvider');

  return ctx;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '@/features/auth/services/auth.service';
import { clearTokens, getTokens } from '@/features/auth/services/token-storage';
import { LoginResponse, User } from '@/features/auth/types';

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  setSession: (response: LoginResponse) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { accessToken } = await getTokens();
        if (accessToken) {
          const me = await authService.getMe();
          setUser(me);
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const setSession = (response: LoginResponse) => {
    setUser(response.user);
    authService
      .getMe()
      .then(setUser)
      .catch((e) => console.warn('Failed to load courier profile:', e));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) { }

    await clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

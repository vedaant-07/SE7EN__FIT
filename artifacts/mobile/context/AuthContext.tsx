import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getToken, setUnauthorizedHandler } from "../src/services/apiClient";
import * as authService from "../src/services/authService";
import type { User } from "../src/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) { setUser(null); return; }
      const me = await authService.getMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setUser(res.user);
  }, []);

  const handleRegister = useCallback(async (data: { name: string; email: string; phone: string; password: string }) => {
    const res = await authService.register(data);
    setUser(res.user);
    return res.user;
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading,
      isAuthenticated: !!user,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshUser,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

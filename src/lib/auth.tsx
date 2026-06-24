import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, clearTokens, getAccessToken, getRefreshToken, refreshAccessToken, setTokens } from "./api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: "user" | "technician") => Promise<void>;
  logout: () => Promise<void>;
  setSession: (accessToken: string, refreshToken: string, user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!getAccessToken() && getRefreshToken()) {
      await refreshAccessToken();
    }
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: me } = await api.me();
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const setSession = (accessToken: string, refreshToken: string, u: User) => {
    setTokens(accessToken, refreshToken);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setSession(data.accessToken, data.refreshToken, data.user);
  };

  const register = async (email: string, password: string, fullName: string, role: "user" | "technician" = "user") => {
    const data = await api.register(email, password, fullName, role);
    setSession(data.accessToken, data.refreshToken, data.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, clearLegacyTokens, refreshAccessToken } from "./api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: "user" | "technician") => Promise<{ devVerifyLink?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const { user } = await api.me();
    return user;
  } catch {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
    try {
      const { user } = await api.me();
      return user;
    } catch {
      return null;
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    clearLegacyTokens();
    const me = await fetchCurrentUser();
    setUser(me);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const { user: loggedIn } = await api.login(email, password);
    setUser(loggedIn);
  };

  const register = async (email: string, password: string, fullName: string, role: "user" | "technician" = "user") => {
    const data = await api.register(email, password, fullName, role);
    return { devVerifyLink: data.devVerifyLink };
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Cookies may already be cleared.
    }
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await fetchCurrentUser();
    setUser(me);
    return me;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

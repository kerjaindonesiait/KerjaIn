import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, refreshAccessToken } from "./api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: "user" | "technician") => Promise<{ devVerifyLink?: string }>;
  logout: () => Promise<void>;
  establishSession: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const { user: me } = await api.me();
      setUser(me);
    } catch {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        try {
          const { user: me } = await api.me();
          setUser(me);
          return;
        } catch {
          // fall through
        }
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const establishSession = (u: User) => {
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setUser(data.user);
  };

  const register = async (email: string, password: string, fullName: string, role: "user" | "technician" = "user") => {
    const data = await api.register(email, password, fullName, role);
    setUser(data.user);
    return { devVerifyLink: data.devVerifyLink };
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { user: me } = await api.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, establishSession, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

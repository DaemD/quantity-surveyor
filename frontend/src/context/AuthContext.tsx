import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe, login as apiLogin, register as apiRegister } from "@/api/auth";
import type { LoginPayload, RegisterPayload, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("qs_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("qs_token");
        localStorage.removeItem("qs_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (data: LoginPayload) => {
    const res = await apiLogin(data);
    localStorage.setItem("qs_token", res.access_token);
    localStorage.setItem("qs_user", JSON.stringify(res.user));
    setUser(res.user);
  };

  const register = async (data: RegisterPayload) => {
    const res = await apiRegister(data);
    localStorage.setItem("qs_token", res.access_token);
    localStorage.setItem("qs_user", JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("qs_token");
    localStorage.removeItem("qs_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

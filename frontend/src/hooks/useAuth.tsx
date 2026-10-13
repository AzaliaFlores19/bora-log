"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "@/types";
import * as authService from "@/services/auth.service";
import * as userService from "@/services/user.service";
import { getToken } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { username?: string; avatar_color?: string | null }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await userService.getMe();
        if (active) setUser(me);
      } catch {
        authService.signOut();
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await authService.signIn(email, password);
    setUser(session.user);
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const session = await authService.signUp(email, password, username);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    authService.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: { username?: string; avatar_color?: string | null }) => {
      if (!user) return;
      const updated = await userService.updateProfile(user.id, {
        name: updates.username,
        avatarColor: updates.avatar_color,
      });
      setUser(updated);
    },
    [user],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) return;
      await userService.changePassword(user.id, newPassword, currentPassword);
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import type { Session } from "@/types";
import { colorFromSeed } from "@/lib/avatar-colors";

// ===== Auth Service =====
// Local (localStorage) implementation used while the API is not wired yet.
// Signatures are kept close to the future HTTP client so swapping is trivial.

const STORAGE_KEY = "boralog_session";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function signUp(email: string, password: string, username: string): Promise<Session> {
  await delay(600);
  if (!email || !password) throw new Error("Email and password are required");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const session: Session = {
    user: {
      id: `user-${Date.now()}`,
      email,
      username: username || email.split("@")[0],
      avatar_color: colorFromSeed(email),
      role: "admin",
      created_at: new Date().toISOString(),
    },
    access_token: `mock-token-${Date.now()}`,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function signIn(email: string, _password: string): Promise<Session> {
  await delay(600);
  if (!email) throw new Error("Email is required");

  const isAdmin = email.toLowerCase().startsWith("admin");

  const session: Session = {
    user: {
      id: `user-${Date.now()}`,
      email,
      username: email.split("@")[0],
      avatar_color: colorFromSeed(email),
      role: isAdmin ? "admin" : "user",
      created_at: new Date().toISOString(),
    },
    access_token: `mock-token-${Date.now()}`,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function updateProfile(updates: {
  username?: string;
  avatar_color?: string | null;
}): Promise<Session> {
  await delay(500);
  const session = getSession();
  if (!session) throw new Error("Not authenticated");

  const updated: Session = {
    ...session,
    user: { ...session.user, ...updates },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function changePassword(_currentPassword: string, _newPassword: string): Promise<void> {
  await delay(600);
  if (!_currentPassword) throw new Error("Current password is required");
  if (!_newPassword || _newPassword.length < 6)
    throw new Error("New password must be at least 6 characters");
  if (_currentPassword === _newPassword)
    throw new Error("New password must be different from current password");
}

export async function signOut(): Promise<void> {
  await delay(200);
  localStorage.removeItem(STORAGE_KEY);
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

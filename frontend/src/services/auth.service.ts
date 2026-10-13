import { api, setToken, clearToken } from "@/lib/api";
import { mapUser } from "@/lib/mappers";
import type { Session, User } from "@/types";
import type { AuthResponseDto, UserDto } from "@/types/dto";

const DEFAULT_AVATAR_COLOR = "#a855f7";

export async function signIn(email: string, password: string): Promise<Session> {
  const { data } = await api.post<AuthResponseDto>("/api/auth/login", { email, password });
  setToken(data.token);
  return { user: mapUser(data.user), access_token: data.token };
}

export async function signUp(email: string, password: string, username: string): Promise<Session> {
  const { data } = await api.post<AuthResponseDto>("/api/auth/register", {
    name: username || email.split("@")[0],
    email,
    password,
    avatarColor: DEFAULT_AVATAR_COLOR,
  });
  setToken(data.token);
  return { user: mapUser(data.user), access_token: data.token };
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/api/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post("/api/auth/reset-password", { token, password });
}

export function signOut(): void {
  clearToken();
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<{ user: UserDto }>("/api/users/me");
  return mapUser(data.user);
}

import { api } from "@/lib/api";
import { mapUser } from "@/lib/mappers";
import type { User } from "@/types";
import type { UserDto } from "@/types/dto";

export async function getMe(): Promise<User> {
  const { data } = await api.get<{ user: UserDto }>("/api/users/me");
  return mapUser(data.user);
}

export async function updateProfile(
  id: string,
  updates: { name?: string; email?: string; avatarColor?: string | null },
): Promise<User> {
  const { data } = await api.patch<{ user: UserDto }>(`/api/users/${id}`, updates);
  return mapUser(data.user);
}

export async function changePassword(id: string, newPassword: string): Promise<void> {
  await api.patch(`/api/users/${id}/password`, { newPassword });
}

export async function deleteAccount(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`);
}

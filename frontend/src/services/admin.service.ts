import { api } from "@/lib/api";
import { mapAdminUser, mapUserShow } from "@/lib/mappers";
import type { AdminUser, PlatformShow, PlatformStats, ShowStatus, UserRole, UserShow } from "@/types";
import type { PlatformStatsDto, UserDto, UserShowDto } from "@/types/dto";

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<{ users: UserDto[] }>("/api/users");
  return data.users.map(mapAdminUser);
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const { data } = await api.get<{ stats: PlatformStatsDto }>("/api/users/stats");
  return data.stats;
}

interface AdminUpdate {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export async function updateUser(userId: string, updates: AdminUpdate): Promise<AdminUser> {
  const { data } = await api.patch<{ user: UserDto }>(`/api/users/${userId}/admin-update`, {
    name: updates.name,
    email: updates.email,
    role: updates.role ? updates.role.toUpperCase() : undefined,
    isActive: updates.isActive,
  });
  return mapAdminUser(data.user);
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/api/users/${userId}`);
}

/** Permanent delete (admin only). */
export async function purgeUser(userId: string): Promise<void> {
  await api.delete(`/api/users/${userId}`, { params: { hard: true } });
}

export async function fetchUserShowsById(userId: string): Promise<UserShow[]> {
  const { data } = await api.get<{ userShows: UserShowDto[] }>(`/api/shows/user-list/${userId}`);
  return data.userShows.map(mapUserShow);
}

export async function fetchAllPlatformShows(): Promise<PlatformShow[]> {
  const { data } = await api.get<{ allShows: UserShowDto[] }>("/api/users/shows/all");

  const byShow = new Map<string, PlatformShow>();
  for (const dto of data.allShows) {
    let entry = byShow.get(dto.show_id);
    if (!entry) {
      entry = { show: mapUserShow(dto).show, tracking_count: 0, avg_rating: null, watchers: [] };
      byShow.set(dto.show_id, entry);
    }
    entry.tracking_count += 1;
    entry.watchers.push({
      username: dto.user?.name ?? "unknown",
      status: (dto.status ?? "plan_to_watch") as ShowStatus,
      rating: dto.rating,
    });
  }

  const result = Array.from(byShow.values());
  for (const ps of result) {
    const rated = ps.watchers.filter((w) => w.rating !== null);
    ps.avg_rating =
      rated.length > 0 ? rated.reduce((sum, w) => sum + (w.rating ?? 0), 0) / rated.length : null;
  }
  return result.sort((a, b) => b.tracking_count - a.tracking_count);
}

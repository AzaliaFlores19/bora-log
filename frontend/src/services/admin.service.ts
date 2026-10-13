import type { AdminUser, PlatformStats, UserShow, PlatformShow } from "@/types";
import { mockUserShows } from "@/lib/mock-data";

// ===== Admin Service =====
// Local mock data source for the admin dashboard. Will be replaced by API calls.

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockAdminUsers: AdminUser[] = [
  { id: "u1", email: "alice@example.com", username: "alice", avatar_url: null, role: "admin", is_active: true, created_at: new Date(Date.now() - 90 * 86400000).toISOString(), show_count: 47 },
  { id: "u2", email: "bob@example.com", username: "bob_cinema", avatar_url: null, role: "user", is_active: true, created_at: new Date(Date.now() - 60 * 86400000).toISOString(), show_count: 23 },
  { id: "u3", email: "carol@example.com", username: "carol_tv", avatar_url: null, role: "user", is_active: true, created_at: new Date(Date.now() - 45 * 86400000).toISOString(), show_count: 89 },
  { id: "u4", email: "dave@example.com", username: "dave_watcher", avatar_url: null, role: "user", is_active: false, created_at: new Date(Date.now() - 30 * 86400000).toISOString(), show_count: 12 },
  { id: "u5", email: "eve@example.com", username: "eve_binge", avatar_url: null, role: "user", is_active: true, created_at: new Date(Date.now() - 15 * 86400000).toISOString(), show_count: 156 },
  { id: "u6", email: "frank@example.com", username: "frank_flix", avatar_url: null, role: "user", is_active: true, created_at: new Date(Date.now() - 7 * 86400000).toISOString(), show_count: 5 },
  { id: "u7", email: "grace@example.com", username: "grace_shows", avatar_url: null, role: "user", is_active: false, created_at: new Date(Date.now() - 3 * 86400000).toISOString(), show_count: 34 },
];

export async function fetchAllUsers(): Promise<AdminUser[]> {
  await delay(600);
  return [...mockAdminUsers];
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  await delay(500);
  return {
    total_users: mockAdminUsers.length,
    total_shows: 248,
    total_entries: 366,
    watching_count: 89,
    completed_count: 142,
    plan_to_watch_count: 98,
    dropped_count: 37,
  };
}

export async function updateUserRole(userId: string, role: "admin" | "user"): Promise<void> {
  await delay(400);
  const user = mockAdminUsers.find((u) => u.id === userId);
  if (user) user.role = role;
}

export async function toggleUserActive(userId: string): Promise<boolean> {
  await delay(400);
  const user = mockAdminUsers.find((u) => u.id === userId);
  if (user) {
    user.is_active = !user.is_active;
    return user.is_active;
  }
  return false;
}

export async function updateUserProfile(
  userId: string,
  updates: { username?: string; email?: string; role?: "admin" | "user" },
): Promise<void> {
  await delay(400);
  const user = mockAdminUsers.find((u) => u.id === userId);
  if (user) {
    if (updates.username !== undefined) user.username = updates.username;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.role !== undefined) user.role = updates.role;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  await delay(400);
  const idx = mockAdminUsers.findIndex((u) => u.id === userId);
  if (idx !== -1) mockAdminUsers.splice(idx, 1);
}

export async function fetchUserShowsById(userId: string): Promise<UserShow[]> {
  await delay(500);
  const u = mockAdminUsers.find((x) => x.id === userId);
  if (!u) return [];
  const count = Math.min(u.show_count, mockUserShows.length * 3);
  return Array.from({ length: count }, (_, i) => {
    const base = mockUserShows[i % mockUserShows.length];
    return {
      ...base,
      id: `${userId}-us-${i}`,
      user_id: userId,
    } as UserShow;
  });
}

export async function fetchAllPlatformShows(): Promise<PlatformShow[]> {
  await delay(600);
  // Build a map of show_id -> watchers from all mock user shows
  const showMap = new Map<string, PlatformShow>();

  mockUserShows.forEach((us) => {
    const showId = us.show_id;
    if (!showMap.has(showId)) {
      showMap.set(showId, {
        show: us.show,
        tracking_count: 0,
        avg_rating: null,
        watchers: [],
      });
    }
    const entry = showMap.get(showId)!;
    entry.tracking_count++;
    if (us.rating !== null) entry.watchers.push({ username: "", status: us.status, rating: us.rating });
  });

  // Distribute watchers across mock users for display
  const result = Array.from(showMap.values());
  const usernames = mockAdminUsers.map((u) => u.username);
  result.forEach((ps, idx) => {
    const ratedWatchers = ps.watchers.filter((w) => w.rating !== null);
    const avg =
      ratedWatchers.length > 0
        ? ratedWatchers.reduce((sum, w) => sum + (w.rating ?? 0), 0) / ratedWatchers.length
        : null;
    ps.avg_rating = avg;
    // Assign random-ish usernames from our mock users
    ps.watchers = ps.watchers.map((w, i) => ({
      ...w,
      username: usernames[(idx + i) % usernames.length],
    }));
  });

  return result.sort((a, b) => b.tracking_count - a.tracking_count);
}

import type { Show, UserShow, ShowStatus, Mood, TimeCommit } from "@/types";
import { mockShows, mockUserShows } from "@/lib/mock-data";

// ===== Shows Service =====
// Local mock data source. Will be replaced by calls to the Bora-Log API.

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchUserShows(): Promise<UserShow[]> {
  await delay(500);
  return [...mockUserShows];
}

export async function fetchShowById(showId: string): Promise<Show | null> {
  await delay(300);
  return mockShows.find((s) => s.id === showId) ?? null;
}

export async function fetchUserShowById(showId: string): Promise<UserShow | null> {
  await delay(300);
  return mockUserShows.find((us) => us.show_id === showId) ?? null;
}

export interface AddShowInput {
  show: Show;
  status: ShowStatus;
  rating: number | null;
  moods: Mood[];
  time_commit: TimeCommit | null;
}

export async function addUserShow(input: AddShowInput): Promise<UserShow> {
  await delay(500);
  const newUserShow: UserShow = {
    id: `us-${Date.now()}`,
    user_id: "mock-user-1",
    show_id: input.show.id,
    status: input.status,
    rating: input.rating,
    moods: input.moods,
    time_commit: input.time_commit,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    show: input.show,
  };
  return newUserShow;
}

export async function updateUserShow(
  userShowId: string,
  updates: Partial<Pick<UserShow, "status" | "rating" | "moods" | "time_commit">>,
): Promise<UserShow> {
  await delay(400);
  const existing = mockUserShows.find((us) => us.id === userShowId);
  if (!existing) throw new Error("Show not found in your log");
  return {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  };
}

export async function removeUserShow(userShowId: string): Promise<void> {
  await delay(300);
  const idx = mockUserShows.findIndex((us) => us.id === userShowId);
  if (idx !== -1) {
    mockUserShows.splice(idx, 1);
  }
}

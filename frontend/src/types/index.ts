// ===== Core Domain Types =====

export type MediaType = "movie" | "tv";

export type ShowStatus = "watching" | "completed" | "plan_to_watch" | "dropped";

export type TimeCommit = "around_30_min" | "between_1_and_3_hours" | "binge";

export type Mood =
  | "happy"
  | "sad"
  | "nerdy"
  | "adventurous"
  | "romantic"
  | "thrilled"
  | "cozy"
  | "thoughtful";

export interface Show {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  media_type: MediaType;
  release_date: string | null;
  runtime: number | null;
  number_of_episodes: number | null;
  number_of_seasons: number | null;
  genres: string[];
  vote_average: number | null;
  created_at: string;
}

export interface UserShow {
  id: string;
  user_id: string;
  show_id: string;
  status: ShowStatus;
  rating: number | null;
  moods: Mood[];
  time_commit: TimeCommit | null;
  created_at: string;
  updated_at: string;
  show: Show;
}

export interface TMDBSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  media_type: MediaType;
  release_date: string | null;
  vote_average: number | null;
  genre_ids: number[];
}

// ===== Auth Types =====

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Session {
  user: User;
  access_token: string;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  show_count: number;
}

export interface PlatformShow {
  show: Show;
  tracking_count: number;
  avg_rating: number | null;
  watchers: Array<{ username: string; status: ShowStatus; rating: number | null }>;
}

export interface PlatformStats {
  total_users: number;
  total_shows: number;
  total_entries: number;
  watching_count: number;
  completed_count: number;
  plan_to_watch_count: number;
  dropped_count: number;
}

// ===== Theme Types =====

export type ThemeName = "purple" | "ocean" | "forest" | "sunset" | "rose" | "mono";

export interface ThemeOption {
  name: ThemeName;
  label: string;
  swatch: string;
}

// ===== UI Types =====

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

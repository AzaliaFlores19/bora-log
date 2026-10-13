// ===== API DTOs (shapes returned by the backend) =====

export interface UserDto {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  avatarColor: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  show_count?: number;
}

export interface AuthResponseDto {
  message?: string;
  user: UserDto;
  token: string;
}

export interface ShowDto {
  id: string;
  external_id: string;
  title: string;
  description: string | null;
  mediaType: "movie" | "tv";
  imageUrl: string | null;
  duration: number | null;
  totalEpisodes: number | null;
  releaseDate: string | null;
}

export interface UserShowDto {
  id: string;
  user_id: string;
  show_id: string;
  status: "watching" | "completed" | "plan_to_watch" | "dropped" | null;
  rating: number | null;
  mood: string[];
  time_commit: "around_30_min" | "between_1_and_3_hours" | "binge" | null;
  createdAt: string;
  show: ShowDto;
  user?: { name: string; email: string };
}

export interface SearchResultDto {
  external_id: string;
  title: string;
  description: string | null;
  poster_path: string | null;
  mediaType: "movie" | "tv";
  releaseDate: string | null;
}

export interface PlatformStatsDto {
  total_users: number;
  total_shows: number;
  total_entries: number;
  watching_count: number;
  completed_count: number;
  plan_to_watch_count: number;
  dropped_count: number;
}

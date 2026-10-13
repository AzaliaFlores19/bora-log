import type {
  AdminUser,
  Mood,
  Show,
  ShowStatus,
  TimeCommit,
  TMDBSearchResult,
  User,
  UserShow,
} from "@/types";
import type { SearchResultDto, ShowDto, UserDto, UserShowDto } from "@/types/dto";

// ===== Backend DTO -> app domain =====

export function mapUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.name,
    avatar_color: dto.avatarColor,
    role: dto.role === "ADMIN" ? "admin" : "user",
    created_at: dto.createdAt,
  };
}

export function mapAdminUser(dto: UserDto): AdminUser {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.name,
    role: dto.role === "ADMIN" ? "admin" : "user",
    is_active: dto.isActive,
    created_at: dto.createdAt,
    show_count: dto.show_count ?? 0,
  };
}

export function mapShow(dto: ShowDto): Show {
  return {
    id: dto.id,
    tmdb_id: Number(dto.external_id),
    title: dto.title,
    poster_path: dto.imageUrl,
    backdrop_path: null,
    overview: dto.description,
    media_type: dto.mediaType,
    release_date: dto.releaseDate,
    runtime: dto.duration,
    number_of_episodes: dto.totalEpisodes,
    number_of_seasons: null,
    genres: [],
    vote_average: null,
    created_at: "",
  };
}

export function mapUserShow(dto: UserShowDto): UserShow {
  return {
    id: dto.id,
    user_id: dto.user_id,
    show_id: dto.show_id,
    status: (dto.status ?? "plan_to_watch") as ShowStatus,
    rating: dto.rating,
    moods: dto.mood as Mood[],
    time_commit: dto.time_commit as TimeCommit | null,
    created_at: dto.createdAt,
    updated_at: dto.createdAt,
    show: mapShow(dto.show),
  };
}

export function mapSearchResult(dto: SearchResultDto): TMDBSearchResult {
  return {
    id: Number(dto.external_id),
    title: dto.title,
    poster_path: dto.poster_path,
    backdrop_path: null,
    overview: dto.description,
    media_type: dto.mediaType,
    release_date: dto.releaseDate,
    vote_average: null,
    genre_ids: [],
  };
}

// ===== App domain -> backend request =====

export function toShowData(show: Show) {
  return {
    external_id: String(show.tmdb_id),
    title: show.title,
    description: show.overview,
    mediaType: show.media_type,
    imageUrl: show.poster_path,
    duration: show.runtime,
    totalEpisodes: show.number_of_episodes,
    releaseDate: show.release_date,
  };
}

export interface UserShowInput {
  status: ShowStatus;
  rating: number | null;
  moods: Mood[];
  time_commit: TimeCommit | null;
}

export function toUserShowData(data: UserShowInput) {
  return {
    status: data.status,
    rating: data.rating,
    mood: data.moods,
    time_commit: data.time_commit,
  };
}

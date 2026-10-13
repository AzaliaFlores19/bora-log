import { api } from "@/lib/api";
import {
  mapSearchResult,
  mapShow,
  mapUserShow,
  toShowData,
  toUserShowData,
  type UserShowInput,
} from "@/lib/mappers";
import type { Show, ShowStatus, Mood, TimeCommit, TMDBSearchResult, UserShow } from "@/types";
import type { SearchResultDto, ShowDto, UserShowDto } from "@/types/dto";

export interface ShowsFilter {
  status?: ShowStatus;
  time_commit?: TimeCommit;
  mood?: Mood | Mood[];
}

export async function searchShows(query: string): Promise<TMDBSearchResult[]> {
  const { data } = await api.get<{ results: SearchResultDto[] }>("/api/shows/search", {
    params: { title: query },
  });
  return data.results.map(mapSearchResult);
}

export async function fetchTrending(): Promise<TMDBSearchResult[]> {
  const { data } = await api.get<{ results: SearchResultDto[] }>("/api/shows/trending");
  return data.results.map(mapSearchResult);
}

export async function fetchExternalDetails(id: string | number, mediaType: string): Promise<Show> {
  const { data } = await api.get<ShowDto>(`/api/shows/external-show-details/${id}/${mediaType}`);
  return mapShow(data);
}

export async function fetchUserShows(userId: string, filters?: ShowsFilter): Promise<UserShow[]> {
  const { data } = await api.get<{ userShows: UserShowDto[] }>(`/api/shows/user-list/${userId}`, {
    params: filters,
  });
  return data.userShows.map(mapUserShow);
}

export async function fetchUserShowById(userShowId: string): Promise<UserShow> {
  const { data } = await api.get<UserShowDto>(`/api/shows/show-details/${userShowId}`);
  return mapUserShow(data);
}

export interface AddShowInput extends UserShowInput {
  show: Show;
}

export async function addUserShow(input: AddShowInput): Promise<UserShow> {
  const { data } = await api.post<{ userShow: UserShowDto }>("/api/shows/add-list", {
    showData: toShowData(input.show),
    userShowData: toUserShowData(input),
  });
  return mapUserShow(data.userShow);
}

export async function updateUserShow(
  userShowId: string,
  updates: Partial<UserShowInput>,
): Promise<void> {
  await api.patch(`/api/shows/update-list/${userShowId}`, {
    status: updates.status,
    rating: updates.rating,
    mood: updates.moods,
    time_commit: updates.time_commit,
  });
}

export async function removeUserShow(userShowId: string): Promise<void> {
  await api.delete(`/api/shows/remove-list/${userShowId}`);
}

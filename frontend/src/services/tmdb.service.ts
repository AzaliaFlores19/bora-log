import type { TMDBSearchResult, Show } from "@/types";
import { mockSearchResults, mockShows } from "@/lib/mock-data";

// ===== TMDB Service =====
// Local mock data source. The real search/detail calls will go through the API.

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchShows(query: string): Promise<TMDBSearchResult[]> {
  await delay(500);
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return mockSearchResults.filter((r) => r.media_type === "tv" && r.title.toLowerCase().includes(q));
}

export async function fetchTrending(): Promise<TMDBSearchResult[]> {
  await delay(600);
  return mockSearchResults.filter((r) => r.media_type === "tv").slice(0, 8);
}

export async function fetchDetailsById(tmdbId: number, mediaType: "movie" | "tv"): Promise<Show | null> {
  await delay(400);
  const fromMock = mockShows.find((s) => s.tmdb_id === tmdbId);
  if (fromMock) return fromMock;
  const fromSearch = mockSearchResults.find((r) => r.id === tmdbId);
  if (!fromSearch) return null;
  return {
    id: `show-tmdb-${tmdbId}`,
    tmdb_id: tmdbId,
    title: fromSearch.title,
    poster_path: fromSearch.poster_path,
    backdrop_path: fromSearch.backdrop_path,
    overview: fromSearch.overview,
    media_type: mediaType,
    release_date: fromSearch.release_date,
    runtime: mediaType === "movie" ? 120 : null,
    number_of_episodes: mediaType === "tv" ? 10 : null,
    number_of_seasons: mediaType === "tv" ? 1 : null,
    genres: [],
    vote_average: fromSearch.vote_average,
    created_at: new Date().toISOString(),
  };
}

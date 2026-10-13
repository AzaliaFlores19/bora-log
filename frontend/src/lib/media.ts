import type { Show, TMDBSearchResult } from "@/types";

// Return the real image URL or null; rendering/fallback is handled by <Artwork />.

export function posterSrc(show: Pick<Show, "poster_path">): string | null {
  return show.poster_path || null;
}

export function backdropSrc(show: Pick<Show, "backdrop_path">): string | null {
  return show.backdrop_path || null;
}

export function searchPosterSrc(result: Pick<TMDBSearchResult, "poster_path">): string | null {
  return result.poster_path || null;
}

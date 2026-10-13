import type { Show, TMDBSearchResult } from "@/types";

// Neutral SVG placeholders (no external stock images).
const POSTER_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="342" height="513" viewBox="0 0 342 513"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#241f33"/><stop offset="1" stop-color="#15121d"/></linearGradient></defs><rect width="342" height="513" fill="url(#g)"/><g fill="none" stroke="#4b4066" stroke-width="7"><rect x="111" y="212" width="120" height="90" rx="12"/><path d="M111 246h120M135 212v-14M207 212v-14"/></g></svg>`,
  );

const BACKDROP_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#241f33"/><stop offset="1" stop-color="#15121d"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/></svg>`,
  );

export function posterUrl(show: Pick<Show, "poster_path">): string {
  return show.poster_path || POSTER_PLACEHOLDER;
}

export function backdropUrl(show: Pick<Show, "backdrop_path" | "poster_path">): string {
  return show.backdrop_path || show.poster_path || BACKDROP_PLACEHOLDER;
}

export function searchPosterUrl(result: Pick<TMDBSearchResult, "poster_path">): string {
  return result.poster_path || POSTER_PLACEHOLDER;
}

import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const isTrackable = (item: any) => item.media_type === "movie" || item.media_type === "tv";

const mapResult = (item: any, fallbackType?: "movie" | "tv") => ({
  external_id: item.id.toString(),
  title: item.title || item.name,
  description: item.overview,
  poster_path: item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : null,
  mediaType: item.media_type ?? fallbackType,
  releaseDate: item.release_date || item.first_air_date,
});

/**
 * Search TMDB. `mediaType` defaults to "tv" (the catalog is series-first);
 * "all" includes movies, "movie" restricts to movies. A "Movies" section can be
 * enabled later without any new endpoint.
 */
export const searchMulti = async (query: string, mediaType: string = "tv") => {
  const endpoint =
    mediaType === "movie" ? "search/movie" : mediaType === "all" ? "search/multi" : "search/tv";
  const fallbackType: "movie" | "tv" | undefined =
    mediaType === "movie" ? "movie" : mediaType === "all" ? undefined : "tv";

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query: query,
        language: "en-US",
      },
    });

    const results: any[] = response.data.results ?? [];
    const filtered =
      mediaType === "all" ? results.filter(isTrackable) : results.filter((i) => i.media_type !== "person");

    return filtered.map((item) => mapResult(item, fallbackType));
  } catch (error) {
    throw new Error("Error connecting to TMDB");
  }
};

/**
 * Trending titles. `mediaType` defaults to "tv"; use "movie" or "all" to widen it.
 */
export const getTrending = async (mediaType: string = "tv") => {
  const type = mediaType === "movie" || mediaType === "all" ? mediaType : "tv";
  const fallbackType: "movie" | "tv" | undefined =
    type === "movie" ? "movie" : type === "all" ? undefined : "tv";

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/${type}/week`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "en-US",
      },
    });

    const results: any[] = response.data.results ?? [];
    return results.map((item) => mapResult(item, fallbackType));
  } catch (error) {
    throw new Error("Error connecting to TMDB");
  }
};

export const getExternalDetails = async (id: string, mediaType: string) => {
  if (mediaType !== "movie" && mediaType !== "tv") {
    throw new Error("Invalid media type");
  }

  const response = await axios.get(`${TMDB_BASE_URL}/${mediaType}/${id}`, {
    params: {
      api_key: process.env.TMDB_API_KEY,
      language: "en-US",
    },
  });

  const data = response.data;

  return {
    external_id: data.id.toString(),
    title: data.title || data.name,
    description: data.overview,
    imageUrl: data.poster_path ? `${POSTER_BASE_URL}${data.poster_path}` : null,
    backdropUrl: data.backdrop_path ? `${BACKDROP_BASE_URL}${data.backdrop_path}` : null,
    mediaType: mediaType,

    duration:
      mediaType === "movie"
        ? data.runtime || 0
        : data.episode_run_time?.[0] || data.last_episode_to_air?.runtime || 0,
    totalEpisodes: mediaType === "movie" ? 1 : data.number_of_episodes || 0,

    releaseDate: mediaType === "movie" ? data.release_date : data.first_air_date,
  };
};

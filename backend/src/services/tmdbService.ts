import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

export const searchMulti = async (query: string) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query: query,
        language: "en-US",
      },
    });

    return response.data.results
      // search/multi also returns people; the catalog only tracks movies and tv.
      .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
      .map((item: any) => ({
        external_id: item.id.toString(),
        title: item.title || item.name,
        description: item.overview,
        poster_path: item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : null,
        mediaType: item.media_type,
        releaseDate: item.release_date || item.first_air_date,
      }));
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
    mediaType: mediaType,

    duration:
      mediaType === "movie"
        ? data.runtime || 0
        : data.episode_run_time?.[0] || data.last_episode_to_air?.runtime || 0,
    totalEpisodes: mediaType === "movie" ? 1 : data.number_of_episodes || 0,

    releaseDate: mediaType === "movie" ? data.release_date : data.first_air_date,
  };
};

import type { Show, UserShow, TMDBSearchResult, ThemeOption } from "@/types";

export const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null, size: "w200" | "w342" | "w500" = "w342"): string {
  if (!path) return "";
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

export function backdropUrl(
  path: string | null,
  size: "w780" | "w1280" | "original" = "w1280",
): string {
  if (!path) return "";
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

// Placeholder posters using Pexels stock photos
const PLACEHOLDER_POSTERS = [
  "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg?auto=compress&cs=tinysrgb&w=342",
  "https://images.pexels.com/photos/7234260/pexels-photo-7234260.jpeg?auto=compress&cs=tinysrgb&w=342",
  "https://images.pexels.com/photos/7234258/pexels-photo-7234258.jpeg?auto=compress&cs=tinysrgb&w=342",
  "https://images.pexels.com/photos/7234259/pexels-photo-7234259.jpeg?auto=compress&cs=tinysrgb&w=342",
  "https://images.pexels.com/photos/7234257/pexels-photo-7234257.jpeg?auto=compress&cs=tinysrgb&w=342",
  "https://images.pexels.com/photos/7234256/pexels-photo-7234256.jpeg?auto=compress&cs=tinysrgb&w=342",
];

const PLACEHOLDER_BACKDROPS = [
  "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg?auto=compress&cs=tinysrgb&w=1280",
  "https://images.pexels.com/photos/7234260/pexels-photo-7234260.jpeg?auto=compress&cs=tinysrgb&w=1280",
  "https://images.pexels.com/photos/7234258/pexels-photo-7234258.jpeg?auto=compress&cs=tinysrgb&w=1280",
];

function placeholderPoster(seed: number): string {
  return PLACEHOLDER_POSTERS[seed % PLACEHOLDER_POSTERS.length];
}

function placeholderBackdrop(seed: number): string {
  return PLACEHOLDER_BACKDROPS[seed % PLACEHOLDER_BACKDROPS.length];
}

// ===== Mock Shows =====

const mockShowData: Array<Omit<Show, "id" | "created_at">> = [
  {
    tmdb_id: 550,
    title: "Fight Club",
    poster_path: null,
    backdrop_path: null,
    overview:
      "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    media_type: "movie",
    release_date: "1999-10-15",
    runtime: 139,
    number_of_episodes: null,
    number_of_seasons: null,
    genres: ["Drama", "Thriller"],
    vote_average: 8.4,
  },
  {
    tmdb_id: 139,
    title: "Breaking Bad",
    poster_path: null,
    backdrop_path: null,
    overview:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    media_type: "tv",
    release_date: "2008-01-20",
    runtime: null,
    number_of_episodes: 62,
    number_of_seasons: 5,
    genres: ["Drama", "Crime", "Thriller"],
    vote_average: 9.5,
  },
  {
    tmdb_id: 27205,
    title: "Inception",
    poster_path: null,
    backdrop_path: null,
    overview:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
    media_type: "movie",
    release_date: "2010-07-16",
    runtime: 148,
    number_of_episodes: null,
    number_of_seasons: null,
    genres: ["Action", "Science Fiction", "Thriller"],
    vote_average: 8.4,
  },
  {
    tmdb_id: 66732,
    title: "Stranger Things",
    poster_path: null,
    backdrop_path: null,
    overview:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    media_type: "tv",
    release_date: "2016-07-15",
    runtime: null,
    number_of_episodes: 34,
    number_of_seasons: 4,
    genres: ["Sci-Fi & Fantasy", "Drama", "Mystery"],
    vote_average: 8.6,
  },
  {
    tmdb_id: 157336,
    title: "Interstellar",
    poster_path: null,
    backdrop_path: null,
    overview:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    media_type: "movie",
    release_date: "2014-11-05",
    runtime: 169,
    number_of_episodes: null,
    number_of_seasons: null,
    genres: ["Adventure", "Drama", "Science Fiction"],
    vote_average: 8.4,
  },
  {
    tmdb_id: 1396,
    title: "The Dark Knight",
    poster_path: null,
    backdrop_path: null,
    overview:
      "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
    media_type: "movie",
    release_date: "2008-07-18",
    runtime: 152,
    number_of_episodes: null,
    number_of_seasons: null,
    genres: ["Action", "Crime", "Drama"],
    vote_average: 8.5,
  },
  {
    tmdb_id: 60625,
    title: "The Office",
    poster_path: null,
    backdrop_path: null,
    overview:
      "The everyday lives of office employees in the Scranton, Pennsylvania branch of the fictional Dunder Mifflin Paper Company.",
    media_type: "tv",
    release_date: "2005-03-24",
    runtime: null,
    number_of_episodes: 201,
    number_of_seasons: 9,
    genres: ["Comedy"],
    vote_average: 8.6,
  },
  {
    tmdb_id: 11,
    title: "Star Wars: A New Hope",
    poster_path: null,
    backdrop_path: null,
    overview:
      "Princess Leia is captured and held hostage by the evil Imperial forces. Luke Skywalker and Han Solo work together to rescue her.",
    media_type: "movie",
    release_date: "1977-05-25",
    runtime: 121,
    number_of_episodes: null,
    number_of_seasons: null,
    genres: ["Adventure", "Action", "Science Fiction"],
    vote_average: 8.2,
  },
  {
    tmdb_id: 60059,
    title: "Better Call Saul",
    poster_path: null,
    backdrop_path: null,
    overview:
      "Six years before Saul Goodman meets Walter White, we meet him when the man who will become Saul is known as Jimmy McGill.",
    media_type: "tv",
    release_date: "2015-02-08",
    runtime: null,
    number_of_episodes: 63,
    number_of_seasons: 6,
    genres: ["Drama", "Crime", "Comedy"],
    vote_average: 8.8,
  },
  {
    tmdb_id: 155,
    title: "The Dark Knight Rises",
    poster_path: null,
    backdrop_path: null,
    overview:
      "Batman encounters the mysterious Selina Kyle and the villainous Bane, a new terrorist leader who overwhelms Gotham.",
    media_type: "movie",
    release_date: "2012-07-16",
    runtime: 165,
    number_of_episodes: null,
    number_of_seasons: null,
    genres: ["Action", "Thriller", "Crime"],
    vote_average: 7.7,
  },
  {
    tmdb_id: 637,
    title: "Pulp Fiction",
    poster_path: null,
    backdrop_path: null,
    overview:
      "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    media_type: "movie",
    release_date: "1994-09-10",
    runtime: 154,
    number_of_episodes: null,
    number_of_seasons: null,
    genres: ["Thriller", "Crime"],
    vote_average: 8.5,
  },
  {
    tmdb_id: 1399,
    title: "Game of Thrones",
    poster_path: null,
    backdrop_path: null,
    overview: "Seven noble families fight for control of the mythical land of Westeros.",
    media_type: "tv",
    release_date: "2011-04-17",
    runtime: null,
    number_of_episodes: 73,
    number_of_seasons: 8,
    genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
    vote_average: 8.5,
  },
];

export const mockShows: Show[] = mockShowData.map((data, i) => ({
  ...data,
  poster_path: data.poster_path ?? `/mock/${i}`,
  backdrop_path: data.backdrop_path ?? `/mock/${i}`,
  id: `show-${i + 1}`,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
}));

// ===== Mock User Shows =====

const mockUserShowData: Array<{
  showIndex: number;
  status: UserShow["status"];
  rating: number | null;
  moods: UserShow["moods"];
  time_commit: UserShow["time_commit"];
}> = [
  { showIndex: 0, status: "completed", rating: 9, moods: ["thrilled", "thoughtful"], time_commit: "between_1_and_3_hours" },
  { showIndex: 1, status: "watching", rating: 10, moods: ["thrilled", "sad"], time_commit: "binge" },
  { showIndex: 2, status: "completed", rating: 8, moods: ["nerdy", "thoughtful"], time_commit: "between_1_and_3_hours" },
  { showIndex: 3, status: "watching", rating: 9, moods: ["adventurous", "cozy"], time_commit: "binge" },
  { showIndex: 4, status: "completed", rating: 10, moods: ["thoughtful", "sad"], time_commit: "between_1_and_3_hours" },
  { showIndex: 5, status: "completed", rating: 10, moods: ["thrilled", "happy"], time_commit: "between_1_and_3_hours" },
  { showIndex: 6, status: "watching", rating: 8, moods: ["cozy", "happy"], time_commit: "around_30_min" },
  { showIndex: 7, status: "completed", rating: 9, moods: ["adventurous", "nerdy"], time_commit: "between_1_and_3_hours" },
  { showIndex: 8, status: "completed", rating: 9, moods: ["thoughtful", "sad"], time_commit: "binge" },
  { showIndex: 9, status: "completed", rating: 8, moods: ["thrilled"], time_commit: "between_1_and_3_hours" },
  { showIndex: 10, status: "plan_to_watch", rating: null, moods: [], time_commit: null },
  { showIndex: 11, status: "dropped", rating: 5, moods: ["thoughtful"], time_commit: "binge" },
];

export const mockUserShows: UserShow[] = mockUserShowData.map((data, i) => {
  const show = mockShows[data.showIndex];
  return {
    id: `us-${i + 1}`,
    user_id: "mock-user-1",
    show_id: show.id,
    status: data.status,
    rating: data.rating,
    moods: data.moods,
    time_commit: data.time_commit,
    created_at: new Date(Date.now() - (12 - i) * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 3600000).toISOString(),
    show,
  };
});

// ===== Mock TMDB Search Results =====

const mockSearchData: Array<Omit<TMDBSearchResult, "id">> = [
  { title: "Dune: Part Two", poster_path: null, backdrop_path: null, overview: "Paul Atreides unites with the Fremen and seeks revenge against the conspirators who destroyed his family.", media_type: "movie", release_date: "2024-03-01", vote_average: 8.3, genre_ids: [878, 12] },
  { title: "The Bear", poster_path: null, backdrop_path: null, overview: "A young chef from the fine dining world returns to Chicago to run his family's sandwich shop.", media_type: "tv", release_date: "2022-06-22", vote_average: 8.6, genre_ids: [18, 35] },
  { title: "Oppenheimer", poster_path: null, backdrop_path: null, overview: "The story of American scientist J. Robert Oppenheimer and his role in developing the atomic bomb.", media_type: "movie", release_date: "2023-07-21", vote_average: 8.1, genre_ids: [18, 36] },
  { title: "Severance", poster_path: null, backdrop_path: null, overview: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.", media_type: "tv", release_date: "2022-02-18", vote_average: 8.7, genre_ids: [18, 9648] },
  { title: "The Batman", poster_path: null, backdrop_path: null, overview: "When the Riddler begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.", media_type: "movie", release_date: "2022-03-04", vote_average: 7.7, genre_ids: [80, 28, 53] },
  { title: "House of the Dragon", poster_path: null, backdrop_path: null, overview: "The Targaryen dynasty is at the absolute apex of its power, with over 15 dragons under their yoke.", media_type: "tv", release_date: "2022-08-21", vote_average: 8.5, genre_ids: [10765, 18] },
  { title: "Everything Everywhere All at Once", poster_path: null, backdrop_path: null, overview: "A middle-aged Chinese immigrant is swept up in an insane adventure where she alone can save existence.", media_type: "movie", release_date: "2022-03-25", vote_average: 7.8, genre_ids: [28, 12, 878] },
  { title: "The Last of Us", poster_path: null, backdrop_path: null, overview: "Twenty years after modern civilization has been destroyed, Joel is hired to smuggle Ellie out of an oppressive quarantine zone.", media_type: "tv", release_date: "2023-01-15", vote_average: 8.8, genre_ids: [18, 10765] },
  { title: "Parasite", poster_path: null, backdrop_path: null, overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks.", media_type: "movie", release_date: "2019-05-30", vote_average: 8.5, genre_ids: [35, 53, 18] },
  { title: "Wednesday", poster_path: null, backdrop_path: null, overview: "Wednesday Addams investigates a murder spree while making new friends and foes at Nevermore Academy.", media_type: "tv", release_date: "2022-11-23", vote_average: 8.5, genre_ids: [9648, 35] },
  { title: "Spider-Man: No Way Home", poster_path: null, backdrop_path: null, overview: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a Super Hero.", media_type: "movie", release_date: "2021-12-15", vote_average: 8.0, genre_ids: [28, 12, 878] },
  { title: "Succession", poster_path: null, backdrop_path: null, overview: "The Roy family is known for controlling the biggest media and entertainment company in the world.", media_type: "tv", release_date: "2018-06-03", vote_average: 8.4, genre_ids: [18] },
];

export const mockSearchResults: TMDBSearchResult[] = mockSearchData.map((data, i) => ({
  ...data,
  id: 100000 + i,
  poster_path: data.poster_path ?? `/search/${i}`,
  backdrop_path: data.backdrop_path ?? `/search/${i}`,
  genre_ids: data.genre_ids,
}));

// ===== Theme Options =====

export const themeOptions: ThemeOption[] = [
  { name: "purple", label: "Bora-Log", swatch: "#a855f7" },
  { name: "ocean", label: "Ocean", swatch: "#38bdf8" },
  { name: "forest", label: "Forest", swatch: "#4ade80" },
  { name: "sunset", label: "Sunset", swatch: "#fb923c" },
  { name: "rose", label: "Rose", swatch: "#f43f5e" },
  { name: "mono", label: "Mono", swatch: "#e5e7eb" },
];

// ===== Helper: get poster or placeholder =====

export function getPosterUrl(show: Show): string {
  if (show.poster_path && show.poster_path.startsWith("/mock/")) {
    return placeholderPoster(parseInt(show.poster_path.split("/")[2]));
  }
  if (show.poster_path && show.poster_path.startsWith("/search/")) {
    return placeholderPoster(parseInt(show.poster_path.split("/")[2]) + 2);
  }
  if (show.poster_path) return posterUrl(show.poster_path);
  return placeholderPoster(0);
}

export function getBackdropUrl(show: Show): string {
  if (show.backdrop_path && show.backdrop_path.startsWith("/mock/")) {
    return placeholderBackdrop(parseInt(show.backdrop_path.split("/")[2]));
  }
  if (show.backdrop_path && show.backdrop_path.startsWith("/search/")) {
    return placeholderBackdrop(parseInt(show.backdrop_path.split("/")[2]) + 2);
  }
  if (show.backdrop_path) return backdropUrl(show.backdrop_path);
  return placeholderBackdrop(0);
}

export function getSearchPosterUrl(result: TMDBSearchResult): string {
  if (result.poster_path && result.poster_path.startsWith("/search/")) {
    return placeholderPoster(parseInt(result.poster_path.split("/")[2]) + 2);
  }
  if (result.poster_path) return posterUrl(result.poster_path);
  return placeholderPoster(0);
}

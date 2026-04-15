import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const searchMulti = async (query: string) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: query,
                language: 'en-US',
            }
        });

        return response.data.results.map((item: any) => ({
            external_id: item.id.toString(),
            title: item.title || item.name,
            description: item.overview,
            poster_path: item.poster_path 
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
                : null,
            mediaType: item.media_type,
            releaseDate: item.release_date || item.first_air_date
        }));
    } catch (error) {
        throw new Error('Error connecting to TMDB');
    }
};

export const getExternalDetails = async (id: string, mediaType: string) => {
    const response = await axios.get(`${TMDB_BASE_URL}/${mediaType}/${id}`, {
        params: {
            api_key: process.env.TMDB_API_KEY,
            language: 'en-US',
        }
    });

    const data = response.data;

    console.log(`Data from ${mediaType}:`, {
        runtime: data.runtime,
        episode_run_time: data.episode_run_time
    });

    return {
        external_id: data.id.toString(),
        title: data.title || data.name,
        description: data.overview,
        imageUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        mediaType: mediaType,

        duration: mediaType === 'movie' 
            ? (data.runtime || 0) 
            : (data.episode_run_time?.[0] || data.last_episode_to_air?.runtime || 0),
        totalEpisodes: mediaType === 'movie' ? 1 : (data.number_of_episodes || 0),

        releaseDate: mediaType === 'movie' ? data.release_date : data.first_air_date
    };
};
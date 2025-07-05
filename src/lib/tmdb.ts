import type { Media, Video } from '@/types';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Raw types from TMDB
interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
  media_type: 'movie';
}

interface TmdbTv {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
  media_type: 'tv';
}

interface TmdbPerson {
  id: number;
  name: string;
  media_type: 'person';
}

type TmdbMedia = TmdbMovie | TmdbTv;

interface TmdbSearchResponse {
  results: (TmdbMedia | TmdbPerson)[];
}

function normalizeMedia(item: TmdbMedia): Media {
    if (item.media_type === 'movie') {
        const movie = item as TmdbMovie;
        return { 
            ...movie, 
            title: movie.title, 
            release_date: movie.release_date || '',
            media_type: 'movie',
        };
    } else { // tv
        const tv = item as TmdbTv;
        return { 
            ...tv, 
            title: tv.name, 
            release_date: tv.first_air_date || '',
            media_type: 'tv',
        };
    }
}

export async function searchMedia(query: string, type?: 'movie' | 'tv'): Promise<Media[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key is not configured. Please set NEXT_PUBLIC_TMDB_API_KEY in your .env.local file.');
    return [];
  }
  if (!query) {
    return [];
  }

  const endpoint = type ? `search/${type}` : 'search/multi';
  const url = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch from TMDB:', response.statusText);
      return [];
    }
  
    const data: TmdbSearchResponse = await response.json();
    
    const mediaResults = data.results
      .filter((item): item is TmdbMedia => {
        // For multi-search, filter out persons. For single-type search, include everything.
        return endpoint === 'search/multi' ? item.media_type === 'movie' || item.media_type === 'tv' : true;
      })
      .map(item => {
        // If searching a specific type, TMDB doesn't return media_type, so we add it.
        if (type && !item.media_type) {
          (item as any).media_type = type;
        }
        return item as TmdbMedia;
      });

    return mediaResults.map(normalizeMedia);
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    return [];
  }
}

export async function getMediaDetailsByTitle(title: string, type: 'movie' | 'tv'): Promise<Media | null> {
  const results = await searchMedia(title, type);
  // Return the most relevant result (usually the first one)
  return results.length > 0 ? results[0] : null;
}

export async function getMediaVideos(mediaId: number, mediaType: 'movie' | 'tv'): Promise<Video[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key is not configured. Please set NEXT_PUBLIC_TMDB_API_KEY in your .env.local file.');
    return [];
  }
  const url = `${TMDB_BASE_URL}/${mediaType}/${mediaId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${mediaType} videos from TMDB:`, response.statusText);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Error fetching ${mediaType} videos from TMDB:`, error);
    return [];
  }
}

interface Genre {
  id: number;
  name: string;
}

interface GenresResponse {
  genres: Genre[];
}

let genreMapCache: Map<number, string> | null = null;

export async function getGenreMap(): Promise<Map<number, string>> {
  if (genreMapCache) {
    return genreMapCache;
  }

  if (!TMDB_API_KEY) {
    console.error('TMDB API key is not configured.');
    return new Map();
  }

  try {
    const [movieGenresResponse, tvGenresResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`)
    ]);

    if (!movieGenresResponse.ok || !tvGenresResponse.ok) {
      console.error('Failed to fetch genres from TMDB');
      return new Map();
    }
    
    const movieGenresData: GenresResponse = await movieGenresResponse.json();
    const tvGenresData: GenresResponse = await tvGenresResponse.json();
    
    const genreMap = new Map<number, string>();
    
    movieGenresData.genres.forEach(genre => {
      genreMap.set(genre.id, genre.name);
    });

    tvGenresData.genres.forEach(genre => {
        if (!genreMap.has(genre.id)) {
            genreMap.set(genre.id, genre.name);
        }
    });

    genreMapCache = genreMap;
    return genreMap;
  } catch (error) {
    console.error('Error fetching genres from TMDB:', error);
    return new Map();
  }
}

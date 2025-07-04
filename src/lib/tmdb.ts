import type { Movie, Video } from '@/types';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TmdbSearchResponse {
  results: Movie[];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key is not configured. Please set NEXT_PUBLIC_TMDB_API_KEY in your .env.local file.');
    return [];
  }
  if (!query) {
    return [];
  }

  const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch from TMDB:', response.statusText);
      return [];
    }
  
    const data: TmdbSearchResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    return [];
  }
}

export async function getMovieDetailsByTitle(title: string): Promise<Movie | null> {
  const results = await searchMovies(title);
  // Return the most relevant result (usually the first one)
  return results.length > 0 ? results[0] : null;
}

export async function getMovieVideos(movieId: number): Promise<Video[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key is not configured. Please set NEXT_PUBLIC_TMDB_API_KEY in your .env.local file.');
    return [];
  }
  const url = `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch movie videos from TMDB:', response.statusText);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching movie videos from TMDB:', error);
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

  const url = `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch genres from TMDB:', response.statusText);
      return new Map();
    }
    const data: GenresResponse = await response.json();
    const genreMap = new Map<number, string>();
    data.genres.forEach(genre => {
      genreMap.set(genre.id, genre.name);
    });
    genreMapCache = genreMap;
    return genreMap;
  } catch (error) {
    console.error('Error fetching genres from TMDB:', error);
    return new Map();
  }
}

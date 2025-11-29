export interface Media {
  id: number;
  title: string; // Unified from movie.title or tv.name
  overview: string;
  poster_path: string | null;
  release_date: string; // Unified from movie.release_date or tv.first_air_date
  vote_average: number;
  popularity: number;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
  reason?: string; // AI-generated reason for recommendation
}

export interface AnalyzedUserInput {
  relevantGenres: string[];
  otherContextClues: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

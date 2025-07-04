import { create } from 'zustand'
import type { Movie, AnalyzedUserInput } from '@/types'

type SortByType = 'popularity' | 'vote_average' | 'release_date';

type MovieState = {
  recommendations: Movie[]
  analysis: AnalyzedUserInput | null
  autocomplete: Movie[]
  loading: boolean
  error: string | null
  sortBy: SortByType
  activeGenreFilters: number[]
  genreMap: Map<number, string>
  displayedCount: number
  setRecommendations: (movies: Movie[]) => void
  setAnalysis: (analysis: AnalyzedUserInput | null) => void
  setAutocomplete: (movies: Movie[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSortBy: (sortBy: SortByType) => void
  toggleGenreFilter: (genreId: number) => void
  setGenreMap: (genreMap: Map<number, string>) => void
  clearFilters: () => void
  clearState: () => void
  loadMore: () => void
}

const initialState = {
  recommendations: [],
  analysis: null,
  autocomplete: [],
  loading: false,
  error: null,
  sortBy: 'popularity' as SortByType,
  activeGenreFilters: [] as number[],
  genreMap: new Map<number, string>(),
  displayedCount: 10,
}

export const useMovieStore = create<MovieState>((set) => ({
  ...initialState,
  setRecommendations: (movies) => set({ 
    recommendations: movies, 
    activeGenreFilters: [], 
    sortBy: 'popularity',
    displayedCount: 10,
  }),
  setAnalysis: (analysis) => set({ analysis: analysis }),
  setAutocomplete: (movies) => set({ autocomplete: movies }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSortBy: (sortBy) => set({ sortBy }),
  toggleGenreFilter: (genreId) => set((state) => {
    const activeGenreFilters = new Set(state.activeGenreFilters);
    if (activeGenreFilters.has(genreId)) {
      activeGenreFilters.delete(genreId);
    } else {
      activeGenreFilters.add(genreId);
    }
    return { activeGenreFilters: Array.from(activeGenreFilters) };
  }),
  setGenreMap: (genreMap) => set({ genreMap }),
  clearFilters: () => set({ activeGenreFilters: [], sortBy: 'popularity' }),
  clearState: () => set(initialState),
  loadMore: () => set((state) => ({ displayedCount: state.displayedCount + 10 })),
}))

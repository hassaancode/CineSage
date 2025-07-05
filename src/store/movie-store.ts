import { create } from 'zustand'
import type { Movie, AnalyzedUserInput } from '@/types'

type SortByType = 'popularity' | 'vote_average' | 'release_date' | '';

type MovieState = {
  userInput: string
  recommendations: Movie[]
  analysis: AnalyzedUserInput | null
  autocomplete: Movie[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  sortBy: SortByType
  activeGenreFilters: number[]
  genreMap: Map<number, string>
  setRecommendations: (movies: Movie[], userInput: string) => void
  appendRecommendations: (movies: Movie[]) => void
  setAnalysis: (analysis: AnalyzedUserInput | null) => void
  setAutocomplete: (movies: Movie[]) => void
  setLoading: (loading: boolean) => void
  setLoadingMore: (loadingMore: boolean) => void
  setError: (error: string | null) => void
  setSortBy: (sortBy: SortByType) => void
  toggleGenreFilter: (genreId: number) => void
  setGenreMap: (genreMap: Map<number, string>) => void
  clearFilters: () => void
  clearState: () => void
}

const initialState = {
  userInput: '',
  recommendations: [],
  analysis: null,
  autocomplete: [],
  loading: false,
  loadingMore: false,
  error: null,
  sortBy: '' as SortByType,
  activeGenreFilters: [] as number[],
  genreMap: new Map<number, string>(),
}

export const useMovieStore = create<MovieState>((set) => ({
  ...initialState,
  setRecommendations: (movies, userInput) => set({ 
    recommendations: movies, 
    userInput: userInput,
    activeGenreFilters: [], 
    sortBy: '',
  }),
  appendRecommendations: (movies) => set((state) => ({ 
    recommendations: [...state.recommendations, ...movies] 
  })),
  setAnalysis: (analysis) => set({ analysis: analysis }),
  setAutocomplete: (movies) => set({ autocomplete: movies }),
  setLoading: (loading) => set({ loading }),
  setLoadingMore: (loadingMore) => set({ loadingMore }),
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
  clearFilters: () => set({ activeGenreFilters: [], sortBy: '' }),
  clearState: () => set(initialState),
}))

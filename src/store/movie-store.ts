import { create } from 'zustand'
import type { Media, AnalyzedUserInput } from '@/types'

type SortByType = 'popularity' | 'vote_average' | 'release_date' | 'default';
type MediaTypeFilter = 'all' | 'movie' | 'tv';

type MovieState = {
  userInput: string
  recommendations: Media[]
  analysis: AnalyzedUserInput | null
  autocomplete: Media[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  sortBy: SortByType
  activeGenreFilters: number[]
  genreMap: Map<number, string>
  mediaTypeFilter: MediaTypeFilter
  setRecommendations: (media: Media[], userInput: string) => void
  appendRecommendations: (media: Media[]) => void
  setAnalysis: (analysis: AnalyzedUserInput | null) => void
  setAutocomplete: (media: Media[]) => void
  setLoading: (loading: boolean) => void
  setLoadingMore: (loadingMore: boolean) => void
  setError: (error: string | null) => void
  setSortBy: (sortBy: SortByType) => void
  toggleGenreFilter: (genreId: number) => void
  setGenreMap: (genreMap: Map<number, string>) => void
  setMediaTypeFilter: (filter: MediaTypeFilter) => void
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
  sortBy: 'default' as SortByType,
  activeGenreFilters: [] as number[],
  genreMap: new Map<number, string>(),
  mediaTypeFilter: 'all' as MediaTypeFilter,
}

export const useMovieStore = create<MovieState>((set) => ({
  ...initialState,
  setRecommendations: (media, userInput) => set({ 
    recommendations: media, 
    userInput: userInput,
    activeGenreFilters: [], 
    sortBy: 'default',
    mediaTypeFilter: 'all',
  }),
  appendRecommendations: (media) => set((state) => ({ 
    recommendations: [...state.recommendations, ...media] 
  })),
  setAnalysis: (analysis) => set({ analysis: analysis }),
  setAutocomplete: (media) => set({ autocomplete: media }),
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
  setMediaTypeFilter: (filter) => set({ mediaTypeFilter: filter }),
  clearFilters: () => set({ activeGenreFilters: [] }),
  clearState: () => set(initialState),
}))

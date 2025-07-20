import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Media, AnalyzedUserInput } from '@/types'

type SortByType = 'popularity' | 'vote_average' | 'release_date' | 'default';
type MediaTypeFilter = 'all' | 'movie' | 'tv';

type MovieState = {
  userInput: string
  searchMode: 'scenario' | 'movie'
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
  bookmarks: Media[]
  isInitialized: boolean;
  setRecommendations: (payload: {
    media: Media[],
    userInput: string,
    searchMode: 'scenario' | 'movie',
    analysis: AnalyzedUserInput | null
  }) => void
  appendRecommendations: (media: Media[]) => void
  setAutocomplete: (media: Media[]) => void
  setLoading: (loading: boolean) => void
  setLoadingMore: (loadingMore: boolean) => void
  setError: (error: string | null) => void
  setSortBy: (sortBy: SortByType) => void
  toggleGenreFilter: (genreId: number) => void
  setGenreMap: (genreMap: Map<number, string>) => void
  setMediaTypeFilter: (filter: MediaTypeFilter) => void
  toggleBookmark: (media: Media) => void
  clearFilters: () => void
  clearState: () => void
}

const initialState = {
  userInput: '',
  searchMode: 'scenario' as const,
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
  bookmarks: [] as Media[],
  isInitialized: false,
}

export const useMovieStore = create<MovieState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setRecommendations: (payload) => set({ 
        recommendations: payload.media, 
        userInput: payload.userInput,
        searchMode: payload.searchMode,
        analysis: payload.analysis,
        activeGenreFilters: [], 
        sortBy: 'default',
        mediaTypeFilter: 'all',
      }),
      appendRecommendations: (media) => set((state) => ({ 
        recommendations: [...state.recommendations, ...media] 
      })),
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
      toggleBookmark: (media) => {
        const bookmarks = get().bookmarks;
        const isBookmarked = bookmarks.some((b) => b.id === media.id);
        if (isBookmarked) {
          set({ bookmarks: bookmarks.filter((b) => b.id !== media.id) });
        } else {
          set({ bookmarks: [...bookmarks, media] });
        }
      },
      clearFilters: () => set({ activeGenreFilters: [] }),
      clearState: () => set(initialState),
    }),
    {
      name: 'cinesage-movie-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ bookmarks: state.bookmarks }), // Only persist bookmarks
      onRehydrateStorage: () => (state) => {
        if (state) state.isInitialized = true;
      },
    }
  )
)

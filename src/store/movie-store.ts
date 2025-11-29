import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Media, AnalyzedUserInput } from '@/types'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

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
  toggleBookmark: (media: Media) => Promise<void>
  setBookmarks: (bookmarks: Media[]) => void
  syncBookmarks: (userId: string) => Promise<void>
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
      toggleBookmark: async (media) => {
        const bookmarks = get().bookmarks;
        const isBookmarked = bookmarks.some((b) => b.id === media.id);
        let newBookmarks = [];

        if (isBookmarked) {
          newBookmarks = bookmarks.filter((b) => b.id !== media.id);
        } else {
          newBookmarks = [...bookmarks, media];
        }

        set({ bookmarks: newBookmarks });

        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          try {
            if (isBookmarked) {
              await updateDoc(userRef, {
                bookmarks: arrayRemove(media)
              });
            } else {
              // Check if doc exists first, if not create it
              const docSnap = await getDoc(userRef);
              if (!docSnap.exists()) {
                await setDoc(userRef, { bookmarks: [media] });
              } else {
                await updateDoc(userRef, {
                  bookmarks: arrayUnion(media)
                });
              }
            }
          } catch (error) {
            console.error("Error syncing bookmark:", error);
          }
        }
      },
      setBookmarks: (bookmarks) => set({ bookmarks }),
      syncBookmarks: async (userId) => {
        if (!userId) return;
        const userRef = doc(db, 'users', userId);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.bookmarks) {
              // Merge cloud bookmarks with local? Or overwrite? 
              // Let's merge for now, or just prefer cloud.
              // For simplicity, let's use cloud as truth if it exists.
              set({ bookmarks: data.bookmarks as Media[] });
            }
          } else {
            // If no cloud data, maybe upload local?
            // For now, do nothing or create empty.
          }
        } catch (error) {
          console.error("Error syncing bookmarks from cloud:", error);
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

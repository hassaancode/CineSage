import { create } from 'zustand'
import type { Movie, AnalyzedUserInput } from '@/types'

type MovieState = {
  recommendations: Movie[]
  analysis: AnalyzedUserInput | null
  autocomplete: Movie[]
  loading: boolean
  error: string | null
  setRecommendations: (movies: Movie[]) => void
  setAnalysis: (analysis: AnalyzedUserInput | null) => void
  setAutocomplete: (movies: Movie[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearState: () => void
}

const initialState = {
  recommendations: [],
  analysis: null,
  autocomplete: [],
  loading: false,
  error: null,
}

export const useMovieStore = create<MovieState>((set) => ({
  ...initialState,
  setRecommendations: (movies) => set({ recommendations: movies }),
  setAnalysis: (analysis) => set({ analysis: analysis }),
  setAutocomplete: (movies) => set({ autocomplete: movies }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearState: () => set(initialState),
}))

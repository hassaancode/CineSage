'use server'

import { analyzeUserInput } from '@/ai/flows/analyze-user-input'
import { generateMovieRecommendations } from '@/ai/flows/generate-movie-recommendations'
import { getMovieDetailsByTitle, searchMovies } from '@/lib/tmdb'
import type { Movie, AnalyzedUserInput } from '@/types'

interface RecommendationResult {
  movies: Movie[]
  analysis: AnalyzedUserInput
}

export async function getAIRecommendations(
  userInput: string
): Promise<{ data?: RecommendationResult; error?: string }> {
  if (!userInput) {
    return { error: 'Please enter a description of the movie you want to watch.' }
  }

  try {
    const [analysisResult, recommendationsResult] = await Promise.all([
      analyzeUserInput({ userInput }),
      generateMovieRecommendations({ userInput }),
    ])

    if (!recommendationsResult?.movieRecommendations || recommendationsResult.movieRecommendations.length === 0) {
      return { error: 'Could not generate movie recommendations. Try a different query.' }
    }
    
    const movieDetailsPromises = recommendationsResult.movieRecommendations.map(title =>
      getMovieDetailsByTitle(title)
    )
    
    const movieDetails = (await Promise.all(movieDetailsPromises)).filter(
      (movie): movie is Movie => movie !== null
    )

    // Deduplicate movies by ID to prevent key errors
    const uniqueMoviesMap = new Map<number, Movie>()
    for (const movie of movieDetails) {
      if (!uniqueMoviesMap.has(movie.id)) {
        uniqueMoviesMap.set(movie.id, movie)
      }
    }
    const uniqueMovieDetails = Array.from(uniqueMoviesMap.values())

    if (uniqueMovieDetails.length === 0) {
      return { error: "AI recommendations found, but couldn't find them on TMDB. Please try a more specific query."}
    }

    return {
      data: {
        movies: uniqueMovieDetails,
        analysis: analysisResult,
      },
    }
  } catch (e) {
    console.error(e)
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.'
    return { error: `An unexpected error occurred while getting recommendations: ${errorMessage}` }
  }
}

export async function getAutocompleteSuggestions(query: string): Promise<{ data?: Movie[]; error?: string }> {
  if (!query) {
    return { data: [] };
  }
  try {
    const movies = await searchMovies(query);
    return { data: movies.slice(0, 5) }; // Return top 5 suggestions
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.'
    return { error: `Failed to fetch autocomplete suggestions: ${errorMessage}` };
  }
}

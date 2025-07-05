'use server'

import { analyzeUserInput } from '@/ai/flows/analyze-user-input'
import { generateMediaRecommendations } from '@/ai/flows/generate-movie-recommendations'
import { getMediaDetailsByTitle, searchMedia } from '@/lib/tmdb'
import type { Media, AnalyzedUserInput } from '@/types'

interface RecommendationResult {
  media: Media[]
  analysis?: AnalyzedUserInput
}

async function processRecommendations(
  mediaItems: { title: string; type: 'movie' | 'tv' }[],
  existingMediaIds: Set<number>
): Promise<Media[]> {
  if (!mediaItems || mediaItems.length === 0) {
    return []
  }

  const mediaDetailsPromises = mediaItems.map(({ title, type }) =>
    getMediaDetailsByTitle(title, type)
  )
  
  const mediaDetails = (await Promise.all(mediaDetailsPromises)).filter(
    (media): media is Media => media !== null
  )

  const uniqueMediaMap = new Map<number, Media>()
  for (const media of mediaDetails) {
    if (!existingMediaIds.has(media.id) && !uniqueMediaMap.has(media.id)) {
      uniqueMediaMap.set(media.id, media)
    }
  }
  return Array.from(uniqueMediaMap.values())
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
      generateMediaRecommendations({ userInput }),
    ])

    if (!recommendationsResult?.mediaRecommendations || recommendationsResult.mediaRecommendations.length === 0) {
      return { error: 'Could not generate movie recommendations. Try a different query.' }
    }
    
    const uniqueMediaDetails = await processRecommendations(recommendationsResult.mediaRecommendations, new Set())

    if (uniqueMediaDetails.length === 0) {
      return { error: "AI recommendations found, but couldn't find them on TMDB. Please try a more specific query."}
    }

    return {
      data: {
        media: uniqueMediaDetails,
        analysis: analysisResult,
      },
    }
  } catch (e) {
    console.error(e)
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.'
    return { error: `An unexpected error occurred while getting recommendations: ${errorMessage}` }
  }
}

export async function getMoreAIRecommendations(
  userInput: string,
  existingMedia: Media[]
): Promise<{ data?: RecommendationResult; error?: string }> {
  if (!userInput) {
    return { error: 'No user input found to generate more recommendations.' }
  }

  try {
    const existingMediaTitles = existingMedia.map(m => m.title)
    const existingMediaIds = new Set(existingMedia.map(m => m.id))

    const recommendationsResult = await generateMediaRecommendations({ userInput, exclude: existingMediaTitles })

    if (!recommendationsResult?.mediaRecommendations || recommendationsResult.mediaRecommendations.length === 0) {
      return { data: { media: [] } }
    }

    const newUniqueMedia = await processRecommendations(recommendationsResult.mediaRecommendations, existingMediaIds)

    return {
      data: {
        media: newUniqueMedia,
      },
    }
  } catch (e) {
    console.error(e)
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.'
    return { error: `An unexpected error occurred while getting more recommendations: ${errorMessage}` }
  }
}

export async function getAutocompleteSuggestions(query: string): Promise<{ data?: Media[]; error?: string }> {
  if (!query) {
    return { data: [] };
  }
  try {
    const media = await searchMedia(query);
    return { data: media.slice(0, 5) }; // Return top 5 suggestions
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.'
    return { error: `Failed to fetch autocomplete suggestions: ${errorMessage}` };
  }
}

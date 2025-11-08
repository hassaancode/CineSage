'use client'

import { useMemo, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useMovieStore } from '@/store/movie-store'
import { MovieCard } from '@/components/MovieCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AnalyzedClues } from './AnalyzedClues'
import { Wand2, Film, Loader2 } from 'lucide-react'
import { getGenreMap } from '@/lib/tmdb'
import { getMoreAIRecommendations } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { FilterSortControls } from './FilterSortControls'

function WelcomeMessage() {
    return (
        <div className="text-center py-20 animate-in fade-in-0 duration-500">
          <p className="text-muted-foreground max-w-md mx-auto">
              Tell us what you're in the mood for, and our AI will suggest the perfect movies and TV shows for your night in.
          </p>
          <div className="mt-8 flex justify-center">
            <Image
              src="/welcome-art.png"
              alt="Assortment of movie reels"
              width={600}
              height={400}
              className="rounded-lg"
              data-ai-hint="movie collage abstract"
            />
          </div>
        </div>
    )
}

function NoResultsMessage() {
    return (
        <div className="text-center py-20 animate-in fade-in-0 duration-500">
            <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full mb-6">
                <Film className="h-10 w-10 text-primary"/>
            </div>
            <h2 className="font-headline text-4xl mb-4">No Results Match Your Filters</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your sort and filter options to find what you're looking for.
            </p>
        </div>
    )
}

export function MovieGrid() {
  const { 
    recommendations, 
    loading,
    loadingMore,
    setLoadingMore,
    appendRecommendations,
    error,
    userInput,
    searchMode,
    sortBy,
    activeGenreFilters,
    mediaTypeFilter,
    genreMap,
    setGenreMap,
   } = useMovieStore()
   const { toast } = useToast()

  useEffect(() => {
    if (recommendations.length > 0 && genreMap.size === 0) {
      getGenreMap().then(setGenreMap)
    }
  }, [recommendations, genreMap, setGenreMap])

  const filteredAndSortedMovies = useMemo(() => {
    let movies = [...recommendations];

    if (mediaTypeFilter !== 'all') {
      movies = movies.filter(movie => movie.media_type === mediaTypeFilter);
    }

    if (activeGenreFilters.length > 0) {
        movies = movies.filter(movie => 
            activeGenreFilters.every(filterId => movie.genre_ids && movie.genre_ids.includes(filterId))
        );
    }
    
    if (sortBy !== 'default') {
      switch (sortBy) {
          case 'popularity':
              movies.sort((a, b) => b.popularity - a.popularity);
              break;
          case 'vote_average':
              movies.sort((a, b) => b.vote_average - a.vote_average);
              break;
          case 'release_date':
              movies.sort((a, b) => {
                const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
                const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
                return dateB - dateA;
              });
              break;
      }
    }


    return movies;
  }, [recommendations, sortBy, activeGenreFilters, mediaTypeFilter])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const { data, error } = await getMoreAIRecommendations(userInput, recommendations, searchMode)
    if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error })
    } else if (data?.media && data.media.length > 0) {
        appendRecommendations(data.media)
    } else {
        toast({ title: 'All set!', description: "You've reached the end of the recommendations." })
    }
    setLoadingMore(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  }

  const animationKey = `${userInput}-${sortBy}-${activeGenreFilters.join(',')}-${mediaTypeFilter}`

  if (loading) {
    return (
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full" />
            <Skeleton className="h-6 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-12 max-w-md mx-auto">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  if (recommendations.length === 0) {
    return <WelcomeMessage />;
  }

  return (
    <>
      <AnalyzedClues />
      <FilterSortControls />
      
      {filteredAndSortedMovies.length > 0 ? (
        <motion.div
          key={animationKey}
          className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredAndSortedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </motion.div>
      ) : (
        <NoResultsMessage />
      )}

      {recommendations.length > 0 && filteredAndSortedMovies.length > 0 && (
        <div className="mt-10 text-center">
            <Button onClick={handleLoadMore} size="lg" disabled={loadingMore}>
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
        </div>
      )}
    </>
  )
}

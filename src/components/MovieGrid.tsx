'use client'

import { useMemo, useEffect } from 'react'
import { useMovieStore } from '@/store/movie-store'
import { MovieCard } from '@/components/MovieCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AnalyzedClues } from './AnalyzedClues'
import { Wand2, Film } from 'lucide-react'
import { getGenreMap } from '@/lib/tmdb'

function WelcomeMessage() {
    return (
        <div className="text-center py-20 animate-in fade-in-0 duration-500">
            <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full mb-6">
                <Wand2 className="h-10 w-10 text-primary"/>
            </div>
            <h2 className="font-headline text-4xl mb-4">Welcome to CineSage</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
                Tell us what you're in the mood for, and our AI will suggest the perfect movies for your night in.
            </p>
        </div>
    )
}

function NoResultsMessage() {
    return (
        <div className="text-center py-20 animate-in fade-in-0 duration-500">
            <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full mb-6">
                <Film className="h-10 w-10 text-primary"/>
            </div>
            <h2 className="font-headline text-4xl mb-4">No Movies Match Your Filters</h2>
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
    error,
    sortBy,
    activeGenreFilters,
    genreMap,
    setGenreMap
   } = useMovieStore()

  useEffect(() => {
    if (recommendations.length > 0 && genreMap.size === 0) {
      getGenreMap().then(setGenreMap)
    }
  }, [recommendations, genreMap, setGenreMap])

  const displayedMovies = useMemo(() => {
    let movies = [...recommendations];

    if (activeGenreFilters.length > 0) {
        movies = movies.filter(movie => 
            activeGenreFilters.every(filterId => movie.genre_ids && movie.genre_ids.includes(filterId))
        );
    }

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

    return movies;
  }, [recommendations, sortBy, activeGenreFilters])


  if (loading) {
    return (
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

  if (displayedMovies.length === 0) {
    return <NoResultsMessage />;
  }

  return (
    <>
      <AnalyzedClues />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in-0 duration-500">
        {displayedMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </>
  )
}

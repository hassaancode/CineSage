'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useMovieStore } from '@/store/movie-store'
import { MovieCard } from '@/components/MovieCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookmarkX } from 'lucide-react'

export default function BookmarksPage() {
  const { bookmarks, isInitialized } = useMovieStore()

  // This ensures we only render on the client after the store has been hydrated from local storage
  if (!isInitialized) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-20 bg-background/80 backdrop-blur-sm">
        <Link href="/" passHref>
          <Button variant="outline" size="icon" aria-label="Back to Home">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-center">
          My Bookmarks
        </h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {bookmarks.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {bookmarks.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full mb-6">
                  <BookmarkX className="h-10 w-10 text-primary"/>
              </div>
              <h2 className="font-headline text-4xl mb-4">No Bookmarks Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't saved any movies or TV shows. Start exploring and bookmark your favorites!
              </p>
              <Link href="/" passHref>
                <Button>Find Recommendations</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-8 text-muted-foreground text-sm">
        <p>CineSage &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

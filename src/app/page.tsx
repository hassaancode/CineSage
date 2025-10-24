'use client'

import { useThemeStore } from '@/store/theme-store'
import { useEffect } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { MovieGrid } from '@/components/MovieGrid'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bookmark } from 'lucide-react'

export default function Home() {
  const theme = useThemeStore((state) => state.theme)
  
  useEffect(() => {
    document.documentElement.className = ''
    document.documentElement.classList.add(theme)
  }, [theme])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-20 bg-background/80 backdrop-blur-sm">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">
          <span>CineSage</span>
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/bookmarks" passHref>
            <Button variant="ghost" size="icon" aria-label="View Bookmarks">
              <Bookmark />
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <section className="text-center my-8 md:my-16 animate-in fade-in-0 slide-in-from-top-10 duration-500">
            <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
              Find Your Next Favorite Movie.
            </h2>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Let our AI assistant be your guide. Just describe what you're looking for and get instant, personalized recommendations.
            </p>
          </section>
          <SearchBar />
          <MovieGrid />
        </div>
      </main>
      <footer className="text-center py-8 text-muted-foreground text-sm">
        <p>Powered by Gemini and The Movie Database (TMDB).</p>
        <p>CineSage &copy; {new Date().getFullYear()}</p>
        <p className='pt-4'>
          Designed by{' '}
          <a
            href="https://github.com/hassaancode"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Hassaan
          </a>
        </p>
      </footer>
    </div>
  )
}

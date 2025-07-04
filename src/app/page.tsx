'use client'

import { useThemeStore } from '@/store/theme-store'
import { useEffect } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { MovieGrid } from '@/components/MovieGrid'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FilterSortControls } from '@/components/FilterSortControls'

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
          <span className="text-primary">Cine</span><span>Sage</span>
        </h1>
        <ThemeToggle />
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
          <FilterSortControls />
          <MovieGrid />
        </div>
      </main>
      <footer className="text-center py-8 text-muted-foreground text-sm">
        <p>Powered by Gemini and The Movie Database (TMDB).</p>
        <p>CineSage &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

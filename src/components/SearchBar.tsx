'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { Search, Loader2, Wand2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useMovieStore } from '@/store/movie-store'
import { getAIRecommendations, getAutocompleteSuggestions } from '@/app/actions'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import type { Movie } from '@/types'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const { 
    setRecommendations, 
    setAnalysis,
    setLoading, 
    setError,
    autocomplete,
    setAutocomplete,
    loading
  } = useMovieStore()

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      startTransition(async () => {
        const { data } = await getAutocompleteSuggestions(debouncedQuery)
        setAutocomplete(data || [])
      })
    } else {
      setAutocomplete([])
    }
  }, [debouncedQuery, setAutocomplete])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setAutocomplete([])
      }
    }

    if (autocomplete.length > 0) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [autocomplete, setAutocomplete])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true)
    setError(null)
    setAutocomplete([])
    setQuery(searchQuery);

    const { data, error } = await getAIRecommendations(searchQuery)

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error })
      setError(error)
      setRecommendations([], '')
      setAnalysis(null)
    } else if (data) {
      setRecommendations(data.movies, searchQuery)
      setAnalysis(data.analysis)
    }
    setLoading(false)
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleSuggestionClick = (movie: Movie) => {
    setQuery(movie.title)
    setAutocomplete([])
    // We can either trigger a search for this specific movie title or let the user do it.
    // For now, we will just fill the input.
  }

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleFormSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Describe a movie... e.g., 'a funny space opera with aliens'"
            className="w-full pl-12 pr-28 sm:pr-32 py-6 text-sm rounded-full shadow-lg "
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (query.length > 2) startTransition(async () => { const { data } = await getAutocompleteSuggestions(query); setAutocomplete(data || []) })}}
          />
          <Button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 px-4 sm:px-5 font-bold bg-accent hover:bg-accent/90" 
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="h-5 w-5" />
            )}
            <span className="ml-2 hidden sm:inline">Suggest</span>
          </Button>
        </div>
      </form>
      {autocomplete.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-10 shadow-xl animate-in fade-in-0 duration-200">
          <CardContent className="p-2">
            <ul className="space-y-1">
              {autocomplete.map((movie) => (
                <li key={movie.id}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSuggestionClick(movie)}
                    className="w-full text-left p-2 rounded-md hover:bg-accent/10 flex items-center gap-4"
                  >
                    <Image 
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://placehold.co/45x68'}
                      alt={movie.title}
                      width={40}
                      height={60}
                      className="rounded-sm bg-muted"
                      data-ai-hint="movie poster"
                    />
                    <div className="overflow-hidden">
                      <p className="font-semibold truncate">{movie.title}</p>
                      {movie.release_date && <p className="text-sm text-muted-foreground">{new Date(movie.release_date).getFullYear()}</p>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

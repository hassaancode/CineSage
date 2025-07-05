'use client'

import { useMemo } from 'react'
import { useMovieStore } from '@/store/movie-store'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ListFilter, X } from 'lucide-react'

export function FilterSortControls() {
  const {
    recommendations,
    sortBy,
    setSortBy,
    activeGenreFilters,
    toggleGenreFilter,
    genreMap,
    clearFilters,
  } = useMovieStore()

  const availableGenres = useMemo(() => {
    if (!recommendations.length || !genreMap.size) return []
    const genreIds = new Set(recommendations.flatMap((movie) => movie.genre_ids))
    return Array.from(genreIds)
      .map((id) => ({ id, name: genreMap.get(id) }))
      .filter((genre): genre is { id: number; name: string } => !!genre.name)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [recommendations, genreMap])

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="my-8 flex flex-wrap items-center justify-between gap-4 animate-in fade-in-0 duration-500">
      <div className="flex items-center gap-2">
        {availableGenres.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListFilter className="h-4 w-4" />
                
                {activeGenreFilters.length > 0 && (
                  <span className="ml-2 rounded-full bg-secondary text-secondary-foreground h-6 w-6 flex items-center justify-center text-xs">
                    {activeGenreFilters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Genre</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableGenres.map((genre) => (
                <DropdownMenuCheckboxItem
                  key={genre.id}
                  checked={activeGenreFilters.includes(genre.id)}
                  onCheckedChange={() => toggleGenreFilter(genre.id)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {genre.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {activeGenreFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => clearFilters()} className="text-muted-foreground">
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex w-[60%] sm:max-w-40 items-center gap-2">        
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="vote_average">Rating</SelectItem>
            <SelectItem value="release_date">Release Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

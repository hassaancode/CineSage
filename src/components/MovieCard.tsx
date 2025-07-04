'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { Movie } from '@/types'
import { Star } from 'lucide-react'
import { MovieDetailsDialog } from './MovieDetailsDialog'

const getImageUrl = (path: string | null) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://placehold.co/500x750'
}

export function MovieCard({ movie }: { movie: Movie }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Card
        className="overflow-hidden border-2 bg-card/50 border-transparent hover:border-primary hover:bg-card transition-all duration-300 group flex flex-col cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader className="p-0">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={getImageUrl(movie.poster_path)}
              alt={`Poster for ${movie.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="movie poster"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-2 flex-grow flex flex-col">
          <CardTitle className="font-headline text-lg line-clamp-2 flex-grow">{movie.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground pt-2">
            <Star className="w-4 h-4 mr-1.5 fill-yellow-400 text-yellow-400" />
            <span>{movie.vote_average > 0 ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            {movie.release_date && <span className="ml-auto">{new Date(movie.release_date).getFullYear()}</span>}
          </div>
          <CardDescription className="line-clamp-3 text-sm text-muted-foreground">{movie.overview}</CardDescription>
        </CardContent>
      </Card>
      {isDialogOpen && <MovieDetailsDialog movie={movie} open={isDialogOpen} onOpenChange={setIsDialogOpen} />}
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { Movie, Video } from '@/types'
import { getMovieVideos } from '@/lib/tmdb'
import { Star } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

const getImageUrl = (path: string | null) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://placehold.co/500x750'
}

export function MovieDetailsDialog({ movie, open, onOpenChange }: { movie: Movie; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [trailer, setTrailer] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      setLoading(true)
      const fetchTrailer = async () => {
        const videos = await getMovieVideos(movie.id)
        const officialTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official)
                          || videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
                          || videos.find(v => v.site === 'YouTube');
        setTrailer(officialTrailer || null)
        setLoading(false)
      }
      fetchTrailer()
    }
  }, [movie.id, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="relative h-full min-h-[450px] md:min-h-0 md:aspect-[2/3]">
           <Image
            src={getImageUrl(movie.poster_path)}
            alt={`Poster for ${movie.title}`}
            fill
            className="object-cover"
            data-ai-hint="movie poster"
          />
          </div>
          <div className="md:col-span-2 p-6 flex flex-col max-h-[90vh] overflow-y-auto">
              <DialogHeader className="text-left mb-4">
                <DialogTitle className="text-3xl font-headline mb-2">{movie.title}</DialogTitle>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1.5 fill-yellow-400 text-yellow-400" />
                        <span>{movie.vote_average > 0 ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                    </div>
                    {movie.release_date && <span>{new Date(movie.release_date).getFullYear()}</span>}
                </div>
              </DialogHeader>

            <DialogDescription className="text-base text-foreground/80 mb-6">{movie.overview}</DialogDescription>
            
            <div className="mt-auto">
                <h3 className="text-lg font-headline mb-3">Trailer</h3>
                {loading ? (
                    <Skeleton className="aspect-video w-full rounded-lg" />
                ) : trailer ? (
                <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    ></iframe>
                </div>
                ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">No trailer available</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { Media, Video } from '@/types'
import { getMediaVideos } from '@/lib/tmdb'
import { Star, Bookmark } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { useMovieStore } from '@/store/movie-store'
import { Badge } from '@/components/ui/badge'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const getImageUrl = (path: string | null) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://placehold.co/500x750'
}

export function MovieDetailsDialog({ movie: media, open, onOpenChange }: { movie: Media; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [trailer, setTrailer] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const { genreMap, bookmarks, toggleBookmark } = useMovieStore()
  const { toast } = useToast()
  
  const isBookmarked = bookmarks.some((b) => b.id === media.id)

  const mediaGenres = media.genre_ids
    .map(id => genreMap.get(id))
    .filter((name): name is string => !!name);

  useEffect(() => {
    if (open) {
      // Push a state to history when the dialog opens
      window.history.pushState({ dialogOpen: true }, '')
      
      const handlePopState = (event: PopStateEvent) => {
        // If the state we pushed is gone, close the dialog
        if (!event.state?.dialogOpen) {
          onOpenChange(false)
        }
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) {
      setLoading(true)
      const fetchTrailer = async () => {
        const videos = await getMediaVideos(media.id, media.media_type)
        const officialTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official)
                          || videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
                          || videos.find(v => v.site === 'YouTube');
        setTrailer(officialTrailer || null)
        setLoading(false)
      }
      fetchTrailer()
    }
  }, [media.id, media.media_type, open])

  const handleOpenChange = (isOpen: boolean) => {
    // If the dialog is being closed by the user (not by popstate)
    // and our history state is still there, go back.
    if (!isOpen && window.history.state?.dialogOpen) {
      window.history.back()
    }
    onOpenChange(isOpen)
  }

  const handleBookmarkToggle = () => {
    toggleBookmark(media);
    toast({
      title: isBookmarked ? 'Bookmark Removed' : 'Bookmark Added',
      description: `"${media.title}" has been ${isBookmarked ? 'removed from' : 'added to'} your bookmarks.`,
      duration: 3000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="relative w-full hidden sm:flex ">
           <Image
            src={getImageUrl(media.poster_path)}
            alt={`Poster for ${media.title}`}
            fill
            className="object-cover rounded-t-lg md:rounded-tr-none md:rounded-bl-lg"
            data-ai-hint="movie poster"
          />
          </div>
          <div className="md:col-span-2 p-6">
              <DialogHeader className="text-left mb-4">
                <DialogTitle className="text-3xl font-headline mb-2">{media.title}</DialogTitle>
                <div className="flex items-center text-sm text-muted-foreground gap-4 flex-wrap">
                    <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1.5 fill-yellow-400 text-yellow-400" />
                        <span>{media.vote_average > 0 ? media.vote_average.toFixed(1) : 'N/A'}</span>
                    </div>
                    {media.release_date && <span>{new Date(media.release_date).getFullYear()}</span>}
                     <Badge variant={media.media_type === 'movie' ? 'default' : 'secondary'}>
                        {media.media_type === 'movie' ? 'Movie' : 'TV Show'}
                    </Badge>
                </div>
              </DialogHeader>

            {mediaGenres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {mediaGenres.map((genre) => (
                  <Badge key={genre} variant="secondary">{genre}</Badge>
                ))}
              </div>
            )}
            
            <Button
              onClick={handleBookmarkToggle}
              variant="outline"
              className="w-full mb-6"
            >
              <Bookmark className={cn("mr-2 h-4 w-4", isBookmarked && "fill-primary text-primary")} />
              {isBookmarked ? 'Remove from Bookmarks' : 'Add to Bookmarks'}
            </Button>
            
            <DialogDescription className="text-base text-foreground/80 mb-6">{media.overview}</DialogDescription>
            
            <div>
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

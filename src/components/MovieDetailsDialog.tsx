'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Media, Video } from '@/types'
import { getMediaVideos, getMediaCredits, getMediaReviews, type CastMember, type Review } from '@/lib/tmdb'
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
  const [cast, setCast] = useState<CastMember[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
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
      const fetchData = async () => {
        const [videos, credits, reviewsData] = await Promise.all([
          getMediaVideos(media.id, media.media_type),
          getMediaCredits(media.id, media.media_type),
          getMediaReviews(media.id, media.media_type)
        ])

        const officialTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official)
          || videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
          || videos.find(v => v.site === 'YouTube');

        setTrailer(officialTrailer || null)
        setCast(credits.cast.slice(0, 10)) // Top 10 cast members
        setReviews(reviewsData)
        setLoading(false)
      }
      fetchData()
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

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cast">Cast</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
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
              </TabsContent>

              <TabsContent value="cast" className="mt-4">
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {cast.map((member) => (
                      <div key={member.id} className="flex items-center space-x-4">
                        <div className="relative w-10 h-10 overflow-hidden rounded-full bg-muted">
                          {member.profile_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                              alt={member.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-xs font-bold">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.character}</p>
                        </div>
                      </div>
                    ))}
                    {cast.length === 0 && <p className="text-muted-foreground col-span-2">No cast information available.</p>}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{review.author}</h4>
                          <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                          {review.content}
                        </p>
                      </div>
                    ))}
                    {reviews.length === 0 && <p className="text-muted-foreground">No reviews available.</p>}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

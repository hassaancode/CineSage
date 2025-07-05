'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { Media } from '@/types'
import { Star } from 'lucide-react'
import { MovieDetailsDialog } from './MovieDetailsDialog'
import { Badge } from './ui/badge'

const getImageUrl = (path: string | null) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://placehold.co/500x750'
}

export function MovieCard({ movie: media }: { movie: Media }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.39, 0.24, 0.3, 1],
      },
    },
  }

  return (
    <>
      <motion.div variants={cardVariants} className="flex flex-col h-full">
        <Card
          className="overflow-hidden border-2 bg-card/50 border-transparent hover:border-primary hover:bg-card transition-all duration-300 group flex flex-col cursor-pointer h-full"
          onClick={() => setIsDialogOpen(true)}
        >
          <CardHeader className="p-0">
            <div className="relative aspect-[2/3] w-full">
              <Badge variant={media.media_type === 'movie' ? 'default' : 'secondary'} className="absolute top-2 right-2 z-10">
                {media.media_type === 'movie' ? 'Movie' : 'TV'}
              </Badge>
              <Image
                src={getImageUrl(media.poster_path)}
                alt={`Poster for ${media.title}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="movie poster"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2 flex-grow flex flex-col">
            <CardTitle className="font-headline text-lg line-clamp-2 flex-grow">{media.title}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground pt-2">
              <Star className="w-4 h-4 mr-1.5 fill-yellow-400 text-yellow-400" />
              <span>{media.vote_average > 0 ? media.vote_average.toFixed(1) : 'N/A'}</span>
              {media.release_date && <span className="ml-auto">{new Date(media.release_date).getFullYear()}</span>}
            </div>
            <CardDescription className="line-clamp-3 text-sm text-muted-foreground">{media.overview}</CardDescription>
          </CardContent>
        </Card>
      </motion.div>
      <MovieDetailsDialog movie={media} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  )
}

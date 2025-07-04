'use client'

import { useMovieStore } from '@/store/movie-store'
import { Badge } from '@/components/ui/badge'

export function AnalyzedClues() {
  const analysis = useMovieStore((state) => state.analysis)

  if (!analysis) return null

  const hasGenres = analysis.relevantGenres && analysis.relevantGenres.length > 0;
  const hasClues = analysis.otherContextClues && analysis.otherContextClues.trim() !== '' && analysis.otherContextClues.trim().toLowerCase() !== 'none';


  if (!hasGenres && !hasClues) return null

  return (
    <div className="mt-8 mb-4 animate-in fade-in-0 duration-500">
        <h2 className="text-lg font-headline text-muted-foreground mb-3">AI Analysis:</h2>
        <div className="flex flex-wrap items-center gap-2">
            {hasGenres && analysis.relevantGenres.map((genre) => (
                <Badge key={genre} variant="secondary" className="text-sm px-3 py-1 cursor-default">{genre}</Badge>
            ))}
            {hasClues && (
              <p className="text-muted-foreground text-sm"><strong className="text-foreground font-medium">Other clues:</strong> {analysis.otherContextClues}</p>
            )}
        </div>
    </div>
  )
}

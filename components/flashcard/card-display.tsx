'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface FlashcardDisplayProps {
  frontHtml: string
  backHtml: string
  isFlipped?: boolean
  onFlip?: () => void
  className?: string
}

export function FlashcardDisplay({ frontHtml, backHtml, isFlipped = false, onFlip, className }: FlashcardDisplayProps) {
  const [internalFlipped, setInternalFlipped] = useState(false)
  
  // Usa prop se fornecida, senão usa estado interno
  const flipped = onFlip !== undefined ? isFlipped : internalFlipped
  const handleFlip = () => {
    if (onFlip) {
      onFlip()
    } else {
      setInternalFlipped(!internalFlipped)
    }
  }

  return (
    <div className={cn('flashcard', flipped && 'flashcard-flipped', className)}>
      <div className="flashcard-inner" onClick={handleFlip}>
        {/* Frente */}
        <Card className="flashcard-front cursor-pointer h-full flex items-center justify-center">
          <CardContent className="p-8 text-center w-full flex items-center justify-center min-h-full">
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: frontHtml }}
            />
          </CardContent>
        </Card>

        {/* Verso */}
        <Card className="flashcard-back cursor-pointer h-full flex items-center justify-center">
          <CardContent className="p-8 text-center w-full flex items-center justify-center min-h-full">
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: backHtml }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

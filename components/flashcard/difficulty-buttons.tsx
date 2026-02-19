'use client'

import { Button } from '@/components/ui/button'
import { DifficultyRating } from '@/types/study'
import { formatInterval, calculateIntervalPreview } from '@/lib/algorithm/fsrs'
import { CardReviewData } from '@/types/study'

interface DifficultyButtonsProps {
  onRate: (rating: DifficultyRating) => void
  disabled?: boolean
  cardData?: CardReviewData
}

export function DifficultyButtons({ onRate, disabled, cardData }: DifficultyButtonsProps) {
  const intervals = cardData ? calculateIntervalPreview(cardData) : { 1: 1, 2: 1, 3: 6, 4: 7 }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-2xl">
      <Button
        variant="destructive"
        onClick={() => onRate(1)}
        disabled={disabled}
        className="h-auto flex-col py-4"
        size="lg"
      >
        <span className="font-bold text-lg">Errei</span>
        <span className="text-xs opacity-80 mt-1">{formatInterval(intervals[1])}</span>
      </Button>
      <Button
        onClick={() => onRate(2)}
        disabled={disabled}
        className="h-auto flex-col py-4 bg-orange-500 hover:bg-orange-600"
        size="lg"
      >
        <span className="font-bold text-lg">Difícil</span>
        <span className="text-xs opacity-80 mt-1">{formatInterval(intervals[2])}</span>
      </Button>
      <Button
        onClick={() => onRate(3)}
        disabled={disabled}
        className="h-auto flex-col py-4 bg-green-500 hover:bg-green-600"
        size="lg"
      >
        <span className="font-bold text-lg">Bom</span>
        <span className="text-xs opacity-80 mt-1">{formatInterval(intervals[3])}</span>
      </Button>
      <Button
        onClick={() => onRate(4)}
        disabled={disabled}
        className="h-auto flex-col py-4 bg-blue-500 hover:bg-blue-600"
        size="lg"
      >
        <span className="font-bold text-lg">Fácil</span>
        <span className="text-xs opacity-80 mt-1">{formatInterval(intervals[4])}</span>
      </Button>
    </div>
  )
}

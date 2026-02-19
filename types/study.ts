export type CardState = 'new' | 'learning' | 'review' | 'relearning'

export type DifficultyRating = 1 | 2 | 3 | 4

export interface ReviewResult {
  newEaseFactor: number
  newInterval: number
  newRepetitions: number
  newState: CardState
  dueDate: Date
}

export interface CardReviewData {
  easeFactor: number
  interval: number
  repetitions: number
  state: CardState
}

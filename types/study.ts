export type CardState = 'new' | 'learning' | 'review' | 'relearning'

export type DifficultyRating = 1 | 2 | 3 | 4

export interface ReviewResult {
  newEaseFactor: number
  newInterval: number
  newRepetitions: number
  newState: CardState
  dueDate: Date
  // FSRS fields
  newDifficulty: number
  newStability: number
  newRetrievability: number
}

export interface CardReviewData {
  easeFactor: number
  interval: number
  repetitions: number
  state: CardState
  // FSRS fields
  difficulty: number
  stability: number
  retrievability: number
  lastReviewDate?: Date
}

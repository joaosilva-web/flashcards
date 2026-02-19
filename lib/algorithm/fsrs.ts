import type { CardReviewData, DifficultyRating, ReviewResult, CardState } from '@/types/study'

// ============================================
// FSRS (Free Spaced Repetition Scheduler)
// ============================================
// Implementação do algoritmo FSRS de repetição espaçada
// Documentação: fsrs.md

// Constantes do algoritmo
const REQUEST_RETENTION = 0.9 // Retenção desejada (90%)
const MAXIMUM_INTERVAL = 36500 // ~100 anos em dias
const MINIMUM_STABILITY = 0.1 // Estabilidade mínima
const MIN_DIFFICULTY = 1.0
const MAX_DIFFICULTY = 10.0

// Parâmetros treináveis do FSRS (valores otimizados empiricamente)
const FSRS_WEIGHTS = {
  // Pesos para atualização de estabilidade (quando acerta)
  w1: 0.4072, // e^(w1)
  w2: 1.1829, // D^(w2)
  w3: 3.1262, // S^(w3)
  w4: 15.4722, // (1-R)^(w4)

  // Peso para atualização de dificuldade
  w5: 0.5846, // taxa de ajuste de dificuldade

  // Pesos para estabilidade inicial (primeiro aprendizado)
  w6: 1.0, // multiplicador base de estabilidade inicial
  w7: 0.1, // fator de dificuldade inicial

  // Pesos para reaprendizado (quando erra)
  w8: 0.9, // fator de retenção de estabilidade após erro
  w9: 2.0, // fator de recuperação de estabilidade
}

/**
 * Calcula a probabilidade de lembrar após t dias
 * R(t) = e^(-t/S)
 * @param stability - Estabilidade da memória em dias
 * @param daysSinceReview - Dias desde a última revisão
 * @returns Probabilidade de lembrar (0-1)
 */
function calculateRetrievability(stability: number, daysSinceReview: number): number {
  if (stability <= 0) return 1.0
  if (daysSinceReview <= 0) return 1.0

  const retrievability = Math.exp(-daysSinceReview / stability)
  return Math.max(0, Math.min(1, retrievability))
}

/**
 * Calcula o próximo intervalo baseado na retenção desejada
 * t = -S * ln(R_target)
 * @param stability - Estabilidade atual
 * @param requestRetention - Retenção desejada (padrão 0.9)
 * @returns Intervalo em dias
 */
function calculateInterval(
  stability: number,
  requestRetention: number = REQUEST_RETENTION
): number {
  if (stability <= 0) return 0

  const interval = -stability * Math.log(requestRetention)
  return Math.max(1, Math.min(MAXIMUM_INTERVAL, Math.round(interval)))
}

/**
 * Atualiza a estabilidade quando o usuário acerta
 * S' = S * (1 + e^(w1) * D^(w2) * S^(w3) * (1-R)^(w4))
 * @param currentStability - Estabilidade atual
 * @param difficulty - Dificuldade do card
 * @param retrievability - Probabilidade de lembrar
 * @returns Nova estabilidade
 */
function updateStabilityOnSuccess(
  currentStability: number,
  difficulty: number,
  retrievability: number
): number {
  const { w1, w2, w3, w4 } = FSRS_WEIGHTS

  // Se for primeira revisão, usar estabilidade mínima
  if (currentStability < MINIMUM_STABILITY) {
    currentStability = MINIMUM_STABILITY
  }

  // Calcular ganho de estabilidade
  const successFactor = 1 - retrievability // "surpresa" - quanto mais difícil, maior o ganho
  const difficultyFactor = Math.pow(difficulty, -w2) // cards mais difíceis ganham menos
  const stabilityFactor = Math.pow(currentStability, -w3) // estabilidade diminui retornos
  const retrievabilityFactor = Math.pow(successFactor, w4)

  const stabilityGain = Math.exp(w1) * difficultyFactor * stabilityFactor * retrievabilityFactor
  const newStability = currentStability * (1 + stabilityGain)

  return Math.max(MINIMUM_STABILITY, newStability)
}

/**
 * Atualiza a estabilidade quando o usuário erra (reaprendizado)
 * S' = w8 * S^w9
 * @param currentStability - Estabilidade atual
 * @returns Nova estabilidade (reduzida)
 */
function updateStabilityOnFailure(currentStability: number): number {
  const { w8, w9 } = FSRS_WEIGHTS

  if (currentStability < MINIMUM_STABILITY) {
    return MINIMUM_STABILITY
  }

  // Reaprender: estabilidade é reduzida mas não volta ao zero
  const newStability = w8 * Math.pow(currentStability, w9)

  return Math.max(MINIMUM_STABILITY, newStability)
}

/**
 * Atualiza a dificuldade do card baseado na performance
 * D' = D + w5 * (rating - expected_rating)
 * @param currentDifficulty - Dificuldade atual
 * @param rating - Avaliação do usuário (1-4)
 * @param retrievability - Probabilidade estimada de lembrar
 * @returns Nova dificuldade
 */
function updateDifficulty(
  currentDifficulty: number,
  rating: DifficultyRating,
  retrievability: number
): number {
  const { w5 } = FSRS_WEIGHTS

  // Expected rating baseado na retrievability:
  // R alta -> deveria ser fácil (rating 4)
  // R baixa -> deveria ser difícil (rating 2)
  const expectedRating = 1 + 3 * retrievability // mapeia [0,1] -> [1,4]

  // Se acertou quando R era baixa -> reduz dificuldade (card mais fácil)
  // Se errou quando R era alta -> aumenta dificuldade (card mais difícil)
  const difficultyDelta = w5 * (5 - rating - expectedRating)
  const newDifficulty = currentDifficulty + difficultyDelta

  return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, newDifficulty))
}

/**
 * Calcula a estabilidade inicial para cards novos
 * @param rating - Primeira avaliação do card
 * @returns Estabilidade inicial
 */
function calculateInitialStability(rating: DifficultyRating): number {
  const { w6, w7 } = FSRS_WEIGHTS

  // Rating maior -> maior estabilidade inicial
  // 1 (Again) -> ~0.4 dias
  // 2 (Hard) -> ~1.0 dia
  // 3 (Good) -> ~2.5 dias
  // 4 (Easy) -> ~7.0 dias
  const baseStability = w6 * Math.pow(rating, w7 * rating)

  return Math.max(MINIMUM_STABILITY, baseStability)
}

/**
 * Calcula o próximo estado de revisão usando FSRS
 * @param currentData - Dados atuais do card
 * @param rating - Avaliação de dificuldade (1=Again, 2=Hard, 3=Good, 4=Easy)
 * @returns Novo estado de revisão do card
 */
export function calculateNextReview(
  currentData: CardReviewData,
  rating: DifficultyRating
): ReviewResult {
  let {
    difficulty,
    stability,
    retrievability,
    interval,
    repetitions,
    state,
    easeFactor,
    lastReviewDate,
  } = currentData

  // Calcular retrievability atual se houver última revisão
  let currentRetrievability = retrievability
  if (lastReviewDate && stability > 0) {
    const daysSinceReview = Math.max(
      0,
      (Date.now() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    currentRetrievability = calculateRetrievability(stability, daysSinceReview)
  }

  let newDifficulty = difficulty
  let newStability = stability
  let newRetrievability = 1.0
  let newInterval = 0
  let newRepetitions = repetitions
  let newState: CardState = state
  let newEaseFactor = easeFactor

  // Card novo - estabelecer valores iniciais
  if (state === 'new') {
    if (rating >= 2) {
      // Acertou pela primeira vez (incluindo "Difícil")
      newStability = calculateInitialStability(rating)
      newDifficulty = 5.0 + (4 - rating) * 1.5 // Rating 4 -> D=3.5, Rating 3 -> D=6.5, Rating 2 -> D=8.0
      newRetrievability = 1.0
      newRepetitions = 1
      newState = 'learning'
      newInterval = calculateInterval(newStability)

      // Se rating 2 (Hard), reduzir intervalo
      if (rating === 2) {
        newInterval = Math.max(1, Math.round(newInterval * 0.5))
      }
    } else {
      // rating === 1: Errou pela primeira vez
      newStability = MINIMUM_STABILITY
      newDifficulty = 7.0
      newRetrievability = 0.0
      newRepetitions = 0
      newState = 'learning'
      newInterval = 0
    }
  } else {
    // Card em aprendizado ou revisão
    if (rating >= 2) {
      // Acertou (incluindo "Difícil" que é rating 2)
      newStability = updateStabilityOnSuccess(stability, difficulty, currentRetrievability)
      newDifficulty = updateDifficulty(difficulty, rating, currentRetrievability)
      newRetrievability = 1.0
      newRepetitions += 1
      newState = newRepetitions >= 2 ? 'review' : 'learning'
      newInterval = calculateInterval(newStability)

      // Ajuste fino baseado no rating
      if (rating === 4) {
        // Easy: aumentar intervalo um pouco mais
        newInterval = Math.round(newInterval * 1.2)
      } else if (rating === 2) {
        // Hard: reduzir intervalo significativamente
        newInterval = Math.max(1, Math.round(newInterval * 0.5))
      }
    } else {
      // rating === 1: Errou completamente - reaprendizado
      newStability = updateStabilityOnFailure(stability)
      newDifficulty = updateDifficulty(difficulty, rating, currentRetrievability)
      newRetrievability = 0.0
      newRepetitions = 0
      newState = 'relearning'
      newInterval = 0
    }
  }

  // Garantir limites
  newStability = Math.max(MINIMUM_STABILITY, newStability)
  newDifficulty = Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, newDifficulty))
  newRetrievability = Math.max(0, Math.min(1, newRetrievability))
  newInterval = Math.max(0, Math.min(MAXIMUM_INTERVAL, newInterval))

  // Manter ease_factor para compatibilidade (será removido no futuro)
  // Mapear difficulty para ease_factor: D alto -> EF baixo
  newEaseFactor = Math.max(1.3, Math.min(2.5, 2.5 - (newDifficulty - 5.0) * 0.15))

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + newInterval)

  return {
    newEaseFactor,
    newInterval,
    newRepetitions,
    newState,
    dueDate,
    newDifficulty,
    newStability,
    newRetrievability,
  }
}

/**
 * Calcula os intervalos sugeridos para cada rating
 * @param currentData - Dados atuais do card
 * @returns Mapa de ratings para intervalos em dias
 */
export function calculateIntervalPreview(
  currentData: CardReviewData
): Record<DifficultyRating, number> {
  const { state, stability, difficulty, retrievability } = currentData

  // Para cards novos (stability = 0), simular o que aconteceria em cada rating
  if (state === 'new' || stability <= 0) {
    return {
      1: 0, // Again: revisar hoje
      2: 1, // Hard: 1 dia (usando estabilidade inicial mínima)
      3: Math.round(calculateInterval(calculateInitialStability(3))), // Good: ~4 dias
      4: Math.round(calculateInterval(calculateInitialStability(4))), // Easy: ~7 dias
    }
  }

  // Para cards em aprendizado/revisão
  // Calcular retrievability atual se não fornecida
  const currentRetrievability =
    retrievability !== undefined ? retrievability : calculateRetrievability(stability, 0)

  // Simular a nova estabilidade para cada rating
  const previewStabilities = {
    1: updateStabilityOnFailure(stability), // Again: estabilidade reduzida
    2: updateStabilityOnSuccess(stability, difficulty, currentRetrievability) * 0.5, // Hard: reduzir mais
    3: updateStabilityOnSuccess(stability, difficulty, currentRetrievability), // Good: estabilidade normal
    4: updateStabilityOnSuccess(stability, difficulty, currentRetrievability) * 1.2, // Easy: bônus
  }

  return {
    1: 0, // Again: revisar hoje
    2: Math.max(1, calculateInterval(previewStabilities[2])), // Hard
    3: calculateInterval(previewStabilities[3]), // Good
    4: calculateInterval(previewStabilities[4]), // Easy
  }
}

/**
 * Formata o intervalo em uma string legível
 * @param days - Número de dias
 * @returns String formatada (ex: "< 1m", "4d", "2mo")
 */
export function formatInterval(days: number): string {
  if (days === 0) return '< 1m'
  if (days === 1) return '1 dia'
  if (days < 30) return `${days} dias`
  if (days < 365) {
    const months = Math.round(days / 30)
    return `${months} ${months === 1 ? 'mês' : 'meses'}`
  }
  const years = Math.round(days / 365)
  return `${years} ${years === 1 ? 'ano' : 'anos'}`
}

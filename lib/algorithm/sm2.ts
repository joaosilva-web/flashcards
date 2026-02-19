import type { CardReviewData, DifficultyRating, ReviewResult, CardState } from '@/types/study'

const MIN_EASE_FACTOR = 1.3
const MAX_EASE_FACTOR = 2.5

/**
 * Calcula o próximo estado de revisão de um card baseado no algoritmo SM-2
 * @param currentData - Dados atuais do card
 * @param rating - Avaliação de dificuldade (1=Again, 2=Hard, 3=Good, 4=Easy)
 * @returns Novo estado de revisão do card
 */
export function calculateNextReview(
  currentData: CardReviewData,
  rating: DifficultyRating
): ReviewResult {
  let { easeFactor, interval, repetitions, state } = currentData

  // Calcular novo Ease Factor apenas se não estiver em reaprendizagem repetida
  // ou se a resposta for positiva (>= 3)
  let newEaseFactor = easeFactor
  
  if (rating >= 3 || state !== 'relearning') {
    // Só penalizar EF se não estiver preso em relearning
    newEaseFactor = calculateEaseFactor(easeFactor, rating)
  } else {
    // Em relearning e errando novamente: manter EF no mínimo
    newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor)
  }

  // Determinar novo intervalo baseado na resposta
  if (rating < 3) {
    // Resposta incorreta (Errei ou Difícil)
    repetitions = 0
    state = state === 'new' ? 'learning' : 'relearning'
    
    // Aplicar intervalo mínimo de 0 dias (revisar hoje mesmo)
    interval = 0
  } else {
    // Resposta correta (Good ou Easy)
    repetitions += 1

    if (repetitions === 1) {
      // Primeira revisão correta
      if (rating === 4) {
        // Fácil: pular para intervalo maior
        interval = 4
        state = 'learning'
      } else if (rating === 3) {
        // Bom: intervalo padrão
        interval = 1
        state = 'learning'
      } else {
        // Difícil (rating 2): intervalo reduzido
        interval = 1
        state = 'learning'
      }
    } else if (repetitions === 2) {
      interval = 6
      state = 'review'
    } else {
      interval = Math.round(interval * newEaseFactor)
      state = 'review'
    }

    // Ajuste adicional baseado no rating (para repetitions >= 3)
    if (repetitions >= 3) {
      if (rating === 4) {
        // Easy: aumentar intervalo
        interval = Math.round(interval * 1.3)
      } else if (rating === 2) {
        // Hard (mas correto): reduzir intervalo
        interval = Math.max(1, Math.round(interval * 0.85))
      }
    }
  }

  // Calcular data de vencimento
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + interval)

  // VALIDAÇÃO FINAL: Garantir absolutamente que ease_factor está válido
  if (isNaN(newEaseFactor) || !isFinite(newEaseFactor) || newEaseFactor < MIN_EASE_FACTOR || newEaseFactor > MAX_EASE_FACTOR) {
    console.error('🚨 ERRO: ease_factor inválido detectado!', {
      original: easeFactor,
      calculated: newEaseFactor,
      rating,
      state,
    })
    newEaseFactor = Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEaseFactor))
    if (isNaN(newEaseFactor) || !isFinite(newEaseFactor)) {
      newEaseFactor = 2.5 // Fallback final
    }
  }

  return {
    newEaseFactor,
    newInterval: interval,
    newRepetitions: repetitions,
    newState: state,
    dueDate,
    // FSRS fields (estimados para compatibilidade)
    newDifficulty: Math.max(1.0, Math.min(10.0, 2.5 - (newEaseFactor - 5.0) * 0.15)),
    newStability: Math.max(0.1, interval),
    newRetrievability: rating >= 3 ? 1.0 : 0.0,
  }
}

/**
 * Calcula o novo Ease Factor baseado na fórmula SM-2
 * @param currentEF - Ease Factor atual
 * @param rating - Avaliação de dificuldade (1-4)
 * @returns Novo Ease Factor
 */
function calculateEaseFactor(currentEF: number, rating: DifficultyRating): number {
  // Validar entrada
  if (isNaN(currentEF) || !isFinite(currentEF) || currentEF < 1.3) {
    currentEF = 2.5 // Resetar para valor padrão se inválido
  }
  
  // Fórmula SM-2
  const newEF = currentEF + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))

  // Garantir limites
  const safeEF = Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEF))
  
  // Validação final
  if (isNaN(safeEF) || !isFinite(safeEF)) {
    return 2.5 // Fallback para valor padrão
  }
  
  return safeEF
}

/**
 * Calcula os intervalos sugeridos para cada rating
 * @param currentData - Dados atuais do card
 * @returns Mapa de ratings para intervalos em dias
 */
export function calculateIntervalPreview(
  currentData: CardReviewData
): Record<DifficultyRating, number> {
  return {
    1: 0, // Again: revisar hoje
    2: 0, // Hard: revisar hoje
    3: calculateNextReview(currentData, 3).newInterval, // Good
    4: calculateNextReview(currentData, 4).newInterval, // Easy
  }
}

/**
 * Formata o intervalo em uma string legível
 * @param days - Número de dias
 * @returns String formatada (ex: "< 1m", "4d", "2mo")
 */
export function formatInterval(days: number): string {
  if (days === 0) {
    return 'Hoje'
  } else if (days === 1) {
    return '1d'
  } else if (days < 30) {
    return `${days}d`
  } else if (days < 365) {
    const months = Math.round(days / 30)
    return `${months}mo`
  } else {
    const years = Math.round(days / 365)
    return `${years}y`
  }
}

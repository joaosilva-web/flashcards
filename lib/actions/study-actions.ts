'use server'

import { createServerClient } from '@/lib/supabase/server'
import { calculateNextReview } from '@/lib/algorithm/fsrs'
import { getStudyCards } from '@/lib/algorithm/scheduler'
import { DifficultyRating } from '@/types/study'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type StudySession = Database['public']['Tables']['study_sessions']['Row']
type CardState = Database['public']['Tables']['card_states']['Row']
type CardStateWithCard = {
  card_id: string
  cards: {
    id: string
    front_html: string
    back_html: string
  }
}

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }

export async function reviewCard(cardId: string, rating: DifficultyRating, timeSpentMs: number) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Buscar estado atual do card
  const { data: cardState, error: stateError } = (await supabase
    .from('card_states')
    .select('*')
    .eq('card_id', cardId)
    .eq('user_id', user.id)
    .single()) as { data: CardState | null; error: any }

  if (stateError || !cardState) {
    return { success: false, error: 'Estado do card não encontrado' }
  }

  // Calcular última revisão para retrievability
  let lastReviewDate: Date | undefined
  if (cardState.last_review_date) {
    lastReviewDate = new Date(cardState.last_review_date)
  }

  // Calcular próximo estado usando algoritmo FSRS
  const nextReview = calculateNextReview(
    {
      easeFactor: cardState.ease_factor,
      interval: cardState.interval_days,
      repetitions: cardState.repetitions,
      state: cardState.state,
      difficulty: cardState.difficulty,
      stability: cardState.stability,
      retrievability: cardState.retrievability,
      lastReviewDate,
    },
    rating
  )

  // Garantir limites FSRS
  const safeDifficulty = Math.max(1.0, Math.min(10.0, nextReview.newDifficulty))
  const safeStability = Math.max(0.1, nextReview.newStability)
  const safeRetrievability = Math.max(0, Math.min(1, nextReview.newRetrievability))
  const safeInterval = Math.max(0, Math.round(nextReview.newInterval))

  // Manter ease_factor para compatibilidade (será removido no futuro)
  let safeEaseFactor = nextReview.newEaseFactor
  safeEaseFactor = Math.max(1.3, Math.min(2.5, safeEaseFactor))

  console.log('📊 FSRS Review:', {
    cardId: cardState.card_id,
    rating,
    difficulty: { prev: cardState.difficulty, new: safeDifficulty },
    stability: { prev: cardState.stability, new: safeStability },
    retrievability: { prev: cardState.retrievability, new: safeRetrievability },
    interval: safeInterval,
    state: nextReview.newState,
    dueDate: nextReview.dueDate.toISOString(),
    now: new Date().toISOString(),
  })

  // Atualizar estado do card
  const { data: updateData, error: updateError } = await supabase
    .from('card_states')
    // @ts-ignore - Supabase type inference issue with update
    .update({
      ease_factor: safeEaseFactor,
      interval_days: safeInterval,
      repetitions: nextReview.newRepetitions,
      state: nextReview.newState,
      due_date: nextReview.dueDate.toISOString(),
      last_review_date: new Date().toISOString(),
      total_reviews: cardState.total_reviews + 1,
      correct_reviews: cardState.correct_reviews + (rating >= 2 ? 1 : 0),
      // FSRS fields
      difficulty: safeDifficulty,
      stability: safeStability,
      retrievability: safeRetrievability,
    })
    .eq('card_id', cardId)
    .eq('user_id', user.id)
    .select()

  if (updateError) {
    console.error('❌ UPDATE ERROR:', updateError)
    return { success: false, error: updateError.message }
  }

  if (!updateData || updateData.length === 0) {
    console.error('❌ UPDATE returned no rows - RLS may be blocking')
    return { success: false, error: 'Falha ao atualizar card_state' }
  }

  const updatedCard = updateData[0] as any
  console.log('✅ Card updated successfully:', {
    interval_days: updatedCard.interval_days,
    due_date: updatedCard.due_date,
    state: updatedCard.state,
  })

  // Registrar log de revisão
  // @ts-ignore - Supabase type inference issue with insert
  await supabase.from('review_logs').insert({
    card_id: cardId,
    user_id: user.id,
    rating,
    time_spent_ms: timeSpentMs,
    previous_ease_factor: cardState.ease_factor,
    previous_interval_days: cardState.interval_days,
    previous_state: cardState.state,
    new_ease_factor: safeEaseFactor,
    new_interval_days: safeInterval,
    new_state: nextReview.newState,
    new_due_date: nextReview.dueDate.toISOString(),
    // FSRS fields
    previous_difficulty: cardState.difficulty,
    previous_stability: cardState.stability,
    previous_retrievability: cardState.retrievability,
    new_difficulty: safeDifficulty,
    new_stability: safeStability,
    new_retrievability: safeRetrievability,
  })

  // Atualizar estatísticas diárias
  const today = new Date().toISOString().split('T')[0]

  type DailyStats = Database['public']['Tables']['daily_stats']['Row']
  const { data: todayStats } = (await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()) as { data: DailyStats | null }

  if (todayStats) {
    await supabase
      .from('daily_stats')
      // @ts-ignore - Supabase type inference issue with update
      .update({
        cards_studied: todayStats.cards_studied + 1,
        cards_correct: todayStats.cards_correct + (rating >= 2 ? 1 : 0),
        new_cards: todayStats.new_cards + (cardState.state === 'new' ? 1 : 0),
        review_cards: todayStats.review_cards + (cardState.state !== 'new' ? 1 : 0),
        total_time_ms: todayStats.total_time_ms + timeSpentMs,
      })
      .eq('id', todayStats.id)
  } else {
    await supabase
      .from('daily_stats')
      // @ts-ignore - Supabase type inference issue with insert
      .insert({
        user_id: user.id,
        date: today,
        cards_studied: 1,
        cards_correct: rating >= 2 ? 1 : 0,
        new_cards: cardState.state === 'new' ? 1 : 0,
        review_cards: cardState.state !== 'new' ? 1 : 0,
        total_time_ms: timeSpentMs,
      })
  }

  return {
    success: true,
    data: {
      nextReview: nextReview.dueDate.toISOString(),
      interval: nextReview.newInterval,
    },
  }
}

export async function getStudyCardsForDeck(deckId?: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado', data: [] }
  }

  try {
    const cards = await getStudyCards(supabase as any, user.id, deckId, 10, 20)
    return { success: true, data: cards }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      data: [],
    }
  }
}

export async function getDueCardsCount(deckId?: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado', count: 0 }
  }

  let query = supabase
    .from('card_states')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .lte('due_date', new Date().toISOString())

  if (deckId) {
    // Filtrar por deck
    type Card = Database['public']['Tables']['cards']['Row']
    const { data: cards } = (await supabase.from('cards').select('id').eq('deck_id', deckId)) as {
      data: Pick<Card, 'id'>[] | null
    }

    if (cards) {
      const cardIds = cards.map((c) => c.id)
      query = query.in('card_id', cardIds)
    }
  }

  const { count, error } = await query

  if (error) {
    return { success: false, error: error.message, count: 0 }
  }

  return { success: true, count: count || 0 }
}

export async function startStudySession(deckId?: string): Promise<ActionResult<StudySession>> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const result = await supabase
    .from('study_sessions')
    // @ts-ignore - Supabase type inference issue with insert
    .insert({
      user_id: user.id,
      deck_id: deckId || null,
    })
    .select()
    .single()

  const { data: session, error } = result as { data: StudySession | null; error: any }

  if (error || !session) {
    return { success: false, error: error?.message || 'Erro ao iniciar sessão de estudo' }
  }

  return { success: true, data: session }
}

export async function endStudySession(
  sessionId: string,
  cardsStudied: number,
  cardsCorrect: number,
  totalTimeMs: number
) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const result = await supabase
    .from('study_sessions')
    // @ts-ignore - Supabase type inference issue with update
    .update({
      ended_at: new Date().toISOString(),
      cards_studied: cardsStudied,
      cards_correct: cardsCorrect,
      total_time_ms: totalTimeMs,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single()

  const { data: session, error } = result as { data: StudySession | null; error: any }

  if (error || !session) {
    return { success: false, error: error?.message || 'Erro ao finalizar sessão de estudo' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/stats')

  return { success: true, data: session }
}

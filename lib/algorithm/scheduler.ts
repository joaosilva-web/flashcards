import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type CardStateWithCard = Database['public']['Tables']['card_states']['Row'] & {
  cards: Database['public']['Tables']['cards']['Row']
}

/**
 * Busca cards que estão vencidos para revisão
 */
export async function getDueCards(
  supabase: SupabaseClient<Database>,
  userId: string,
  deckId?: string,
  limit: number = 20
): Promise<CardStateWithCard[]> {
  let query = supabase
    .from('card_states')
    .select(
      `
      *,
      cards (*)
    `
    )
    .eq('user_id', userId)
    .neq('state', 'new') // Excluir cards novos (já buscados em getNewCards)
    .lte('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })
    .limit(limit)

  if (deckId) {
    query = query.eq('cards.deck_id', deckId)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as any) || []
}

/**
 * Busca cards novos (nunca estudados)
 */
export async function getNewCards(
  supabase: SupabaseClient<Database>,
  userId: string,
  deckId?: string,
  limit: number = 10
): Promise<CardStateWithCard[]> {
  let query = supabase
    .from('card_states')
    .select(
      `
      *,
      cards (*)
    `
    )
    .eq('user_id', userId)
    .eq('state', 'new')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (deckId) {
    query = query.eq('cards.deck_id', deckId)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as any) || []
}

/**
 * Busca todos os cards para revisão (novos + vencidos)
 */
export async function getStudyCards(
  supabase: SupabaseClient<Database>,
  userId: string,
  deckId?: string,
  newCardsLimit: number = 10,
  reviewCardsLimit: number = 20
) {
  const [dueCards, newCards] = await Promise.all([
    getDueCards(supabase, userId, deckId, reviewCardsLimit),
    getNewCards(supabase, userId, deckId, newCardsLimit),
  ])

  // Combinar e embaralhar
  const allCards = [...dueCards, ...newCards]
  return shuffleArray(allCards)
}

/**
 * Embaralha um array (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { parseFlashcardCSV } from '@/lib/parsers/csv-parser'
import { Database } from '@/types/database'

type Card = Database['public']['Tables']['cards']['Row']

export async function importCardsFromCSV(deckId: string, csvContent: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Verificar se o deck pertence ao usuário
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (deckError || !deck) {
    return { success: false, error: 'Deck não encontrado' }
  }

  // Parse do CSV
  const parseResult = await parseFlashcardCSV(csvContent)

  if (!parseResult.success || parseResult.cards.length === 0) {
    const errorMessage =
      parseResult.errors.length > 0
        ? parseResult.errors.join('; ')
        : 'Nenhum card válido encontrado'

    return {
      success: false,
      error: errorMessage,
      details: parseResult.errors,
    }
  }

  // Inserir cards em batch
  const cardsToInsert = parseResult.cards.map((card, index) => ({
    deck_id: deckId,
    front: card.front,
    back: card.back,
    front_html: card.frontHtml,
    back_html: card.backHtml,
    position: index,
  }))

  const result = await supabase
    .from('cards')
    // @ts-ignore - Supabase type inference issue with insert
    .insert(cardsToInsert)
    .select()

  const { data, error } = result as { data: Card[] | null; error: any }

  if (error || !data) {
    return { success: false, error: error?.message || 'Erro ao importar cards' }
  }

  revalidatePath(`/decks/${deckId}`)

  return {
    success: true,
    imported: data.length,
    warnings: parseResult.warnings,
  }
}

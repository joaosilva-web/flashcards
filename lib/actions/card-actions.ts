'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'
import { parseMarkdownToHtml } from '@/lib/parsers/markdown-parser'

type CardInsert = Database['public']['Tables']['cards']['Insert']
type CardUpdate = Database['public']['Tables']['cards']['Update']
type Card = Database['public']['Tables']['cards']['Row']

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }

export async function createCard(
  data: Omit<CardInsert, 'front_html' | 'back_html'>
): Promise<ActionResult<Card>> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Verificar se o deck pertence ao usuário
  const { data: deck } = await supabase
    .from('decks')
    .select('id')
    .eq('id', data.deck_id)
    .eq('user_id', user.id)
    .single()

  if (!deck) {
    return { success: false, error: 'Deck não encontrado' }
  }

  // Converter markdown para HTML
  const frontHtml = parseMarkdownToHtml(data.front)
  const backHtml = parseMarkdownToHtml(data.back)

  const result = await supabase
    .from('cards')
    // @ts-ignore - Supabase type inference issue with insert
    .insert({
      ...data,
      front_html: frontHtml,
      back_html: backHtml,
    })
    .select()
    .single()

  const { data: card, error } = result as { data: Card | null; error: any }

  if (error || !card) {
    return { success: false, error: error?.message || 'Erro ao criar card' }
  }

  revalidatePath(`/decks/${data.deck_id}`)

  return { success: true, data: card }
}

export async function updateCard(
  id: string,
  data: Omit<CardUpdate, 'front_html' | 'back_html'>
): Promise<ActionResult<Card>> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Buscar card e verificar permissão
  const { data: existingCard } = (await supabase
    .from('cards')
    .select('deck_id, decks!inner(user_id)')
    .eq('id', id)
    .single()) as { data: { deck_id: string; decks: { user_id: string } } | null }

  if (!existingCard || existingCard.decks.user_id !== user.id) {
    return { success: false, error: 'Card não encontrado' }
  }

  // Converter markdown para HTML se front ou back foram alterados
  const updateData: any = { ...data }
  if (data.front) {
    updateData.front_html = parseMarkdownToHtml(data.front)
  }
  if (data.back) {
    updateData.back_html = parseMarkdownToHtml(data.back)
  }

  const result = await supabase
    .from('cards')
    // @ts-ignore - Supabase type inference issue with update
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  const { data: card, error } = result as { data: Card | null; error: any }

  if (error || !card) {
    return { success: false, error: error?.message || 'Erro ao atualizar card' }
  }

  revalidatePath(`/decks/${existingCard.deck_id}`)

  return { success: true, data: card }
}

export async function deleteCard(id: string): Promise<ActionResult<void>> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Buscar card e verificar permissão
  const { data: existingCard } = (await supabase
    .from('cards')
    .select('deck_id, decks!inner(user_id)')
    .eq('id', id)
    .single()) as { data: { deck_id: string; decks: { user_id: string } } | null }

  if (!existingCard || existingCard.decks.user_id !== user.id) {
    return { success: false, error: 'Card não encontrado' }
  }

  const { error } = await supabase.from('cards').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/decks/${existingCard.deck_id}`)

  return { success: true, data: undefined }
}

export async function getCard(id: string): Promise<ActionResult<Card & { decks: any }>> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { data: card, error } = await supabase
    .from('cards')
    .select('*, decks!inner(user_id)')
    .eq('id', id)
    .single()

  if (error || !card || (card as any).decks.user_id !== user.id) {
    return { success: false, error: 'Card não encontrado' }
  }

  return { success: true, data: card }
}

export async function getCardsByDeck(deckId: string): Promise<ActionResult<Card[]>> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Verificar se o deck pertence ao usuário
  const { data: deck } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (!deck) {
    return { success: false, error: 'Deck não encontrado' }
  }

  const { data: cards, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('position', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: cards || [] }
}

export async function deleteAllCardsFromDeck(
  deckId: string
): Promise<ActionResult<{ deleted: number }>> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Verificar se o deck pertence ao usuário
  const { data: deck } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single()

  if (!deck) {
    return { success: false, error: 'Deck não encontrado' }
  }

  // Contar quantos cards serão deletados
  const { count } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('deck_id', deckId)

  // Deletar todos os cards do deck
  const { error } = await supabase.from('cards').delete().eq('deck_id', deckId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/decks/${deckId}`)

  return { success: true, data: { deleted: count || 0 } }
}

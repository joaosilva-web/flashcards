'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type DeckInsert = Database['public']['Tables']['decks']['Insert']
type DeckUpdate = Database['public']['Tables']['decks']['Update']
type Deck = Database['public']['Tables']['decks']['Row']

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }

export async function createDeck(data: Omit<DeckInsert, 'user_id'>): Promise<ActionResult<Deck>> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const result = await supabase
    .from('decks')
    // @ts-ignore - Supabase type inference issue with insert
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single()

  const { data: deck, error } = result as { data: Deck | null; error: any }

  if (error || !deck) {
    return { success: false, error: error?.message || 'Erro ao criar deck' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/decks')

  return { success: true, data: deck }
}

export async function updateDeck(id: string, data: DeckUpdate) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const result = await supabase
    .from('decks')
    // @ts-ignore - Supabase type inference issue with update
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  const { data: deck, error } = result as { data: Deck | null; error: any }

  if (error || !deck) {
    return { success: false, error: error?.message || 'Erro ao atualizar deck' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/decks')
  revalidatePath(`/decks/${id}`)

  return { success: true, data: deck }
}

export async function deleteDeck(id: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { error } = await supabase.from('decks').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/decks')

  return { success: true }
}

export async function archiveDeck(id: string) {
  return updateDeck(id, { is_archived: true })
}

export async function unarchiveDeck(id: string) {
  return updateDeck(id, { is_archived: false })
}

export async function getDeck(id: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { data: deck, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: deck }
}

export async function getDecks() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado', data: [] }
  }

  const { data: decks, error } = await supabase
    .from('decks')
    .select(
      `
      *,
      cards:cards(count)
    `
    )
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: decks || [] }
}

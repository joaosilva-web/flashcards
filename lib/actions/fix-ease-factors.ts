'use server'

import { createServerClient } from '@/lib/supabase/server'

/**
 * Corrige ease_factors fora dos limites em todos os cards do usuário
 */
export async function fixEaseFactors() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  try {
    // Buscar todos os card_states do usuário
    const { data: cardStates, error: fetchError } = await supabase
      .from('card_states')
      .select('id, ease_factor')
      .eq('user_id', user.id) as { data: { id: string; ease_factor: number }[] | null; error: any }

    if (fetchError) throw fetchError

    if (!cardStates || cardStates.length === 0) {
      return { success: true, fixed: 0 }
    }

    // Corrigir cards com ease_factor inválido
    let fixed = 0
    for (const state of cardStates) {
      if (state.ease_factor < 1.3 || state.ease_factor > 2.5) {
        const correctedEF = Math.max(1.3, Math.min(2.5, state.ease_factor))
        
        const { error: updateError } = await (supabase
          .from('card_states') as any)
          .update({ ease_factor: correctedEF })
          .eq('id', state.id)
        
        if (updateError) throw updateError
        
        fixed++
      }
    }

    return { success: true, fixed }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

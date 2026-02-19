import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FixEaseFactorsButton } from '@/components/admin/fix-ease-factors-button'

export default async function FixPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Contar cards com problemas
  const { data: invalidCards } = await supabase
    .from('card_states')
    .select('id, ease_factor', { count: 'exact' })
    .eq('user_id', user.id)
    .or('ease_factor.lt.1.3,ease_factor.gt.2.5')

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Correção de Ease Factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Esta ferramenta corrige valores inválidos de <code>ease_factor</code> nos seus cards.
          </p>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold">
              Cards com problemas: {invalidCards?.length || 0}
            </p>
          </div>

          {invalidCards && invalidCards.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Valores serão ajustados para estar entre 1.3 e 2.5
              </p>
              <FixEaseFactorsButton />
            </div>
          )}

          {(!invalidCards || invalidCards.length === 0) && (
            <p className="text-green-600">✅ Todos os cards estão corretos!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

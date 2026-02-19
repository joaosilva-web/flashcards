import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getStudyCardsForDeck, startStudySession } from '@/lib/actions/study-actions'
import { StudySession } from '@/components/study/study-session'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database'

type Deck = Database['public']['Tables']['decks']['Row']

export default async function StudyPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar se o deck existe
  const { data: deck } = (await supabase
    .from('decks')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()) as { data: Deck | null }

  if (!deck) {
    notFound()
  }

  // Buscar cards para estudar
  const cardsResult = await getStudyCardsForDeck(params.id)

  if (!cardsResult.success || cardsResult.data.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/decks/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-2">Estudar: {deck.name}</h1>
        </div>

        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-2">Nenhum card para revisar</h3>
            <p className="text-muted-foreground mb-6">
              Você está em dia! Volte mais tarde para novas revisões.
            </p>
            <Button asChild>
              <Link href={`/decks/${params.id}`}>Voltar ao Baralho</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Criar sessão de estudo
  const sessionResult = await startStudySession(params.id)
  const sessionId = sessionResult.success && sessionResult.data ? sessionResult.data.id : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Estudar: {deck.name}</h1>
        <p className="text-muted-foreground">{cardsResult.data.length} cards para revisar</p>
      </div>

      <StudySession cards={cardsResult.data as any} deckId={params.id} sessionId={sessionId} />
    </div>
  )
}

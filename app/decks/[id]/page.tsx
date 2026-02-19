import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Play, Upload, Clock } from 'lucide-react'
import { Database } from '@/types/database'
import { DeleteAllCardsButton } from '@/components/deck/delete-all-cards-button'
import { AppLayout } from '@/components/layout/app-layout'

type Deck = Database['public']['Tables']['decks']['Row']
type Card = Database['public']['Tables']['cards']['Row']
type CardState = Database['public']['Tables']['card_states']['Row']

type CardWithState = Card & {
  card_states: CardState[]
}

function formatTimeUntilDue(dueDate: string): { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffMs <= 0) {
    return { text: 'Revisar agora', variant: 'destructive' }
  }

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return { text: `${diffMinutes}m`, variant: 'destructive' }
  }

  if (diffHours < 24) {
    return { text: `${diffHours}h`, variant: 'destructive' }
  }

  if (diffDays === 1) {
    return { text: '1 dia', variant: 'secondary' }
  }

  if (diffDays < 7) {
    return { text: `${diffDays} dias`, variant: 'secondary' }
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return { text: `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`, variant: 'outline' }
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return { text: `${months} ${months === 1 ? 'mês' : 'meses'}`, variant: 'outline' }
  }

  const years = Math.floor(diffDays / 365)
  return { text: `${years} ${years === 1 ? 'ano' : 'anos'}`, variant: 'default' }
}

export default async function DeckDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar deck
  const { data: deck, error } = (await supabase
    .from('decks')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()) as { data: Deck | null; error: any }

  if (error || !deck) {
    notFound()
  }

  // Buscar cards do deck com seus estados
  const { data: cards } = (await supabase
    .from('cards')
    .select(`
      *,
      card_states!inner(*)
    `)
    .eq('deck_id', params.id)
    .eq('card_states.user_id', user.id)
    .order('position', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })) as { data: CardWithState[] | null }

  // Buscar cards vencidos para este deck
  const { count: dueCount } = await supabase
    .from('card_states')
    .select('*, cards!inner(deck_id)', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('cards.deck_id', params.id)
    .lte('due_date', new Date().toISOString())

  return (
    <AppLayout>
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/decks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-5xl">{deck.icon}</span>
          <div>
            <h1 className="text-4xl font-bold">{deck.name}</h1>
            {deck.description && <p className="text-muted-foreground mt-1">{deck.description}</p>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cards?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Para Revisar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dueCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Taxa de Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {cards && cards.length > 0
                ? Math.round(((cards.length - (dueCount || 0)) / cards.length) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {(dueCount || 0) > 0 && (
          <Button asChild size="lg" className="flex-1">
            <Link href={`/decks/${params.id}/study`}>
              <Play className="mr-2 h-4 w-4" />
              Estudar ({dueCount} cards)
            </Link>
          </Button>
        )}
        <Button variant="outline" asChild size="lg">
          <Link href={`/decks/${params.id}/import`}>
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href={`/cards/new?deck=${params.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Card
          </Link>
        </Button>
      </div>

      {/* Cards List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Cards ({cards?.length || 0})</h2>
          {cards && cards.length > 0 && (
            <DeleteAllCardsButton deckId={params.id} cardCount={cards.length} />
          )}
        </div>
        {cards && cards.length > 0 ? (
          <div className="space-y-2">
            {cards.map((card: CardWithState) => {
              const cardState = card.card_states[0]
              const timeUntil = cardState ? formatTimeUntilDue(cardState.due_date) : null

              return (
                <Card key={card.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-muted-foreground">Frente</p>
                          {timeUntil && (
                            <Badge variant={timeUntil.variant} className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {timeUntil.text}
                            </Badge>
                          )}
                        </div>
                        <div
                          className="text-sm line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: card.front_html || card.front }}
                        />
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/cards/${card.id}/edit`}>Editar</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground mb-4">Nenhum card neste baralho ainda</p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link href={`/cards/new?deck=${params.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Card
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/decks/${params.id}/import`}>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar CSV
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AppLayout>
  )
}

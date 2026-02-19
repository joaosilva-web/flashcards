import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { DeleteDeckButton } from '@/components/deck/delete-deck-button'

export default async function DecksPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: decks } = await supabase
    .from('decks')
    .select(
      `
      *,
      cards(count)
    `
    )
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Meus Baralhos</h1>
            <p className="text-muted-foreground">Organize seus cards em baralhos temáticos</p>
          </div>
          <Button asChild size="lg">
            <Link href="/decks/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Baralho
            </Link>
          </Button>
        </div>

        {decks && decks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck: any) => (
              <div key={deck.id} className="relative group">
                <Link href={`/decks/${deck.id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{deck.icon}</span>
                        <div className="flex-1">
                          <CardTitle>{deck.name}</CardTitle>
                          {deck.description && (
                            <CardDescription className="mt-1">{deck.description}</CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {deck.cards[0]?.count || 0} cards
                        </p>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: deck.color }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="pointer-events-auto">
                    <DeleteDeckButton
                      deckId={deck.id}
                      deckName={deck.name}
                      cardCount={deck.cards[0]?.count || 0}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum baralho criado ainda</h3>
              <p className="text-muted-foreground mb-6">
                Crie seu primeiro baralho para começar a estudar
              </p>
              <Button asChild size="lg">
                <Link href="/decks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Baralho
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

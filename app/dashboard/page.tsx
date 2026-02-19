import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Plus, TrendingUp } from 'lucide-react'
import { Database } from '@/types/database'
import { AppLayout } from '@/components/layout/app-layout'

type DailyStats = Database['public']['Tables']['daily_stats']['Row']

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar estatísticas
  const { data: decks } = await supabase
    .from('decks')
    .select('*, cards(count)')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .limit(5)

  const { count: dueCount } = await supabase
    .from('card_states')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .lte('due_date', new Date().toISOString())

  const today = new Date().toISOString().split('T')[0]
  const { data: todayStatsData } = (await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .limit(1)) as { data: DailyStats[] | null }

  const todayStats = todayStatsData?.[0] || null

  return (
    <AppLayout>
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Bem-vindo de volta! 👋</h1>
        <p className="text-muted-foreground">Continue sua jornada de aprendizado</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards para Revisar</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueCount || 0}</div>
            <p className="text-xs text-muted-foreground">Cards vencidos hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudados Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats?.cards_studied ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats && todayStats.cards_studied > 0
                ? `Taxa de acerto: ${Math.round((todayStats.cards_correct / todayStats.cards_studied) * 100)}%`
                : 'Comece a estudar!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baralhos Ativos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total de baralhos</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {(dueCount || 0) > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Pronto para estudar?</CardTitle>
            <CardDescription>Você tem {dueCount} cards esperando por revisão</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/decks">Começar Revisão</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Decks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Seus Baralhos</h2>
          <Button variant="outline" asChild>
            <Link href="/decks/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Baralho
            </Link>
          </Button>
        </div>

        {decks && decks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck: any) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{deck.icon}</span>
                      <CardTitle className="text-lg">{deck.name}</CardTitle>
                    </div>
                    {deck.description && <CardDescription>{deck.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {deck.cards[0]?.count || 0} cards
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Você ainda não tem baralhos</p>
              <Button asChild>
                <Link href="/decks/new">Criar Primeiro Baralho</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AppLayout>
  )
}

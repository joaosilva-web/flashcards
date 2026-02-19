import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target, Calendar, Award } from 'lucide-react'
import { Database } from '@/types/database'
import { AppLayout } from '@/components/layout/app-layout'

type DailyStats = Database['public']['Tables']['daily_stats']['Row']
type ReviewLog = Database['public']['Tables']['review_logs']['Row']

export default async function StatsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Estatísticas gerais
  const { count: totalCards } = await supabase
    .from('cards')
    .select('*, decks!inner(user_id)', { count: 'exact', head: true })
    .eq('decks.user_id', user.id)

  const { data: reviewLogs } = (await supabase
    .from('review_logs')
    .select('rating')
    .eq('user_id', user.id)) as { data: Pick<ReviewLog, 'rating'>[] | null }

  const totalReviews = reviewLogs?.length || 0
  const correctReviews = reviewLogs?.filter((r) => r.rating >= 3).length || 0
  const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0

  // Estatísticas dos últimos 7 dias
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: weekStats } = (await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })) as { data: DailyStats[] | null }

  const weekTotal = weekStats?.reduce((sum, day) => sum + day.cards_studied, 0) || 0
  const weekAverage = weekStats?.length ? Math.round(weekTotal / weekStats.length) : 0

  // Calcular streak
  const { data: allStats } = (await supabase
    .from('daily_stats')
    .select('date, cards_studied')
    .eq('user_id', user.id)
    .gte('cards_studied', 1)
    .order('date', { ascending: false })
    .limit(365)) as { data: Pick<DailyStats, 'date' | 'cards_studied'>[] | null }

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (allStats) {
    for (let i = 0; i < allStats.length; i++) {
      const statDate = new Date(allStats[i].date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (statDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }
  }

  return (
    <AppLayout>
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Estatísticas</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso e desempenho</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cards</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCards || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Cards criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{accuracy}%</div>
            <p className="text-xs text-muted-foreground mt-1">{totalReviews} revisões totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streak} dias</div>
            <p className="text-xs text-muted-foreground mt-1">Dias consecutivos estudando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Semanal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weekAverage}</div>
            <p className="text-xs text-muted-foreground mt-1">Cards por dia (últimos 7 dias)</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade dos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          {weekStats && weekStats.length > 0 ? (
            <div className="space-y-2">
              {weekStats.map((day) => {
                const date = new Date(day.date)
                const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' })
                const dayFormatted = date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })
                const percentage = totalCards ? (day.cards_studied / (totalCards * 0.1)) * 100 : 0

                return (
                  <div key={day.date} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {dayName}, {dayFormatted}
                      </span>
                      <span className="text-muted-foreground">
                        {day.cards_studied} cards ({day.cards_correct} corretos)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade registrada nos últimos 7 dias
            </p>
          )}
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      {totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Errei', rating: 1, color: 'bg-red-500' },
                { label: 'Difícil', rating: 2, color: 'bg-orange-500' },
                { label: 'Bom', rating: 3, color: 'bg-green-500' },
                { label: 'Fácil', rating: 4, color: 'bg-blue-500' },
              ].map(({ label, rating, color }) => {
                const count = reviewLogs?.filter((r) => r.rating === rating).length || 0
                const percentage = (count / totalReviews) * 100

                return (
                  <div key={rating} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground">
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </AppLayout>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Brain, TrendingUp, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">FlashLearn</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold tracking-tight">
            Aprenda mais rápido com
            <span className="text-primary"> Repetição Espaçada</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Sistema inteligente de flashcards que se adapta ao seu ritmo de aprendizado. Baseado no
            algoritmo SM-2, usado por milhões de estudantes.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Criar Conta Grátis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-lg border bg-card">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Organize seus Cards</h3>
              <p className="text-muted-foreground">
                Crie baralhos personalizados e importe flashcards via CSV
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Algoritmo Inteligente</h3>
              <p className="text-muted-foreground">
                O sistema ajusta automaticamente o intervalo de revisão
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Acompanhe seu Progresso</h3>
              <p className="text-muted-foreground">
                Estatísticas detalhadas e metas diárias personalizadas
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2026 FlashLearn. Feito com ❤️ para estudantes.</p>
        </div>
      </footer>
    </div>
  )
}

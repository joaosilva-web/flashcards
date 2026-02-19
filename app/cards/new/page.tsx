'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createCard } from '@/lib/actions/card-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { MarkdownEditor } from '@/components/card/markdown-editor'

function NewCardContent() {
  const searchParams = useSearchParams()
  const deckId = searchParams.get('deck')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  if (!deckId) {
    return (
      <AppLayout>
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Deck não especificado</p>
        <Button asChild>
          <Link href="/decks">Voltar aos Baralhos</Link>
        </Button>
      </div>
      </AppLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createCard({
        deck_id: deckId,
        front,
        back,
      })

      if (result.success) {
        toast({
          title: 'Card criado!',
          description: 'O card foi adicionado ao baralho',
        })
        router.push(`/decks/${deckId}`)
        router.refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao criar card',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/decks/${deckId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-2">Novo Card</h1>
        <p className="text-muted-foreground">Crie um novo flashcard com formatação especial</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo do Card</CardTitle>
          <CardDescription>
            Use os botões da barra de ferramentas para aplicar formatações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <MarkdownEditor
              value={front}
              onChange={setFront}
              placeholder="Digite a pergunta ou conceito..."
              disabled={loading}
              label="Frente *"
              showPreview={true}
            />

            <MarkdownEditor
              value={back}
              onChange={setBack}
              placeholder="Digite a resposta..."
              disabled={loading}
              label="Verso *"
              showPreview={true}
            />

            <Button type="submit" disabled={loading || !front || !back} className="w-full">
              {loading ? 'Criando...' : 'Criar Card'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  )
}

export default function NewCardPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </AppLayout>
    }>
      <NewCardContent />
    </Suspense>
  )
}

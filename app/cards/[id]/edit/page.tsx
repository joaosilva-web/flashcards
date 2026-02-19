'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCard, updateCard } from '@/lib/actions/card-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { MarkdownEditor } from '@/components/card/markdown-editor'

export default function EditCardPage() {
  const params = useParams()
  const cardId = params.id as string
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [deckId, setDeckId] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadCard() {
      try {
        const result = await getCard(cardId)
        if (result.success) {
          setFront(result.data.front)
          setBack(result.data.back)
          setDeckId(result.data.deck_id)
        } else {
          toast({
            title: 'Erro',
            description: result.error || 'Card não encontrado',
            variant: 'destructive',
          })
          router.push('/decks')
        }
      } catch (error: any) {
        toast({
          title: 'Erro ao carregar card',
          description: error.message,
          variant: 'destructive',
        })
        router.push('/decks')
      } finally {
        setInitialLoading(false)
      }
    }

    loadCard()
  }, [cardId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateCard(cardId, {
        front,
        back,
      })

      if (result.success) {
        toast({
          title: 'Card atualizado!',
          description: 'As alterações foram salvas',
        })
        router.push(`/decks/${deckId}`)
        router.refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar card',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
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
          <h1 className="text-4xl font-bold mb-2">Editar Card</h1>
          <p className="text-muted-foreground">
            Use os botões da barra de ferramentas para aplicar formatações
          </p>
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
                label="Frente *"
                placeholder="Digite a pergunta ou conceito..."
                disabled={loading}
                showPreview={true}
              />

              <MarkdownEditor
                value={back}
                onChange={setBack}
                label="Verso *"
                placeholder="Digite a resposta..."
                disabled={loading}
                showPreview={true}
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

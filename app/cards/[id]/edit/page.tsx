'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCard, updateCard } from '@/lib/actions/card-actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { FlashcardDisplay } from '@/components/flashcard/card-display'
import { parseMarkdownToHtml } from '@/lib/parsers/markdown-parser'
import { AppLayout } from '@/components/layout/app-layout'

export default function EditCardPage() {
  const params = useParams()
  const cardId = params.id as string
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [deckId, setDeckId] = useState('')
  const [showPreview, setShowPreview] = useState(false)
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

  const frontHtml = front
    ? parseMarkdownToHtml(front)
    : '<p class="text-muted-foreground">Frente do card</p>'
  const backHtml = back
    ? parseMarkdownToHtml(back)
    : '<p class="text-muted-foreground">Verso do card</p>'

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
          <p className="text-muted-foreground">Atualize o conteúdo do flashcard</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Card</CardTitle>
              <CardDescription>
                Use marcações especiais: $formula$, **negrito**, *itálico*
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="front">Frente *</Label>
                  <Textarea
                    id="front"
                    placeholder="Digite a pergunta ou conceito..."
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    required
                    disabled={loading}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="back">Verso *</Label>
                  <Textarea
                    id="back"
                    placeholder="Digite a resposta..."
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    required
                    disabled={loading}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Formatação Disponível</Label>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      • <code className="bg-muted px-1 rounded">$x^2$</code> - Fórmula matemática
                    </p>
                    <p>
                      • <code className="bg-muted px-1 rounded">**texto**</code> - Negrito
                    </p>
                    <p>
                      • <code className="bg-muted px-1 rounded">*texto*</code> - Itálico
                    </p>
                    <p>
                      • <code className="bg-muted px-1 rounded">^texto^</code> - Sobrescrito
                    </p>
                    <p>
                      • <code className="bg-muted px-1 rounded">~texto~</code> - Subscrito
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={loading}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? 'Ocultar' : 'Preview'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <div className="space-y-4">
              <h3 className="font-semibold">Preview do Card</h3>
              <FlashcardDisplay frontHtml={frontHtml} backHtml={backHtml} />
              <p className="text-xs text-center text-muted-foreground">Clique no card para virar</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

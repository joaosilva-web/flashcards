'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createCard } from '@/lib/actions/card-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Eye } from 'lucide-react'
import Link from 'next/link'
import { FlashcardDisplay } from '@/components/flashcard/card-display'
import { parseMarkdownToHtml } from '@/lib/parsers/markdown-parser'
import { AppLayout } from '@/components/layout/app-layout'

function NewCardContent() {
  const searchParams = useSearchParams()
  const deckId = searchParams.get('deck')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [showPreview, setShowPreview] = useState(false)
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

  const frontHtml = front
    ? parseMarkdownToHtml(front)
    : '<p class="text-muted-foreground">Frente do card</p>'
  const backHtml = back
    ? parseMarkdownToHtml(back)
    : '<p class="text-muted-foreground">Verso do card</p>'

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
                  {loading ? 'Criando...' : 'Criar Card'}
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

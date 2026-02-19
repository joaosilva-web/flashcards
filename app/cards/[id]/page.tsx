'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCard, updateCard } from '@/lib/actions/card-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { DeleteCardButton } from '@/components/card/delete-card-button'
import { MarkdownEditor } from '@/components/card/markdown-editor'

export default function EditCardPage() {
  const params = useParams()
  const cardId = params.id as string
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [deckId, setDeckId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadCard()
  }, [cardId])

  const loadCard = async () => {
    setLoading(true)
    try {
      const result = await getCard(cardId)
      if (result.success) {
        setFront(result.data.front)
        setBack(result.data.back)
        setDeckId(result.data.deck_id)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar card',
        description: error.message,
        variant: 'destructive',
      })
      router.push('/decks')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const result = await updateCard(cardId, { front, back })

      if (result.success) {
        toast({
          title: 'Card atualizado!',
          description: 'As alterações foram salvas',
        })
        router.push(`/decks/${deckId}`)
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
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando card...</p>
        </div>
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
        <p className="text-muted-foreground">Modifique o conteúdo do flashcard</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
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
                disabled={saving}
                label="Frente *"
                showPreview={true}
              />

              <MarkdownEditor
                value={back}
                onChange={setBack}
                placeholder="Digite a resposta..."
                disabled={saving}
                label="Verso *"
                showPreview={true}
              />

              <Button type="submit" disabled={saving || !front || !back} className="w-full">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>

              <DeleteCardButton cardId={cardId} deckId={deckId} />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppLayout>
  )
}

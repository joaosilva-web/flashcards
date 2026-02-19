'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteAllCardsFromDeck } from '@/lib/actions/card-actions'
import { useToast } from '@/components/ui/use-toast'

interface DeleteAllCardsButtonProps {
  deckId: string
  cardCount: number
}

export function DeleteAllCardsButton({ deckId, cardCount }: DeleteAllCardsButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Tem certeza que deseja deletar TODOS os ${cardCount} cards deste baralho?\n\n` +
        'Esta ação não pode ser desfeita e removerá também o histórico de revisão.\n\n' +
        'Use esta opção se você deseja limpar o deck antes de reimportar um CSV atualizado.'
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      const result = await deleteAllCardsFromDeck(deckId)

      if (result.success) {
        toast({
          title: 'Cards deletados',
          description: `${result.data.deleted} cards foram removidos com sucesso`,
        })
      } else {
        toast({
          title: 'Erro ao deletar',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao deletar os cards',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (cardCount === 0) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? 'Deletando...' : 'Limpar Deck'}
    </Button>
  )
}

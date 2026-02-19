'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteDeck } from '@/lib/actions/deck-actions'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface DeleteDeckButtonProps {
  deckId: string
  deckName: string
  cardCount: number
}

export function DeleteDeckButton({ deckId, deckName, cardCount }: DeleteDeckButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const confirmed = window.confirm(
      `Tem certeza que deseja deletar o baralho "${deckName}"?\n\n` +
        `Isso irá remover permanentemente:\n` +
        `• ${cardCount} card(s)\n` +
        `• Todo o histórico de revisões\n` +
        `• Todas as estatísticas associadas\n\n` +
        'Esta ação não pode ser desfeita.'
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      const result = await deleteDeck(deckId)

      if (result.success) {
        toast({
          title: 'Baralho deletado',
          description: `"${deckName}" foi removido com sucesso`,
        })
        router.refresh()
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
        description: 'Ocorreu um erro ao deletar o baralho',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

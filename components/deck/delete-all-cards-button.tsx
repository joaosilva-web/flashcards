'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteAllCardsFromDeck } from '@/lib/actions/card-actions'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface DeleteAllCardsButtonProps {
  deckId: string
  cardCount: number
}

export function DeleteAllCardsButton({ deckId, cardCount }: DeleteAllCardsButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDeleting}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deletando...' : 'Limpar Deck'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja deletar TODOS os {cardCount} cards?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita e removerá:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Todos os {cardCount} cards deste baralho</li>
              <li>Todo o histórico de revisão</li>
            </ul>
            <p className="mt-3">
              Use esta opção se você deseja limpar o deck antes de reimportar um CSV atualizado.
            </p>
            <p className="mt-2 font-semibold">Esta ação não pode ser desfeita.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deletando...' : 'Deletar Todos'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

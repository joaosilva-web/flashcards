'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteDeck } from '@/lib/actions/deck-actions'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
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

interface DeleteDeckButtonProps {
  deckId: string
  deckName: string
  cardCount: number
}

export function DeleteDeckButton({ deckId, deckName, cardCount }: DeleteDeckButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja deletar o baralho "{deckName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso irá remover permanentemente:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{cardCount} card(s)</li>
              <li>Todo o histórico de revisões</li>
              <li>Todas as estatísticas associadas</li>
            </ul>
            <p className="mt-3 font-semibold">Esta ação não pode ser desfeita.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

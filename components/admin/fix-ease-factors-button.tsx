'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { fixEaseFactors } from '@/lib/actions/fix-ease-factors'
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

export function FixEaseFactorsButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFix = async () => {
    setLoading(true)
    try {
      const result = await fixEaseFactors()

      if (result.success) {
        toast({
          title: 'Correção concluída',
          description: `${result.fixed} cards corrigidos`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={loading} variant="outline">
          {loading ? 'Corrigindo...' : 'Corrigir Ease Factors'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Corrigir ease factors inválidos?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso vai corrigir todos os ease factors inválidos no banco de dados, definindo-os para o
            valor padrão de 2.5.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleFix} disabled={loading}>
            {loading ? 'Corrigindo...' : 'Continuar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { fixEaseFactors } from '@/lib/actions/fix-ease-factors'
import { useToast } from '@/components/ui/use-toast'

export function FixEaseFactorsButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFix = async () => {
    if (!confirm('Isso vai corrigir ease_factors inválidos. Continuar?')) {
      return
    }

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
    <Button onClick={handleFix} disabled={loading} variant="outline">
      {loading ? 'Corrigindo...' : 'Corrigir Ease Factors'}
    </Button>
  )
}

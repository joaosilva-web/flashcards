'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FlashcardDisplay } from '@/components/flashcard/card-display'
import { DifficultyButtons } from '@/components/flashcard/difficulty-buttons'
import { reviewCard, endStudySession } from '@/lib/actions/study-actions'
import { DifficultyRating } from '@/types/study'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

interface StudyCard {
  card_id: string
  cards: {
    id: string
    front_html: string
    back_html: string
  }
  ease_factor: number
  interval_days: number
  repetitions: number
  state: string
}

interface StudySessionProps {
  cards: StudyCard[]
  deckId?: string
  sessionId?: string
}

export function StudySession({ cards, deckId, sessionId }: StudySessionProps) {
  const [cardQueue, setCardQueue] = useState<StudyCard[]>(cards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [cardsCorrect, setCardsCorrect] = useState(0)
  const [totalCardsReviewed, setTotalCardsReviewed] = useState(0)
  const [cardAttempts, setCardAttempts] = useState<Map<string, number>>(new Map())
  const router = useRouter()
  const { toast } = useToast()

  const currentCard = cardQueue[currentIndex]
  const currentAttempts = cardAttempts.get(currentCard?.cards.id) || 0
  const progress = ((totalCardsReviewed + 1) / cards.length) * 100

  const finishSession = async () => {
    if (sessionId) {
      await endStudySession(
        sessionId,
        cards.length,
        cardsCorrect,
        Date.now() - startTime
      )
    }

    toast({
      title: 'Sessão concluída! 🎉',
      description: `Você estudou ${cards.length} cards`,
    })

    router.push(deckId ? `/decks/${deckId}` : '/dashboard')
    router.refresh()
  }

  const handleRate = async (rating: DifficultyRating) => {
    if (loading) return

    setLoading(true)
    const timeSpent = Date.now() - startTime

    try {
      // Se errou ou achou difícil
      if (rating < 3) {
        // Verificar se já tentou 2 vezes (esta seria a 3ª)
        if (currentAttempts >= 2) {
          // Depois de 2 erros, a 3ª tentativa só pula sem chamar reviewCard
          // para evitar que ease_factor seja penalizado demais
          toast({
            title: 'Card muito difícil',
            description: 'Passando para o próximo. Você revisará este card amanhã.',
            variant: 'destructive',
          })
          
          setTotalCardsReviewed((prev) => prev + 1)
          
          // Avançar normalmente
          if (currentIndex < cardQueue.length - 1) {
            setCurrentIndex((prev) => prev + 1)
            setIsFlipped(false)
            setStartTime(Date.now())
          } else {
            // Última carta
            finishSession()
          }
          setLoading(false)
          return
        }
      }

      // Chamar reviewCard apenas se não pulou acima
      const result = await reviewCard(currentCard.cards.id, rating, timeSpent)

      if (!result.success) {
        throw new Error(result.error)
      }

      if (rating >= 3) {
        setCardsCorrect((prev) => prev + 1)
      }

      // Atualizar contador de tentativas
      const attempts = currentAttempts + 1
      const newAttempts = new Map(cardAttempts)
      newAttempts.set(currentCard.cards.id, attempts)
      setCardAttempts(newAttempts)

      // Se errou ou achou difícil (e não pulou acima)
      if (rating < 3) {
        // Menos de 3 tentativas: recolocar no final da fila
        const newQueue = [...cardQueue]
        const [removedCard] = newQueue.splice(currentIndex, 1)
        newQueue.push(removedCard)
        setCardQueue(newQueue)
        
        // Não incrementar totalCardsReviewed porque vai revisar novamente
        setIsFlipped(false)
        setStartTime(Date.now())
        
        // Se estava no final da fila, voltar pro início
        if (currentIndex >= newQueue.length) {
          setCurrentIndex(0)
        }
        
        toast({
          title: `Tentativa ${attempts} de 3`,
          description: 'Você verá este card novamente nesta sessão',
        })
      } else {
        // Acertou: avançar normalmente
        setTotalCardsReviewed((prev) => prev + 1)
        
        // Próximo card
        if (currentIndex < cardQueue.length - 1) {
          setCurrentIndex((prev) => prev + 1)
          setIsFlipped(false)
          setStartTime(Date.now())
        } else {
          // Sessão concluída
          finishSession()
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao avaliar card',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!currentCard) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-2xl font-bold mb-2">Sessão Concluída!</h3>
          <p className="text-muted-foreground mb-6">Você estudou todos os cards disponíveis</p>
          <Button onClick={() => router.back()}>Voltar</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Card {totalCardsReviewed + 1} de {cards.length} | Restantes: {cardQueue.length - currentIndex}
            {currentAttempts > 0 && (
              <span className="ml-2 text-orange-600 font-semibold">
                • Tentativa {currentAttempts}/3
              </span>
            )}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Flashcard */}
      <div className="max-w-2xl mx-auto">
        <FlashcardDisplay
          frontHtml={currentCard.cards.front_html || currentCard.cards.front_html}
          backHtml={currentCard.cards.back_html || currentCard.cards.back_html}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
      </div>

      {/* Hint */}
      <div className="text-center text-sm text-muted-foreground">Clique no card para virar</div>

      {/* Difficulty Buttons */}
      <div className="flex justify-center">
        <DifficultyButtons
          onRate={handleRate}
          disabled={loading}
          cardData={{
            easeFactor: currentCard.ease_factor,
            interval: currentCard.interval_days,
            repetitions: currentCard.repetitions,
            state: currentCard.state as any,
          }}
        />
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Sair da Sessão
        </Button>
      </div>
    </div>
  )
}

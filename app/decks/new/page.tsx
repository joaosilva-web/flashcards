'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDeck } from '@/lib/actions/deck-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'

const ICONS = [
  '📚',
  '🧠',
  '🎯',
  '💡',
  '📖',
  '🔢',
  '⚗️',
  '🧪',
  '📐',
  '🌍',
  '🗺️',
  '📝',
  '🇬🇧',
  '🇪🇸',
  '🇫🇷',
  '🧬',
  '⚛️',
  '💻',
  '🎨',
  '🎵',
  '⚽',
  '🌱',
  '🏛️',
  '⚖️',
  '💼',
  '📊',
  '🏗️',
  '🩺',
  '🎭',
  '📷',
  '🎬',
  '🔬',
  '🌟',
  '🚀',
  '🎓',
]
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export default function NewDeckPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0])
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createDeck({
        name,
        description,
        icon: selectedIcon,
        color: selectedColor,
      })

      if (result.success && result.data) {
        toast({
          title: 'Baralho criado!',
          description: 'Agora você pode adicionar cards',
        })
        router.push(`/decks/${result.data.id}`)
      } else {
        throw new Error(result.success ? 'Erro desconhecido' : result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao criar baralho',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/decks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-2">Novo Baralho</h1>
        <p className="text-muted-foreground">Crie um baralho para organizar seus flashcards</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Baralho</CardTitle>
          <CardDescription>Personalize seu baralho com nome, ícone e cor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Matemática Básica"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva o conteúdo deste baralho..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`text-3xl w-14 h-14 rounded-lg border-2 transition-colors ${
                      selectedIcon === icon
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    disabled={loading}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-foreground scale-110'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Criando...' : 'Criar Baralho'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  )
}

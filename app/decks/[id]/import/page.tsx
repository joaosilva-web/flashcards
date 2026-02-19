'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { importCardsFromCSV } from '@/lib/actions/import-actions'
import { validateCSVFile, generateExampleCSV } from '@/lib/parsers/csv-parser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Upload, Download, FileText } from 'lucide-react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'

export default function ImportPage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const error = validateCSVFile(selectedFile)
    if (error) {
      toast({
        title: 'Arquivo inválido',
        description: error,
        variant: 'destructive',
      })
      setFile(null)
      e.target.value = ''
      return
    }

    setFile(selectedFile)
  }

  const handleDownloadExample = () => {
    const example = generateExampleCSV()
    const blob = new Blob([example], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'exemplo-flashcards.csv'
    link.click()
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)

    try {
      const content = await file.text()
      const result = await importCardsFromCSV(params.id, content)

      if (result.success) {
        toast({
          title: 'Importação concluída!',
          description: `${result.imported} cards importados com sucesso`,
        })
        router.push(`/decks/${params.id}`)
        router.refresh()
      } else {
        // Mostrar detalhes dos erros
        const errorDetails =
          result.details && result.details.length > 0
            ? result.details.slice(0, 3).join('\n')
            : result.error || 'Erro ao importar'

        toast({
          title: 'Erro na importação',
          description: errorDetails,
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro na importação',
        description: error.message || 'Erro desconhecido',
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
          <Link href={`/decks/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-2">Importar Cards via CSV</h1>
        <p className="text-muted-foreground">
          Importe múltiplos flashcards de uma vez usando um arquivo CSV
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Formato do CSV</CardTitle>
          <CardDescription>O arquivo deve seguir o formato: frente,verso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Formatação Suportada:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                • <code className="bg-muted px-1 rounded">$formula$</code> - Fórmulas matemáticas
                (LaTeX)
              </li>
              <li>
                • <code className="bg-muted px-1 rounded">**texto**</code> - Negrito
              </li>
              <li>
                • <code className="bg-muted px-1 rounded">*texto*</code> - Itálico
              </li>
              <li>
                • <code className="bg-muted px-1 rounded">^texto^</code> - Sobrescrito
              </li>
              <li>
                • <code className="bg-muted px-1 rounded">~texto~</code> - Subscrito
              </li>
              <li>
                • <code className="bg-muted px-1 rounded">`código`</code> - Código inline
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2 text-amber-600">⚠️ Dicas Importantes:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Use aspas duplas em textos que contenham vírgulas</li>
              <li>• Cada linha deve ter exatamente 2 colunas (frente e verso)</li>
              <li>• Salve o arquivo com codificação UTF-8</li>
              <li>• Evite linhas em branco no meio do arquivo</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Exemplo:</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              {`"O que é TypeScript?","Um superset tipado de JavaScript"
"Quanto é $2^3$?","$8$"
"Qual a fórmula da **velocidade**?","$v = \\frac{d}{t}$"`}
            </pre>
          </div>

          <Button variant="outline" onClick={handleDownloadExample} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Baixar CSV de Exemplo
          </Button>
        </CardContent>
      </Card>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Arquivo</CardTitle>
          <CardDescription>Selecione um arquivo CSV para importar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo CSV</Label>
            <div className="flex gap-2">
              <input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          )}

          <Button onClick={handleImport} disabled={!file || loading} className="w-full" size="lg">
            {loading ? (
              'Importando...'
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar Cards
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  )
}

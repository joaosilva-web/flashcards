import { parse } from 'csv-parse/sync'
import { parseMarkdownToHtml } from './markdown-parser'
import { sanitizeText } from './sanitizer'

export interface ParsedCard {
  front: string
  back: string
  frontHtml: string
  backHtml: string
}

export interface CSVParseResult {
  success: boolean
  cards: ParsedCard[]
  errors: string[]
  warnings: string[]
}

/**
 * Parse CSV de flashcards
 * Formato esperado: frente,verso
 * Suporta marcações especiais ($, ^, ~, etc.)
 */
export async function parseFlashcardCSV(fileContent: string): Promise<CSVParseResult> {
  const errors: string[] = []
  const warnings: string[] = []
  const cards: ParsedCard[] = []

  try {
    // Validar se o arquivo não está vazio
    if (!fileContent || fileContent.trim().length === 0) {
      return {
        success: false,
        cards: [],
        errors: ['Arquivo CSV vazio'],
        warnings: [],
      }
    }

    // Parse CSV com tratamento mais robusto
    let records
    try {
      records = parse(fileContent, {
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        quote: '"',
        columns: false,
        trim: false, // NÃO fazer trim automático para preservar espaços importantes
      })
    } catch (parseError) {
      return {
        success: false,
        cards: [],
        errors: [
          `Erro ao ler CSV: ${parseError instanceof Error ? parseError.message : 'formato inválido'}`,
        ],
        warnings: [],
      }
    }

    if (records.length === 0) {
      return {
        success: false,
        cards: [],
        errors: ['Nenhum card encontrado no arquivo'],
        warnings: [],
      }
    }

    // Validar e processar cada linha
    for (let i = 0; i < records.length; i++) {
      const row = records[i]
      const lineNumber = i + 1

      // Validar formato
      if (!Array.isArray(row) || row.length < 2) {
        errors.push(
          `Linha ${lineNumber}: formato inválido. Esperado: frente,verso (tem ${row.length} coluna(s))`
        )
        continue
      }

      const front = sanitizeText(row[0] || '')
      const back = sanitizeText(row[1] || '')

      // Validar conteúdo
      if (!front || front.length === 0) {
        errors.push(`Linha ${lineNumber}: frente vazia`)
        continue
      }

      if (!back || back.length === 0) {
        errors.push(`Linha ${lineNumber}: verso vazio`)
        continue
      }

      // Validar tamanho
      if (front.length > 5000) {
        warnings.push(`Linha ${lineNumber}: frente muito longa (${front.length} caracteres)`)
      }

      if (back.length > 5000) {
        warnings.push(`Linha ${lineNumber}: verso muito longo (${back.length} caracteres)`)
      }

      try {
        // Converter marcações para HTML
        const frontHtml = parseMarkdownToHtml(front)
        const backHtml = parseMarkdownToHtml(back)

        cards.push({
          front,
          back,
          frontHtml,
          backHtml,
        })
      } catch (parseError) {
        errors.push(
          `Linha ${lineNumber}: erro ao processar marcações - ${parseError instanceof Error ? parseError.message : 'erro desconhecido'}`
        )
      }
    }

    // Verificar duplicatas
    const seen = new Set<string>()
    for (let i = 0; i < cards.length; i++) {
      const key = `${cards[i].front}|${cards[i].back}`
      if (seen.has(key)) {
        warnings.push(`Card "${cards[i].front.substring(0, 50)}..." está duplicado`)
      }
      seen.add(key)
    }

    return {
      success: errors.length === 0 && cards.length > 0,
      cards,
      errors,
      warnings,
    }
  } catch (error) {
    return {
      success: false,
      cards: [],
      errors: [
        `Erro ao processar CSV: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      ],
      warnings: [],
    }
  }
}

/**
 * Valida um arquivo CSV antes de processar
 */
export function validateCSVFile(file: File): string | null {
  // Validar extensão
  if (!file.name.endsWith('.csv')) {
    return 'Arquivo deve ter extensão .csv'
  }

  // Validar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return 'Arquivo muito grande (máximo 5MB)'
  }

  // Validar que não está vazio
  if (file.size === 0) {
    return 'Arquivo vazio'
  }

  return null
}

/**
 * Gera um CSV de exemplo
 */
export function generateExampleCSV(): string {
  const examples = [
    ['O que é TypeScript?', 'Um superset tipado de JavaScript'],
    ['Qual a capital do Brasil?', 'Brasília'],
    ['Quanto é $2^3$?', '$8$'],
    ['O que significa HTML?', 'HyperText Markup Language'],
  ]

  return examples.map((row) => `"${row[0]}","${row[1]}"`).join('\n')
}

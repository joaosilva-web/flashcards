import katex from 'katex'
import { sanitizeHtml } from './sanitizer'

/**
 * Converte marcações especiais em HTML formatado
 * Suporta:
 * - $formula$ para matemática (KaTeX)
 * - **texto** ou __texto__ para negrito
 * - *texto* ou _texto_ para itálico
 * - ~~texto~~ para riscado
 * - ++texto++ para sublinhado
 * - ==texto== para destaque
 * - ~texto~ para subscrito
 * - ^texto^ para sobrescrito
 * - `código` para código inline
 * - - item para lista
 * - > texto para citação
 */
export function parseMarkdownToHtml(text: string): string {
  let html = text

  // 1. Processar fórmulas matemáticas ($...$)
  // Usar regex para capturar conteúdo entre $ sem capturar espaços nas bordas
  html = html.replace(/\$([^\$]+?)\$/g, (match, formula) => {
    try {
      // Trim da fórmula para remover espaços desnecessários
      const cleanFormula = formula.trim()
      if (!cleanFormula) return match

      const result = katex.renderToString(cleanFormula, {
        throwOnError: false, // Não lançar erro - renderizar o que conseguir
        displayMode: false,
        strict: false, // Permite sintaxe mais relaxada
        trust: false, // Segurança
        output: 'html', // HTML - melhor compatibilidade entre navegadores
      })

      return result
    } catch (error) {
      // Se der erro, retornar a fórmula original envolta em itálico como fallback
      const errorMsg = error instanceof Error ? error.message : 'erro desconhecido'
      console.warn(`⚠️ LaTeX parse error for "${formula}":`, errorMsg)

      // Fallback: renderizar como texto matemático simples em itálico
      return `<em class="math-fallback" title="LaTeX: ${errorMsg}">${formula}</em>`
    }
  })

  // 2. Processar negrito (**texto** ou __texto__)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // 3. Processar itálico (*texto* ou _texto_)
  // Importante: fazer depois do negrito para não conflitar
  html = html.replace(/\*([^*]+?)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+?)_/g, '<em>$1</em>')

  // 4. Processar riscado (~~texto~~)
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // 5. Processar sublinhado (++texto++)
  html = html.replace(/\+\+(.+?)\+\+/g, '<u>$1</u>')

  // 6. Processar destaque (==texto==)
  html = html.replace(/==(.+?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-700">$1</mark>')

  // 7. Processar subscrito (~texto~)
  html = html.replace(/~(.+?)~/g, '<sub>$1</sub>')

  // 8. Processar sobrescrito (^texto^)
  html = html.replace(/\^(.+?)\^/g, '<sup>$1</sup>')

  // 9. Processar código inline (`código`)
  html = html.replace(
    /`(.+?)`/g,
    '<code class="bg-gray-200 dark:bg-gray-800 px-1 rounded text-sm font-mono">$1</code>'
  )

  // 10. Processar listas (- item)
  html = html.replace(/^- (.+)$/gm, '<li class="list-disc list-inside ml-4" style="line-height: 1.2; margin: 0; padding: 0;">$1</li>')

  // 11. Processar citações (> texto)
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-400 my-2 rounded-r" style="background-color: #f3f4f6; color: #374151; font-style: italic; word-wrap: break-word; overflow-wrap: break-word; padding: 1rem 1.5rem 1rem 3.5rem; display: block;"><span style="font-size: 2.5rem; color: #9ca3af; line-height: 0; position: absolute; margin-left: -2.5rem; margin-top: 0.5rem;">"</span>$1</blockquote>')

  // 12. Processar quebras de linha (mas não entre elementos de bloco como listas e citações)
  html = html.replace(/\n/g, '<br>')
  
  // Remover <br> desnecessários entre elementos de lista e citações
  html = html.replace(/<\/li><br>/g, '</li>')
  html = html.replace(/<br><li/g, '<li')
  html = html.replace(/<\/blockquote><br>/g, '</blockquote>')
  html = html.replace(/<br><blockquote/g, '<blockquote')

  // 13. Sanitizar contra XSS
  html = sanitizeHtml(html)

  return html
}

/**
 * Remove tags HTML e retorna apenas texto
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Valida se uma fórmula matemática é válida
 */
export function validateMathFormula(formula: string): boolean {
  try {
    katex.renderToString(formula, {
      throwOnError: true,
      displayMode: false,
    })
    return true
  } catch {
    return false
  }
}

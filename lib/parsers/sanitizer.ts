/**
 * Sanitiza HTML para prevenir XSS
 * Implementação simples sem dependências externas problemáticas
 */
export function sanitizeHtml(html: string): string {
  // Remove scripts e elementos perigosos
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '') // Remove event handlers sem aspas
    .replace(/javascript:/gi, '') // Remove javascript: URIs

  return cleaned
}

/**
 * Sanitiza texto simples preservando conteúdo markdown/LaTeX
 */
export function sanitizeText(text: string): string {
  // Apenas trim, não remove < e > para preservar markdown e LaTeX
  return text.trim()
}

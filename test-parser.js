// Teste do parser com a fórmula problemática
const katex = require('katex')

function sanitizeHtml(html) {
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '')
  return cleaned
}

function parseMarkdownToHtml(text) {
  let html = text

  // Processar fórmulas matemáticas
  html = html.replace(/\$([^\$]+?)\$/g, (match, formula) => {
    try {
      const cleanFormula = formula.trim()
      if (!cleanFormula) return match

      const result = katex.renderToString(cleanFormula, {
        throwOnError: false,
        displayMode: false,
        strict: false,
        trust: false,
        output: 'html',
      })

      return result
    } catch (error) {
      console.warn(`⚠️ Erro no LaTeX:`, error.message)
      return `<em class="math-fallback">${formula}</em>`
    }
  })

  return sanitizeHtml(html)
}

const texto =
  'Qual o valor da soma $2 \\cdot 10^4 + 4 \\cdot 10^3 + 1 \\cdot 10^2 + 5 \\cdot 10^1 + 8 \\cdot 10^0$?'

console.log('Testando parser com texto:')
console.log(texto)
console.log('')

const resultado = parseMarkdownToHtml(texto)

console.log('✅ Resultado (primeiros 500 chars):')
console.log(resultado.substring(0, 500))
console.log('')
console.log('Buscando por 10^4:')
const idx = resultado.indexOf('10')
if (idx > -1) {
  console.log(resultado.substring(idx, idx + 200))
}
console.log('')

// Verificar se contém tags do KaTeX
if (resultado.includes('<span class="katex">')) {
  console.log('✅ Contém tags KaTeX!')
} else {
  console.log('❌ NÃO contém tags KaTeX')
}

if (resultado.includes('<sup>')) {
  console.log('✅ Contém <sup> tags!')
} else {
  console.log('❌ NÃO contém <sup> tags')
}

if (resultado.includes('class="msupsub"') || resultado.includes('class="vlist"')) {
  console.log('✅ Contém estrutura KaTeX para superscripts!')
} else {
  console.log('❌ NÃO contém estrutura KaTeX para superscripts')
}

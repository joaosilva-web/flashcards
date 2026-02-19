const katex = require('katex')

const formula = '2 \\cdot 10^4 + 4 \\cdot 10^3 + 1 \\cdot 10^2 + 5 \\cdot 10^1 + 8 \\cdot 10^0'

console.log('Testando KaTeX com fórmula:', formula)
console.log('')

try {
  const result = katex.renderToString(formula, {
    throwOnError: false,
    displayMode: false,
    strict: false,
    trust: false,
    output: 'html',
  })

  console.log('✅ Renderizado com sucesso!')
  console.log('')
  console.log('HTML gerado:')
  console.log(result.substring(0, 500))
} catch (error) {
  console.error('❌ Erro:', error.message)
}

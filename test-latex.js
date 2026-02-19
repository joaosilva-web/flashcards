const text =
  'Se em um sistema de numeração a representação $xy$ é obrigatoriamente diferente de $yx$, esse sistema é _____.'
console.log('Original:', text)

const result = text.replace(/\$([^\$]+?)\$/g, (match, formula) => {
  console.log('  Match:', match)
  console.log('  Formula:', formula)
  return `[[${formula}]]`
})

console.log('Processed:', result)

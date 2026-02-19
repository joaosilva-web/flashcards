# Guia de Contribuição

Obrigado por considerar contribuir com o FlashLearn! Este documento fornece diretrizes para contribuir com o projeto.

## 🚀 Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/flashcard-app.git
cd flashcard-app

# Adicione o upstream
git remote add upstream https://github.com/original/flashcard-app.git
```

### 2. Configurar Ambiente

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Configurar Supabase (veja QUICKSTART.md)
# ...

# Executar em desenvolvimento
npm run dev
```

### 3. Criar Branch

```bash
# Atualize master
git checkout main
git pull upstream main

# Crie nova branch
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 4. Fazer Alterações

- Escreva código limpo e legível
- Siga os padrões do projeto
- Adicione comentários quando necessário
- Teste suas alterações

### 5. Commit

```bash
# Stage suas alterações
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona funcionalidade X"
# ou
git commit -m "fix: corrige bug Y"
```

### 6. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nome-da-feature

# Abra Pull Request no GitHub
```

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ BOM: Tipos explícitos
interface UserProps {
  name: string
  email: string
}

function getUser(id: string): Promise<UserProps> {
  // ...
}

// ❌ RUIM: any, tipos implícitos
function getUser(id) {
  // ...
}
```

### React Components

```typescript
// ✅ BOM: Componente limpo e tipado
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {label}
    </button>
  )
}

// ❌ RUIM: Props sem tipo, lógica complexa no JSX
export function Button(props) {
  return (
    <button onClick={props.onClick}>
      {props.variant === 'primary' ? (
        <span className="text-blue">
          {props.label}
        </span>
      ) : (
        <span className="text-gray">
          {props.label}
        </span>
      )}
    </button>
  )
}
```

### Server Actions

```typescript
// ✅ BOM: Validação, tipos, tratamento de erro
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createDeckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})

export async function createDeck(data: z.infer<typeof createDeckSchema>) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const validated = createDeckSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: 'Dados inválidos' }
  }

  try {
    const { data: deck, error } = await supabase
      .from('decks')
      .insert({ ...validated.data, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/decks')
    return { success: true, data: deck }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ❌ RUIM: Sem validação, sem tratamento de erro
export async function createDeck(data) {
  const supabase = await createServerClient()
  const { data: deck } = await supabase.from('decks').insert(data)
  return deck
}
```

## 🎨 Padrões de UI

### Tailwind Classes

```tsx
// ✅ BOM: Classes organizadas, uso de cn()
import { cn } from '@/lib/utils'

<div className={cn(
  "flex items-center gap-2",
  "rounded-lg border border-border",
  "p-4 hover:bg-accent",
  isActive && "bg-accent"
)}>
  {/* ... */}
</div>

// ❌ RUIM: Classes desorganizadas, inline styles
<div className="flex gap-2 items-center p-4 rounded-lg hover:bg-accent border border-border" style={{ backgroundColor: isActive ? '#f0f0f0' : 'transparent' }}>
  {/* ... */}
</div>
```

### Componentes shadcn/ui

```tsx
// ✅ BOM: Usar componentes do projeto
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

<Button variant="default" size="lg">
  Click me
</Button>

// ❌ RUIM: Criar botão customizado desnecessário
<button className="px-4 py-2 bg-blue-500 rounded">
  Click me
</button>
```

## 🧪 Testes

### Escrever Testes

```typescript
// Criar arquivo __tests__/feature.test.ts
import { calculateNextReview } from '@/lib/algorithm/sm2'

describe('Feature X', () => {
  it('should do Y', () => {
    const result = calculateNextReview(mockData, 3)
    expect(result.interval).toBe(6)
  })
})
```

### Executar Testes

```bash
# Executar todos os testes
npm test

# Modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📋 Convenção de Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição curta

Descrição longa (opcional)

Fix #123 (opcional)
```

### Tipos:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `test`: Adicionar/modificar testes
- `chore`: Tarefas de manutenção

### Exemplos:

```bash
feat(auth): adiciona login com Google
fix(study): corrige cálculo de intervalo SM-2
docs(readme): atualiza instruções de instalação
style(components): formata código com prettier
refactor(actions): simplifica deck-actions
test(algorithm): adiciona testes do SM-2
chore(deps): atualiza dependências
```

## 🐛 Reportar Bugs

### Template de Issue

```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Reproduzir**

1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**

- OS: [ex: Windows 11]
- Browser: [ex: Chrome 120]
- Versão: [ex: 1.0.0]

**Contexto Adicional**
Qualquer outra informação relevante.
```

## ✨ Sugerir Features

### Template de Feature Request

```markdown
**Problema**
Descrição do problema que esta feature resolve.

**Solução Proposta**
Descrição clara da solução desejada.

**Alternativas**
Outras soluções consideradas.

**Contexto Adicional**
Screenshots, mockups, exemplos de outros apps.
```

## 📦 Estrutura do Projeto

```
flashcard-app/
├── app/                    # Páginas Next.js (App Router)
│   ├── (auth)/            # Rotas de autenticação
│   ├── dashboard/         # Dashboard
│   └── decks/             # Gerenciamento de baralhos
├── components/            # Componentes React
│   ├── ui/               # shadcn/ui components
│   ├── flashcard/        # Componentes de flashcard
│   └── study/            # Componentes de estudo
├── lib/                   # Lógica de negócio
│   ├── actions/          # Server Actions
│   ├── algorithm/        # Algoritmo SM-2
│   ├── parsers/          # Parsers CSV/Markdown
│   └── supabase/         # Config Supabase
├── types/                 # Tipos TypeScript
├── supabase/             # Schema SQL
└── public/               # Arquivos estáticos
```

## 🎯 Áreas para Contribuir

### Fácil (Good First Issue)

- [ ] Documentação
- [ ] Tradução
- [ ] Correção de typos
- [ ] Melhorias de UI/UX
- [ ] Testes

### Médio

- [ ] Novos componentes
- [ ] Otimizações de performance
- [ ] Novas features pequenas
- [ ] Refatorações

### Difícil

- [ ] Arquitetura
- [ ] Integrações complexas
- [ ] Features grandes
- [ ] Migrações de dados

## 🤝 Código de Conduta

### Nossos Padrões

**Exemplos de comportamento aceitável:**

- Usar linguagem acolhedora e inclusiva
- Respeitar pontos de vista diferentes
- Aceitar críticas construtivas
- Focar no que é melhor para a comunidade

**Exemplos de comportamento inaceitável:**

- Linguagem ou imagens sexualizadas
- Trolling, insultos ou comentários depreciativos
- Assédio público ou privado
- Publicar informações privadas de outros

## 📧 Contato

- Issues: [GitHub Issues](https://github.com/seu-usuario/flashcard-app/issues)
- Discussões: [GitHub Discussions](https://github.com/seu-usuario/flashcard-app/discussions)
- Email: seu-email@example.com

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

---

**Obrigado por contribuir! 🎉**

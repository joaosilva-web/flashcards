# Arquitetura Técnica - FlashLearn

Documentação detalhada da arquitetura, decisões técnicas e padrões do sistema.

## 📐 Visão Geral

FlashLearn é uma aplicação full-stack construída com Next.js 14 (App Router), usando Supabase como backend e implementando o algoritmo de repetição espaçada SM-2.

### Stack Tecnológica

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│  ┌──────────────────────────────────┐  │
│  │  Pages (Next.js App Router)      │  │
│  │  Components (React + shadcn/ui)  │  │
│  │  State Management (React Hooks)  │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Server Layer (Next.js)          │
│  ┌──────────────────────────────────┐  │
│  │  Server Actions                  │  │
│  │  Middleware (Auth)               │  │
│  │  API Routes (Health Check)       │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│        Backend (Supabase)               │
│  ┌──────────────────────────────────┐  │
│  │  PostgreSQL Database             │  │
│  │  Row Level Security (RLS)        │  │
│  │  Authentication                  │  │
│  │  Real-time (opcional)            │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 🏗️ Arquitetura em Camadas

### 1. Presentation Layer (UI)

**Responsabilidade:** Renderizar interface e capturar interações do usuário.

```
app/
├── (public)/          # Rotas públicas (landing, login, signup)
├── dashboard/         # Dashboard autenticado
├── decks/            # Gerenciamento de baralhos
├── cards/            # CRUD de cards
├── stats/            # Estatísticas
└── profile/          # Perfil do usuário
```

**Padrões:**

- Server Components por padrão
- Client Components apenas quando necessário ('use client')
- Streaming com Suspense e loading.tsx
- Layouts aninhados para DRY

### 2. Business Logic Layer

**Responsabilidade:** Lógica de negócio, algoritmos, parsers.

```
lib/
├── actions/          # Server Actions (mutations)
├── algorithm/        # SM-2 Algorithm
├── parsers/          # CSV e Markdown parsers
├── supabase/         # Supabase clients
└── utils.ts          # Utilidades gerais
```

**Padrões:**

- Funções puras quando possível
- Separação de concerns
- Validação com Zod
- Tratamento de erros consistente

### 3. Data Access Layer

**Responsabilidade:** Comunicação com banco de dados.

```
lib/supabase/
├── client.ts         # Browser client
├── server.ts         # Server client (cookies)
└── middleware.ts     # Auth middleware
```

**Padrões:**

- Type-safe queries
- RLS para segurança
- Prepared statements
- Transaction management

### 4. Data Layer (Database)

**Responsabilidade:** Persistência e integridade dos dados.

```sql
-- 7 tabelas principais
profiles
decks
cards
card_states
review_logs
study_sessions
daily_stats
```

**Padrões:**

- Normalização (3NF)
- Foreign keys com CASCADE
- Índices para performance
- Triggers para automação

## 🔄 Fluxo de Dados

### Exemplo: Revisar Card

```
1. User clica em botão "Bom" (Client Component)
   ↓
2. Chama reviewCard() Server Action
   ↓
3. Server Action:
   - Valida autenticação
   - Calcula próximo intervalo (SM-2)
   - Atualiza card_state no banco
   - Registra review_log
   - Atualiza daily_stats
   - Revalida cache
   ↓
4. UI é atualizada automaticamente
   - Next card é mostrado
   - Progress bar atualiza
   - Toast de sucesso
```

## 💾 Modelo de Dados

### Entity Relationship Diagram

```
┌──────────────┐
│   profiles   │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────┴───────┐
│    decks     │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────┴───────┐       ┌──────────────┐
│    cards     ├───────┤ card_states  │
└──────┬───────┘  1:1  └──────────────┘
       │ 1
       │
       │ N
┌──────┴───────┐
│ review_logs  │
└──────────────┘

┌──────────────────┐
│ study_sessions   │
└──────────────────┘

┌──────────────────┐
│  daily_stats     │
└──────────────────┘
```

### Tabela: profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Propósito:** Estender dados do usuário (auth.users é gerenciado pelo Supabase).

**RLS:** Usuários podem ler e atualizar apenas seu próprio perfil.

### Tabela: decks

```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Propósito:** Organizar cards em baralhos temáticos.

**RLS:** Usuários veem apenas seus próprios decks.

**Índices:**

- `idx_decks_user_id` - Buscar decks do usuário

### Tabela: cards

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY,
  deck_id UUID REFERENCES decks ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Propósito:** Armazenar conteúdo dos flashcards.

**RLS:** Usuários veem cards dos seus decks.

**Cascade:** Deletar deck deleta seus cards.

**Índices:**

- `idx_cards_deck_id` - Buscar cards de um deck

### Tabela: card_states

```sql
CREATE TABLE card_states (
  id UUID PRIMARY KEY,
  card_id UUID REFERENCES cards ON DELETE CASCADE,
  user_id UUID REFERENCES profiles,
  ease_factor DECIMAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  due_date TIMESTAMP DEFAULT NOW(),
  last_review TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(card_id, user_id)
)
```

**Propósito:** Rastrear progresso de aprendizado (algoritmo SM-2).

**RLS:** Usuários veem apenas seus próprios estados.

**Unique constraint:** Um card só pode ter um estado por usuário.

**Índices:**

- `idx_card_states_user_id` - Buscar estados do usuário
- `idx_card_states_due_date` - Buscar cards vencidos

### Tabela: review_logs

```sql
CREATE TABLE review_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  card_id UUID REFERENCES cards ON DELETE CASCADE,
  rating INTEGER NOT NULL, -- 1-4
  ease_factor DECIMAL,
  interval INTEGER,
  reviewed_at TIMESTAMP DEFAULT NOW()
)
```

**Propósito:** Histórico completo de revisões para analytics.

**RLS:** Usuários veem apenas seus logs.

**Sem foreign key para card_states:** Permite manter histórico mesmo após reset.

**Índices:**

- `idx_review_logs_user_id` - Analytics por usuário
- `idx_review_logs_card_id` - Histórico por card
- `idx_review_logs_reviewed_at` - Ordenação temporal

### Tabela: study_sessions

```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  deck_id UUID REFERENCES decks,
  cards_studied INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
)
```

**Propósito:** Rastrear sessões de estudo para gamificação futura.

**RLS:** Usuários veem apenas suas sessões.

### Tabela: daily_stats

```sql
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  date DATE NOT NULL,
  cards_studied INTEGER DEFAULT 0,
  cards_correct INTEGER DEFAULT 0,
  study_time INTEGER DEFAULT 0, -- segundos
  UNIQUE(user_id, date)
)
```

**Propósito:** Estatísticas agregadas para dashboard.

**RLS:** Usuários veem apenas suas stats.

**Unique constraint:** Uma entrada por usuário por dia.

**Índices:**

- `idx_daily_stats_user_date` - Buscar stats de período

## 🧮 Algoritmo SM-2 (SuperMemo 2)

### Conceitos Principais

**1. Ease Factor (EF)**

- Fator de facilidade do card (1.3 a 2.5)
- Indica quão fácil é lembrar desse card
- Ajustado a cada revisão baseado na resposta

**2. Interval (I)**

- Dias até próxima revisão
- Aumenta exponencialmente com acertos
- Reseta para 1 dia em erros

**3. Repetitions (n)**

- Contador de acertos consecutivos
- Reseta para 0 em erros
- Usado para determinar intervalo inicial

### Fórmula do EF

```
EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))

Onde:
- EF' = novo ease factor
- EF = ease factor atual
- q = qualidade da resposta (1-4)
```

**Mapeamento de dificuldade:**

- 1 (Again) → q = 1 → EF diminui ~0.64
- 2 (Hard) → q = 2 → EF diminui ~0.30
- 3 (Good) → q = 3 → EF mantém
- 4 (Easy) → q = 4 → EF aumenta ~0.24

### Cálculo do Intervalo

```typescript
function calculateInterval(n: number, EF: number, prevInterval: number): number {
  if (n === 0) return 1 // Primeira vez: 1 dia
  if (n === 1) return 6 // Segunda vez: 6 dias
  return prevInterval * EF // Subsequentes: intervalo × EF
}
```

**Exemplos:**

```
Card novo (EF=2.5):
- Review 1 (Good) → I = 1 dia
- Review 2 (Good) → I = 6 dias
- Review 3 (Good) → I = 15 dias (6 × 2.5)
- Review 4 (Good) → I = 37 dias (15 × 2.5)
- Review 5 (Good) → I = 92 dias

Card difícil (EF=1.5):
- Review 3 (Hard) → I = 9 dias (6 × 1.5)
- Review 4 (Hard) → I = 13 dias (9 × 1.5)
```

### Implementação

```typescript
// lib/algorithm/sm2.ts

export function calculateNextReview(cardState: CardState, rating: DifficultyRating): ReviewResult {
  // Novo ease factor
  const newEF = calculateEaseFactor(cardState.ease_factor, rating)

  // Resetar se errou
  if (rating === 1) {
    return {
      ease_factor: Math.max(1.3, newEF),
      interval: 1,
      repetitions: 0,
      due_date: addDays(new Date(), 1).toISOString(),
    }
  }

  // Incrementar repetições
  const newReps = cardState.repetitions + 1

  // Calcular novo intervalo
  let newInterval: number
  if (newReps === 1) {
    newInterval = 1
  } else if (newReps === 2) {
    newInterval = 6
  } else {
    newInterval = Math.round(cardState.interval * newEF)
  }

  // Ajustar para "Hard" e "Easy"
  if (rating === 2) {
    newInterval = Math.max(1, Math.round(newInterval * 0.8))
  } else if (rating === 4) {
    newInterval = Math.round(newInterval * 1.3)
  }

  return {
    ease_factor: newEF,
    interval: newInterval,
    repetitions: newReps,
    due_date: addDays(new Date(), newInterval).toISOString(),
  }
}
```

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas têm políticas RLS:

```sql
-- Exemplo: Política para decks
CREATE POLICY "Users can read own decks"
  ON decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks"
  ON decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks"
  ON decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks"
  ON decks FOR DELETE
  USING (auth.uid() = user_id);
```

**Benefícios:**

- Segurança no nível do banco
- Impossível acessar dados de outros usuários
- Funciona mesmo com SQL direto

### Sanitização de HTML

```typescript
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'code', 'sup', 'sub', 'span'],
    ALLOWED_ATTR: ['class'],
  })
}
```

**Proteção contra:**

- XSS (Cross-Site Scripting)
- Injeção de scripts maliciosos
- HTML não permitido

### Validação de Inputs

```typescript
import { z } from 'zod'

const createDeckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})
```

**Validação:**

- Server-side (nunca confiar no cliente)
- Type-safe com TypeScript
- Mensagens de erro claras

## ⚡ Performance

### Otimizações Implementadas

**1. Server Components**

- Renderização no servidor
- Menos JavaScript no cliente
- SEO melhorado

**2. Streaming**

- Suspense boundaries
- Loading states progressivos
- Melhor perceived performance

**3. Batch Operations**

```typescript
// Importar múltiplos cards de uma vez
const { data, error } = await supabase.from('cards').insert(cards) // Array de cards
```

**4. Índices no Banco**

```sql
CREATE INDEX idx_card_states_due_date
  ON card_states(user_id, due_date);
```

**5. Caching**

- Next.js automatic caching
- revalidatePath() para invalidar
- Server Components são cachados

### Métricas Alvo

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTI (Time to Interactive):** < 3.5s

## 🧪 Testing Strategy

### Pirâmide de Testes

```
           ╱╲
          ╱  ╲   E2E Tests (Playwright)
         ╱────╲  - Critical user flows
        ╱      ╲
       ╱────────╲ Integration Tests (Jest)
      ╱          ╲ - Server Actions
     ╱────────────╲ - Database operations
    ╱              ╲
   ╱────────────────╲ Unit Tests (Jest)
  ╱                  ╲ - SM-2 algorithm
 ╱                    ╲ - Parsers
╱──────────────────────╲ - Pure functions
```

### Exemplo de Teste Unitário

```typescript
describe('SM-2 Algorithm', () => {
  it('should reset interval to 1 on rating 1', () => {
    const state: CardState = {
      ease_factor: 2.5,
      interval: 15,
      repetitions: 3,
    }

    const result = calculateNextReview(state, 1)

    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(0)
  })
})
```

## 📊 Monitoramento

### Métricas para Rastrear

**Negócio:**

- DAU/MAU (Daily/Monthly Active Users)
- Retention rate
- Cards criados/dia
- Cards estudados/dia
- Taxa de acerto média

**Técnico:**

- Response times
- Error rates
- Database query performance
- API success rate

**UX:**

- Core Web Vitals
- Page load times
- User flows completion

## 🚀 Deploy e DevOps

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - uses: vercel/action@v2
```

### Environment Variables

```bash
# Development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-key

# Production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
```

## 🔮 Roadmap Técnico

### v1.1 - Performance

- [ ] Implement ISR for static pages
- [ ] Add Redis caching layer
- [ ] Optimize bundle size
- [ ] Image optimization

### v1.2 - Testing

- [ ] 80% test coverage
- [ ] E2E tests with Playwright
- [ ] Performance testing
- [ ] Load testing

### v2.0 - Scale

- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] CDN for assets
- [ ] Multi-region deployment

---

**Documento vivo - Atualizar conforme arquitetura evolui**

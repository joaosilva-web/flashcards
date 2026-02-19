# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.0.0] - 2026-02-19

### 🚀 MAJOR UPDATE: Migração para FSRS

#### ✨ Novo Algoritmo de Repetição Espaçada

- **Substituição do SM-2 pelo FSRS** (Free Spaced Repetition Scheduler)
- Modelagem probabilística moderna da memória
- Três métricas principais:
  - **Difficulty (D)**: Dificuldade do card (1-10)
  - **Stability (S)**: Estabilidade da memória em dias
  - **Retrievability (R)**: Probabilidade de lembrar (0-1)
- Fórmulas matemáticas baseadas em pesquisa científica
- Parâmetros otimizados empiricamente (w1-w9)
- Melhor precisão na previsão de esquecimento

#### 🗄️ Migração de Banco de Dados

- Adicionados novos campos em `card_states`:
  - `difficulty` (REAL): 5.0 padrão
  - `stability` (REAL): 0.0 padrão
  - `retrievability` (REAL): 1.0 padrão
- Adicionados campos FSRS em `review_logs` para histórico
- Script de migração automático para converter dados SM-2 existentes
- Manutenção de `ease_factor` para compatibilidade temporária
- Função SQL `calculate_retrievability()` para análises

#### 🔧 Melhorias Técnicas

- Novo módulo `lib/algorithm/fsrs.ts` com implementação completa
- Atualização de tipos TypeScript para suportar FSRS
- Componentes de UI atualizados para exibir previsões FSRS
- Logs detalhados de revisão com métricas FSRS
- Documentação completa em `fsrs.md`

#### 📈 Vantagens sobre SM-2

- Modelagem matemática mais precisa do esquecimento
- Adaptação personalizada à curva de memória individual
- Consideração explícita da probabilidade de esquecimento
- Intervalos mais otimizados para maximizar retenção
- Base científica moderna e validada

#### 🔄 Retrocompatibilidade

- Dados SM-2 existentes migrados automaticamente
- Conversão inteligente de ease_factor para difficulty
- Stability inicializada baseada em interval_days
- Sistema funciona imediatamente após migração

---

## [1.0.0] - 2024-01-XX

### ✨ Funcionalidades Principais

#### Autenticação

- Sistema completo de login/signup com Supabase Auth
- Row Level Security (RLS) para proteção de dados
- Middleware de autenticação para rotas protegidas
- Sessões persistentes via cookies

#### CRUD de Flashcards

- Criar baralhos com nome, descrição, ícone e cor
- Adicionar cards manualmente com preview ao vivo
- Editar cards existentes com visualização
- Deletar cards e baralhos
- Listagem de todos os baralhos do usuário
- Visualização detalhada de cada baralho

#### Algoritmo de Repetição Espaçada (SM-2)

- Implementação completa do algoritmo SuperMemo 2
- Cálculo automático de intervalo baseado no desempenho
- 4 níveis de dificuldade:
  - Errei (1 dia)
  - Difícil (intervalo reduzido)
  - Bom (intervalo mantido)
  - Fácil (intervalo aumentado)
- Ajuste dinâmico do Ease Factor (1.3 a 2.5)
- Preview de próximo intervalo nos botões
- Tracking completo de todas as revisões

#### Sistema de Estudo

- Interface de estudo com animação 3D de flip
- Barra de progresso da sessão
- Contador de cards restantes
- Embaralhamento de cards (due + new)
- Registro de sessões de estudo
- Atualização automática de estatísticas

#### Importação CSV

- Parser otimizado para grandes arquivos
- Suporte a formatação especial:
  - LaTeX/KaTeX: `$formula$`
  - Negrito: `**texto**`
  - Itálico: `*texto*`
  - Sobrescrito: `^texto^`
  - Subscrito: `~texto~`
  - Código: `` `código` ``
- Validação de formato e tamanho (5MB max)
- Proteção contra XSS com DOMPurify
- Detecção de duplicatas
- Preview antes de importar
- Download de CSV de exemplo
- Batch insert otimizado

#### Estatísticas

- Dashboard com 4 métricas principais:
  - Total de cards criados
  - Taxa de acerto global
  - Sequência (dias consecutivos)
  - Média semanal de estudo
- Gráfico de atividade dos últimos 7 dias
- Distribuição de respostas por dificuldade
- Histórico completo de revisões
- Cálculo automático de tendências

#### Interface do Usuário

- Design minimalista e moderno
- Modo escuro suportado
- Componentes acessíveis (Radix UI)
- Animações fluidas e feedback visual
- Layout responsivo (mobile-first)
- Toast notifications para ações
- Loading states
- Sidebar de navegação
- Cards com ícones personalizáveis

### 🗄️ Banco de Dados

#### Tabelas Implementadas

- `profiles` - Perfis de usuários
- `decks` - Baralhos de cards
- `cards` - Flashcards
- `card_states` - Estado de aprendizado (SM-2)
- `review_logs` - Histórico de revisões
- `study_sessions` - Sessões de estudo
- `daily_stats` - Estatísticas diárias agregadas

#### Recursos Avançados

- Row Level Security (RLS) em todas as tabelas
- Triggers automáticos para:
  - Atualização de `updated_at`
  - Criação de `card_states` ao criar card
  - Atualização de estatísticas após revisão
- Índices otimizados para queries frequentes
- Função para auto-criação de profiles
- Foreign keys com CASCADE

### 🎨 Componentes UI

#### shadcn/ui Componentes

- Button - Botões com variantes
- Card - Cards de conteúdo
- Input - Campos de texto
- Textarea - Texto multilinha
- Label - Labels acessíveis
- Toast - Notificações
- Progress - Barras de progresso
- Avatar - Avatares de usuário

#### Componentes Customizados

- FlashcardDisplay - Card com animação 3D flip
- DifficultyButtons - Botões de avaliação com preview
- StudySession - Gerenciador de sessão completo
- Sidebar - Navegação lateral

### 🛠️ Ferramentas e Libs

#### Core

- Next.js 14.1.0 (App Router)
- React 18.2.0
- TypeScript 5

#### Supabase Stack

- @supabase/supabase-js 2.39.7
- @supabase/ssr 0.1.0

#### UI/Styling

- TailwindCSS 3.3.0
- shadcn/ui (Radix UI)
- tailwind-merge
- tailwindcss-animate
- class-variance-authority
- lucide-react (ícones)

#### Formatação

- katex 0.16.9 - Renderização LaTeX
- isomorphic-dompurify 2.9.0 - Sanitização XSS
- csv-parse 5.5.5 - Parser CSV

#### Forms & Validation

- react-hook-form 7.50.1
- zod 3.22.4
- @hookform/resolvers 3.3.4

#### Utils

- date-fns 3.3.1 - Manipulação de datas
- clsx 2.1.0 - Conditional classes

### 📄 Páginas

#### Públicas

- `/` - Landing page com showcase de features
- `/login` - Página de login
- `/signup` - Página de registro

#### Autenticadas

- `/dashboard` - Dashboard principal com resumo
- `/decks` - Lista todos os baralhos
- `/decks/new` - Criar novo baralho
- `/decks/[id]` - Detalhes do baralho
- `/decks/[id]/study` - Sessão de estudo
- `/decks/[id]/import` - Importar cards via CSV
- `/cards/new` - Criar card manualmente
- `/cards/[id]` - Editar card existente
- `/stats` - Estatísticas detalhadas
- `/profile` - Perfil do usuário

### 🎯 Server Actions

#### Deck Actions (5)

- `createDeck` - Criar baralho
- `updateDeck` - Atualizar baralho
- `deleteDeck` - Deletar baralho
- `getDeck` - Buscar baralho por ID
- `getDecks` - Listar todos os baralhos

#### Card Actions (5)

- `createCard` - Criar card
- `updateCard` - Atualizar card
- `deleteCard` - Deletar card
- `getCard` - Buscar card por ID
- `getCardsByDeck` - Listar cards do baralho

#### Study Actions (5)

- `reviewCard` - Registrar revisão
- `getStudyCardsForDeck` - Buscar cards para estudar
- `getDueCardsCount` - Contar cards vencidos
- `startStudySession` - Iniciar sessão
- `endStudySession` - Finalizar sessão

#### Import Actions (1)

- `importCardsFromCSV` - Importar múltiplos cards

### 🔒 Segurança

- Row Level Security habilitado em todas as tabelas
- Sanitização de HTML com DOMPurify
- Validação de inputs com Zod
- Proteção CSRF via cookies
- Rate limiting via Supabase
- Validação de tamanho de arquivos
- Escape de caracteres especiais

### 📚 Documentação

- README.md completo com arquitetura
- QUICKSTART.md para início rápido
- CHANGELOG.md (este arquivo)
- Comentários inline no código
- Types TypeScript documentados
- SQL schema com comentários

### ⚡ Performance

- Server Components por padrão
- Streaming de dados
- Loading states otimizados
- Batch operations para imports
- Índices no banco de dados
- Caching de queries
- Lazy loading de componentes

### 🐛 Correções

- Fix: Import de useState na página de import
- Fix: Tipagem correta de database types
- Fix: Navegação após logout

## [Planejado para v1.1.0]

### Features

- [ ] Gráficos interativos com recharts
- [ ] Busca e filtros avançados
- [ ] Tags/categorias para cards
- [ ] Export de baralhos
- [ ] PWA support
- [ ] Modo offline

### Melhorias

- [ ] Otimização de bundle size
- [ ] Testes unitários (Jest)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Storybook para componentes

### UX

- [ ] Onboarding tutorial
- [ ] Keyboard shortcuts
- [ ] Drag and drop para reordenar
- [ ] Bulk operations
- [ ] Undo/redo

## [Planejado para v2.0.0]

### Big Features

- [ ] Compartilhamento de decks
- [ ] Marketplace de baralhos públicos
- [ ] Colaboração em tempo real
- [ ] Apps nativos mobile
- [ ] IA para geração de cards
- [ ] Suporte a imagens
- [ ] Multi-idioma (i18n)

---

**Formato baseado em [Keep a Changelog](https://keepachangelog.com/)**

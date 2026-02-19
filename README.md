# FlashLearn - Sistema de Flashcards com Repetição Espaçada

Sistema inteligente de criação e revisão de flashcards com algoritmo de repetição espaçada baseado no SM-2 (SuperMemo 2).

## 🚀 Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Estilização:** TailwindCSS + shadcn/ui
- **Formatação:** KaTeX (fórmulas matemáticas)
- **Deploy:** Vercel

## 📦 Funcionalidades

### ✅ Implementado

- **CRUD de Flashcards**
  - Criar, editar, deletar e listar cards
  - Frente e verso com texto formatável
  - Preview ao vivo durante edição
  - Organização em baralhos (decks)
  - Interface visual para criação/edição
- **Algoritmo de Repetição Espaçada (SM-2)**
  - Cálculo automático de intervalo de revisão
  - 4 níveis de dificuldade (Errei, Difícil, Bom, Fácil)
  - Ajuste dinâmico baseado no desempenho
  - Tracking completo de revisões

- **Importação via CSV**
  - Parser inteligente de CSV
  - Suporte a formatação especial:
    - `$formula$` - LaTeX/KaTeX para matemática
    - `**negrito**` - Texto em negrito
    - `*itálico*` - Texto em itálico
    - `^sobrescrito^` - Sobrescrito
    - `~subscrito~` - Subscrito
    - `` `código` `` - Código inline
  - Validação de estrutura
  - Proteção contra XSS

- **Sistema de Estatísticas**
  - Cards estudados por dia
  - Taxa de acerto global
  - Contador de streak (dias consecutivos)
  - Atividade dos últimos 7 dias
  - Distribuição de respostas por dificuldade
  - Média semanal de estudo
  - Cards vencidos
  - Histórico completo de revisões

- **Autenticação Completa**
  - Login/Signup com Supabase
  - Row Level Security (RLS)
  - Proteção de rotas
  - Sessões persistentes

- **UI/UX Moderna**
  - Interface minimalista
  - Modo escuro
  - Animações fluidas
  - Feedback visual
  - Responsivo

## 🏗️ Arquitetura

### Estrutura de Pastas

```
flashcard-app/
├── app/
│   ├── (auth)/              # Páginas de autenticação
│   ├── dashboard/           # Dashboard principal
│   ├── decks/               # Gerenciamento de baralhos
│   └── globals.css
├── components/
│   ├── ui/                  # Componentes shadcn/ui
│   ├── flashcard/           # Componentes de flashcard
│   ├── study/               # Componentes de estudo
│   └── ...
├── lib/
│   ├── actions/             # Server Actions
│   ├── algorithm/           # Algoritmo SM-2
│   ├── parsers/             # Parsers CSV/Markdown
│   ├── supabase/            # Config Supabase
│   └── utils.ts
├── types/                   # Tipos TypeScript
└── supabase/
    └── schema.sql           # Schema do banco
```

### Modelagem de Dados

#### Tabelas Principais:

- **profiles** - Perfis de usuários
- **decks** - Baralhos de cards
- **cards** - Flashcards
- **card_states** - Estado de revisão (algoritmo SM-2)
- **review_logs** - Histórico de revisões
- **study_sessions** - Sessões de estudo
- **daily_stats** - Estatísticas diárias

### Algoritmo SM-2

O algoritmo calcula o intervalo de revisão baseado em:

1. **Ease Factor (EF)** - Facilidade do card (1.3 a 2.5)
2. **Intervalo** - Dias até próxima revisão
3. **Repetições** - Acertos consecutivos

**Fórmula:**

```
EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))
```

Onde `q` é a qualidade da resposta (1-4).

## 🚀 Como Executar

### 1. Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Conta no Vercel (para deploy)

### 2. Instalação

```bash
# Clonar repositório
git clone [seu-repo]
cd flashcard-app

# Instalar dependências
npm install
```

### 3. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o SQL do arquivo `supabase/schema.sql` no SQL Editor
3. Copie as credenciais do projeto

### 4. Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Executar Localmente

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 6. Deploy na Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Ou conecte seu repositório GitHub na interface da Vercel
```

## 📖 Como Usar

### Criar um Baralho

1. Acesse **Dashboard** → **Novo Baralho**
2. Preencha nome, descrição, escolha ícone e cor
3. Clique em **Criar Baralho**

### Adicionar Cards

**Manualmente:**

1. Entre no baralho
2. Clique em **Novo Card**
3. Preencha frente e verso
4. Use marcações especiais: `$x^2$`, `**negrito**`, etc.

**Via CSV:**

1. Entre no baralho
2. Clique em **Importar CSV**
3. Baixe o exemplo ou faça upload do seu arquivo
4. Formato: `frente,verso`

### Estudar

1. Entre em um baralho com cards vencidos
2. Clique em **Estudar**
3. Avalie cada card:
   - **Errei** (1 dia)
   - **Difícil** (reduz intervalo)
   - **Bom** (mantém intervalo)
   - **Fácil** (aumenta intervalo)

### Importar do CSV Fornecido

O arquivo `flashcards.csv` que você forneceu pode ser importado:

1. Crie um baralho "Sistemas de Numeração"
2. Vá em **Importar CSV**
3. Faça upload do arquivo
4. O sistema vai processar todas as fórmulas matemáticas automaticamente!

## 🎯 Próximos Passos

### Curto Prazo

- [ ] Gráficos interativos nas estatísticas (recharts)
- [ ] Configuração de preferências de estudo (cards/dia, limite)
- [ ] PWA (Progressive Web App)
- [ ] Modo offline com sync
- [ ] Sistema de conquistas
- [ ] Export de baralhos

### Médio Prazo

- [ ] Busca e filtros avançados
- [ ] Tags/categorias para cards
- [ ] Notas e anotações nos cards
- [ ] Compartilhamento de decks
- [ ] Marketplace de baralhos públicos
- [ ] Colaboração em tempo real
- [ ] Apps nativos (iOS/Android)

### Longo Prazo

- [ ] IA para gerar cards automaticamente
- [ ] IA para sugestões de estudo personalizadas
- [ ] Reconhecimento de voz
- [ ] Suporte para imagens nos cards
- [ ] Multi-idioma (i18n)
- [ ] Gamificação completa (XP, níveis, badges)

## 📝 Decisões Técnicas

### Por que Next.js App Router?

- Server Components para melhor performance
- Server Actions simplificam mutations
- Streaming e loading states automáticos

### Por que Supabase?

- Auth integrada e completa
- RLS para segurança nativa
- Real-time capabilities
- PostgreSQL robusto

### Por que SM-2?

- Algoritmo comprovado (usado no Anki)
- Simples de entender e debugar
- Resultados excelentes
- Fácil de estender

### Por que shadcn/ui?

- Componentes copiáveis (controle total)
- Acessibilidade nativa (Radix UI)
- Customização com Tailwind
- Type-safe

## 📄 Licença

MIT License - Sinta-se livre para usar em seus projetos!

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

**Desenvolvido com ❤️ para estudantes que querem aprender melhor**

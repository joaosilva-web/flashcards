# 🚀 Guia Rápido - FlashLearn

## Instalação em 5 Minutos

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

**Criar Projeto:**

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha nome e senha do banco

**Executar Schema:**

1. No Supabase Dashboard → SQL Editor
2. Clique em "New Query"
3. Cole todo o conteúdo de `supabase/schema.sql`
4. Clique em "Run"

**Copiar Credenciais:**

1. Settings → API
2. Copie "Project URL" e "anon public"

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar .env.local com suas credenciais
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Executar Aplicação

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📚 Primeiro Uso

### 1. Criar Conta

- Acesse a aplicação
- Clique em "Criar Conta"
- Preencha email e senha
- Faça login

### 2. Criar seu Primeiro Baralho

- Dashboard → "Novo Baralho"
- Nome: "Teste"
- Descrição: "Meu primeiro baralho"
- Escolha ícone e cor
- Criar Baralho

### 3. Adicionar Cards

**Opção A - Manual:**

1. Entre no baralho
2. "Novo Card"
3. Frente: `Quanto é $2^3$?`
4. Verso: `$2^3 = 8$`
5. Criar Card

**Opção B - CSV:**

1. Entre no baralho
2. "Importar CSV"
3. Baixe o exemplo
4. Faça upload do seu CSV

### 4. Estudar

1. Entre no baralho
2. "Estudar"
3. Leia a pergunta
4. Clique no card para ver resposta
5. Avalie sua resposta:
   - ❌ Errei (1 dia)
   - 😓 Difícil (reduz intervalo)
   - ✅ Bom (mantém intervalo)
   - 🚀 Fácil (aumenta intervalo)

## 🎨 Formatação de Cards

### Matemática (LaTeX/KaTeX)

```
Frente: Quanto é $\frac{1}{2}$?
Verso: $\frac{1}{2} = 0.5$
```

### Texto Formatado

```
**Negrito**
*Itálico*
`Código`
^Sobrescrito^
~Subscrito~
```

### Exemplo Completo

```
Frente: Calcule $x$ em $x^2 + 5x + 6 = 0$
Verso: Usando *Bhaskara*: $x = \frac{-5 \pm \sqrt{25-24}}{2}$
       Portanto: $x_1 = -2$ e $x_2 = -3$
```

## 📊 Formato CSV

### Estrutura

```csv
frente,verso
"Pergunta 1","Resposta 1"
"Pergunta 2","Resposta 2"
```

### Exemplo com Matemática

```csv
frente,verso
"Quanto é $2^8$?","$2^8 = 256$"
"Derive $x^2$","$\frac{d}{dx}(x^2) = 2x$"
"Integre $x$","$\int x dx = \frac{x^2}{2} + C$"
```

### Dicas CSV

- Use aspas duplas se houver vírgulas no texto
- Não use ponto e vírgula (`;`) como separador
- UTF-8 encoding
- Máximo 5MB
- Sem limite de linhas

## 🐛 Problemas Comuns

### Erro de Conexão com Supabase

**Sintoma:** "Failed to fetch" ou "Network error"

**Solução:**

1. Verifique se as variáveis de ambiente estão corretas
2. Confirme que o arquivo é `.env.local` (não `.env`)
3. Reinicie o servidor (`npm run dev`)

### LaTeX não Renderiza

**Sintoma:** Fórmula aparece como texto

**Solução:**

1. Use `$formula$` (não `$$formula$$`)
2. Escape caracteres especiais: `\{`, `\}`, `\\`
3. Teste no [KaTeX Playground](https://katex.org/)

### Cards não Aparecem para Estudo

**Sintoma:** "Nenhum card para estudar"

**Solução:**

1. Verifique se há cards no baralho
2. Novos cards aparecem imediatamente
3. Cards revisados aparecem após o intervalo

### Erro ao Importar CSV

**Sintoma:** "Erro ao processar CSV"

**Solução:**

1. Verifique o formato (frente,verso)
2. Confirme encoding UTF-8
3. Remova linhas vazias
4. Use aspas se houver vírgulas no conteúdo

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard:
# Settings → Environment Variables
```

### Netlify

```bash
# Build command
npm run build

# Publish directory
.next

# Adicionar variáveis de ambiente no dashboard
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📱 Páginas Disponíveis

- `/` - Landing page
- `/login` - Login
- `/signup` - Criar conta
- `/dashboard` - Dashboard principal
- `/decks` - Lista de baralhos
- `/decks/new` - Criar baralho
- `/decks/[id]` - Detalhes do baralho
- `/decks/[id]/study` - Sessão de estudo
- `/decks/[id]/import` - Importar CSV
- `/cards/new` - Criar card manualmente
- `/cards/[id]` - Editar card
- `/stats` - Estatísticas detalhadas
- `/profile` - Perfil do usuário

## 💡 Dicas de Uso

### Criando Bons Cards

✅ **BOM:**

```
Frente: Qual é a capital da França?
Verso: Paris
```

❌ **RUIM:**

```
Frente: Geografia
Verso: Paris é a capital da França, tem a Torre Eiffel...
```

**Princípios:**

- Uma pergunta, uma resposta
- Seja específico
- Use contexto mínimo mas suficiente
- Evite ambiguidade

### Otimizando Estudo

1. **Estude diariamente** - Mesmo que 5 minutos
2. **Seja honesto** - Não marque "Fácil" se teve dúvida
3. **Revise todos os vencidos** - Não acumule
4. **Crie cards regularmente** - 10-20 novos por dia
5. **Delete cards ruins** - Sem pena!

### Organizando Baralhos

- **Por matéria:** Matemática, Física, História
- **Por dificuldade:** Básico, Intermediário, Avançado
- **Por objetivo:** Prova 1, Vestibular, Concurso
- **Por período:** Semana 1, Mês 1, etc.

## 🎯 Próximos Passos

Depois de dominar o básico:

1. Explore as **Estatísticas** (gráficos de progresso)
2. Importe baralhos grandes via **CSV**
3. Crie um **ritual de estudo** diário
4. Acompanhe seu **streak** (dias consecutivos)
5. Ajuste os **intervalos** conforme sua memória

---

**Precisa de ajuda?** Abra uma issue no GitHub!

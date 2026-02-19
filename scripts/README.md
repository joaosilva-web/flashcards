# Scripts Úteis para FlashLearn

Este diretório contém scripts úteis para desenvolvimento e manutenção.

## Scripts Disponíveis

### 1. Reset Database

Remove todos os dados do usuário (útil para desenvolvimento):

```sql
-- Execute no SQL Editor do Supabase
DELETE FROM review_logs;
DELETE FROM study_sessions;
DELETE FROM daily_stats;
DELETE FROM card_states;
DELETE FROM cards;
DELETE FROM decks;
DELETE FROM profiles WHERE id = 'seu-user-id';
```

### 2. Generate Sample Data

Criar dados de exemplo para testes:

```sql
-- Criar deck de exemplo
INSERT INTO decks (user_id, name, description, icon, color)
VALUES (
  'seu-user-id',
  'Matemática Básica',
  'Operações e conceitos fundamentais',
  'calculator',
  'blue'
);

-- Criar cards de exemplo
INSERT INTO cards (deck_id, front, back)
VALUES
  ('deck-id', 'Quanto é $2 + 2$?', '$2 + 2 = 4$'),
  ('deck-id', 'Quanto é $3 \times 5$?', '$3 \times 5 = 15$'),
  ('deck-id', 'Quanto é $10 \div 2$?', '$10 \div 2 = 5$');
```

### 3. Backup Database

```bash
# Usando pgdump
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --no-owner \
  --no-privileges \
  > backup_$(date +%Y%m%d).sql
```

### 4. Check Database Size

```sql
-- Ver tamanho de cada tabela
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 5. Analytics Queries

```sql
-- Top 5 usuários mais ativos
SELECT
  p.full_name,
  COUNT(DISTINCT ds.date) as days_active,
  SUM(ds.cards_studied) as total_cards,
  AVG(ds.cards_correct) as avg_correct
FROM profiles p
JOIN daily_stats ds ON ds.user_id = p.id
GROUP BY p.id, p.full_name
ORDER BY total_cards DESC
LIMIT 5;

-- Cards mais difíceis (maior taxa de erro)
SELECT
  c.front,
  COUNT(*) as reviews,
  ROUND(AVG(CASE WHEN rl.rating >= 3 THEN 1.0 ELSE 0.0 END) * 100, 2) as success_rate
FROM cards c
JOIN review_logs rl ON rl.card_id = c.id
GROUP BY c.id, c.front
HAVING COUNT(*) >= 5
ORDER BY success_rate ASC
LIMIT 10;

-- Distribuição de intervalos
SELECT
  CASE
    WHEN interval = 1 THEN '1 dia'
    WHEN interval <= 7 THEN '2-7 dias'
    WHEN interval <= 30 THEN '1-4 semanas'
    WHEN interval <= 90 THEN '1-3 meses'
    ELSE '3+ meses'
  END as interval_range,
  COUNT(*) as cards_count
FROM card_states
GROUP BY interval_range
ORDER BY MIN(interval);
```

### 6. Performance Optimization

```sql
-- Analisar queries lentas
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Reindexar tabelas
REINDEX TABLE cards;
REINDEX TABLE card_states;
REINDEX TABLE review_logs;

-- Vacuum para recuperar espaço
VACUUM ANALYZE;
```

### 7. CSV para Testes

Criar arquivo CSV de teste:

```csv
frente,verso
"O que é $\pi$?","$\pi \approx 3.14159$"
"Derive $x^2$","$\frac{d}{dx}(x^2) = 2x$"
"Integre $x$","$\int x dx = \frac{x^2}{2} + C$"
"Teorema de **Pitágoras**","$a^2 + b^2 = c^2$"
"Fórmula de *Bhaskara*","$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$"
```

### 8. Environment Variables Check

```bash
# Verificar se variáveis estão configuradas
node -e "console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗')"
node -e "console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗')"
```

### 9. Type Generation

```bash
# Gerar tipos TypeScript do Supabase
npx supabase gen types typescript --project-id "seu-project-id" > types/database.ts
```

### 10. Bundle Analysis

```bash
# Analisar tamanho do bundle
npm install -D @next/bundle-analyzer

# Adicionar no next.config.js:
# const withBundleAnalyzer = require('@next/bundle-analyzer')({
#   enabled: process.env.ANALYZE === 'true',
# })
# module.exports = withBundleAnalyzer(nextConfig)

# Executar análise
ANALYZE=true npm run build
```

## Scripts NPM Personalizados

Adicione ao `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:types": "supabase gen types typescript --project-id $PROJECT_ID > types/database.ts"
  }
}
```

## Git Hooks (Husky)

```bash
# Instalar husky
npm install -D husky

# Inicializar
npx husky init

# Pre-commit: lint e type-check
echo "npm run lint && npm run type-check" > .husky/pre-commit
```

## Monitoramento

### Health Check Endpoint

Criar `app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
```

### Uso de Recursos

```sql
-- Contar registros por usuário
SELECT
  user_id,
  (SELECT COUNT(*) FROM decks WHERE user_id = p.id) as decks,
  (SELECT COUNT(*) FROM cards c JOIN decks d ON d.id = c.deck_id WHERE d.user_id = p.id) as cards,
  (SELECT COUNT(*) FROM review_logs WHERE user_id = p.id) as reviews
FROM profiles p;
```

## Troubleshooting

### Problema: Build falha

```bash
# Limpar cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Problema: Tipos desatualizados

```bash
# Regenerar tipos do Supabase
npm run db:types
```

### Problema: Erro de CORS

No Supabase Dashboard:

1. Authentication → Settings
2. Adicionar URL do seu domínio em "Site URL"
3. Adicionar em "Redirect URLs"

---

**Nota:** Mantenha este documento atualizado com novos scripts úteis!

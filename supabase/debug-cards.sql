-- ============================================
-- DIAGNÓSTICO: Cards que deveriam aparecer
-- ============================================

-- 1. Verificar cards com interval_days = 0 em card_states
SELECT 
  cs.id,
  cs.card_id,
  cs.state,
  cs.interval_days,
  cs.due_date,
  cs.last_review_date,
  cs.difficulty,
  cs.stability,
  cs.retrievability,
  c.front_html,
  NOW() as agora,
  (cs.due_date <= NOW()) as deveria_aparecer,
  EXTRACT(EPOCH FROM (NOW() - cs.due_date)) / 3600 as horas_atrasado
FROM card_states cs
JOIN cards c ON c.id = cs.card_id
WHERE cs.interval_days = 0
  AND cs.state != 'new'
ORDER BY cs.due_date DESC
LIMIT 20;

-- 2. Comparar review_logs com card_states
SELECT 
  rl.card_id,
  rl.reviewed_at,
  rl.new_interval_days as log_interval,
  rl.new_state as log_state,
  rl.new_due_date as log_due_date,
  cs.interval_days as state_interval,
  cs.state as state_state,
  cs.due_date as state_due_date,
  (rl.new_interval_days = cs.interval_days) as interval_match,
  (rl.new_state = cs.state) as state_match,
  (rl.new_due_date = cs.due_date) as due_date_match
FROM review_logs rl
JOIN card_states cs ON cs.card_id = rl.card_id AND cs.user_id = rl.user_id
WHERE rl.new_interval_days = 0
  AND rl.reviewed_at > NOW() - INTERVAL '1 day'
ORDER BY rl.reviewed_at DESC
LIMIT 10;

-- 3. Cards que deveriam aparecer na sessão de estudo
SELECT 
  cs.id,
  cs.card_id,
  cs.state,
  cs.interval_days,
  cs.due_date,
  c.front_html,
  NOW() as agora,
  cs.due_date <= NOW() as esta_devido
FROM card_states cs
JOIN cards c ON c.id = cs.card_id
WHERE cs.state != 'new'
  AND cs.due_date <= NOW()
ORDER BY cs.due_date ASC
LIMIT 20;

-- 4. Resumo geral
SELECT 
  state,
  COUNT(*) as total,
  SUM(CASE WHEN interval_days = 0 THEN 1 ELSE 0 END) as com_interval_zero,
  SUM(CASE WHEN due_date <= NOW() THEN 1 ELSE 0 END) as devidos_agora
FROM card_states
GROUP BY state
ORDER BY state;

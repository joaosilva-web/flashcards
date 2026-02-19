-- ============================================
-- MIGRAÇÃO: SM-2 para FSRS
-- ============================================
-- Este script adiciona os campos necessários para o algoritmo FSRS
-- mantendo compatibilidade com dados SM-2 existentes

-- Adicionar novos campos FSRS em card_states
ALTER TABLE card_states
  ADD COLUMN IF NOT EXISTS difficulty REAL DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS stability REAL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS retrievability REAL DEFAULT 1.0;

-- Adicionar comentários explicativos
COMMENT ON COLUMN card_states.difficulty IS 'FSRS: Dificuldade do card (0-10), maior = mais difícil';
COMMENT ON COLUMN card_states.stability IS 'FSRS: Estabilidade da memória em dias';
COMMENT ON COLUMN card_states.retrievability IS 'FSRS: Probabilidade de lembrar (0-1)';

-- Criar índice para consultas por stability/due_date
CREATE INDEX IF NOT EXISTS idx_card_states_stability ON card_states(stability);

-- Atualizar constraint de ease_factor para permitir transição
-- (removeremos o ease_factor no futuro quando todos migrarem)
ALTER TABLE card_states
  DROP CONSTRAINT IF EXISTS ease_factor_range,
  ADD CONSTRAINT ease_factor_range CHECK (ease_factor >= 1.3 OR ease_factor IS NULL);

-- Inicializar valores FSRS para cards existentes baseado em dados SM-2
UPDATE card_states
SET 
  -- Converter ease_factor (1.3-2.5) para difficulty (0-10)
  -- ease_factor baixo = difícil, então invertemos a escala
  difficulty = CASE
    WHEN ease_factor < 1.5 THEN 8.0
    WHEN ease_factor < 1.8 THEN 6.0
    WHEN ease_factor < 2.0 THEN 5.0
    WHEN ease_factor < 2.2 THEN 4.0
    ELSE 3.0
  END,
  -- Usar interval_days atual como stability inicial
  stability = CASE
    WHEN interval_days > 0 THEN CAST(interval_days AS REAL)
    ELSE 0.4  -- valor inicial para cards novos
  END,
  -- Calcular retrievability baseado em quanto tempo falta para due_date
  retrievability = CASE
    WHEN due_date <= NOW() THEN 0.9  -- card devido
    WHEN interval_days = 0 THEN 1.0  -- card novo
    ELSE 1.0  -- card futuro
  END
WHERE difficulty IS NULL OR stability IS NULL OR retrievability IS NULL;

-- Adicionar campos FSRS em review_logs para histórico
ALTER TABLE review_logs
  ADD COLUMN IF NOT EXISTS previous_difficulty REAL,
  ADD COLUMN IF NOT EXISTS previous_stability REAL,
  ADD COLUMN IF NOT EXISTS previous_retrievability REAL,
  ADD COLUMN IF NOT EXISTS new_difficulty REAL,
  ADD COLUMN IF NOT EXISTS new_stability REAL,
  ADD COLUMN IF NOT EXISTS new_retrievability REAL;

COMMENT ON COLUMN review_logs.previous_difficulty IS 'FSRS: Dificuldade antes da revisão';
COMMENT ON COLUMN review_logs.previous_stability IS 'FSRS: Estabilidade antes da revisão';
COMMENT ON COLUMN review_logs.new_difficulty IS 'FSRS: Nova dificuldade após revisão';
COMMENT ON COLUMN review_logs.new_stability IS 'FSRS: Nova estabilidade após revisão';

-- Criar função auxiliar para calcular retrievability
CREATE OR REPLACE FUNCTION calculate_retrievability(
  p_stability REAL,
  p_days_since_review REAL
) RETURNS REAL AS $$
BEGIN
  -- R(t) = e^(-t/S)
  IF p_stability <= 0 THEN
    RETURN 1.0;
  END IF;
  RETURN EXP(-p_days_since_review / p_stability);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_retrievability IS 'FSRS: Calcula probabilidade de lembrar após t dias';

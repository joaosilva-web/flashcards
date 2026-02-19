-- Corrigir todos os ease_factors inválidos
UPDATE card_states 
SET ease_factor = CASE 
  WHEN ease_factor < 1.3 THEN 1.3
  WHEN ease_factor > 2.5 THEN 2.5
  WHEN ease_factor IS NULL THEN 2.5
  ELSE ease_factor
END
WHERE ease_factor < 1.3 OR ease_factor > 2.5 OR ease_factor IS NULL;

-- Verificar se há registros com problemas
SELECT COUNT(*) as total_invalidos 
FROM card_states 
WHERE ease_factor < 1.3 OR ease_factor > 2.5 OR ease_factor IS NULL;

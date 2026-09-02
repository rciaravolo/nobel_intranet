-- 0009_perfdb_historica_reindex.sql
-- Corrige a ordem dos índices em cust_historica e cap_historica.
--
-- O 0008 criou `(data, id_assessor)` supondo que o filtro de data seria seletivo.
-- Mas as tabelas têm ~100% dos rows dentro do range 2025-2026 (o único range
-- que a query usa), então o range de data não filtra nada e o composto vira
-- full scan disfarçado. O padrão real da query é
--   WHERE id_assessor = ? AND data BETWEEN X AND Y
-- então a ordem correta é (id_assessor, data): equality primeiro, range depois.

DROP INDEX IF EXISTS idx_cust_historica_data_assessor;
DROP INDEX IF EXISTS idx_cap_historica_data_assessor;

CREATE INDEX IF NOT EXISTS idx_cust_historica_assessor_data ON cust_historica(id_assessor, data);
CREATE INDEX IF NOT EXISTS idx_cap_historica_assessor_data  ON cap_historica(id_assessor, data);

ANALYZE;

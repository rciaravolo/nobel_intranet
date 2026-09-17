-- 0012_metas_produto_pj.sql
-- Adiciona a dimensão `pj` em metas_produto. PJ1 = produtos da assessoria de
-- investimentos (rv/rf/coe/cambio/etc); PJ2 = produtos separados (seguros,
-- consórcio, plano_saude). Cada produto pertence a uma única PJ, então a PK
-- (mes_iso, produto_slug) continua válida — `pj` é dimensão descritiva.
--
-- Default 'PJ1' pra que as linhas antigas (que vão ser reescritas em seguida
-- via wrangler execute) tenham valor válido durante a transição.

ALTER TABLE metas_produto ADD COLUMN pj TEXT NOT NULL DEFAULT 'PJ1';

CREATE INDEX IF NOT EXISTS idx_metas_produto_pj ON metas_produto(pj);

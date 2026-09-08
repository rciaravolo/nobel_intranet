-- 0011_metas_produto.sql
-- Cria a tabela `metas_produto` no PERF_DB (nobel-performance-db).
-- Substitui o JSON estático `server/src/data/metas.json`, que expunha os
-- valores comerciais no repositório. Uma linha por (mes_iso, produto_slug);
-- `valor` é a meta de receita bruta em BRL para o mês/produto.
--
-- Aplicado em PERF_DB, NÃO em intra-db.
-- Seed dos valores (2026-06) é feito via `wrangler d1 execute --remote`
-- fora do repo — o SQL de INSERT não é versionado, pra não vazar os números.

CREATE TABLE IF NOT EXISTS metas_produto (
  mes_iso       TEXT NOT NULL,               -- 'YYYY-MM'
  produto_slug  TEXT NOT NULL,               -- 'rv','rf','coe','cambio','feefixo','seguros','consorcio','internacional','oferta_fundos','fundos','previdencia','precas','planejamento'
  valor         REAL NOT NULL DEFAULT 0,
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (mes_iso, produto_slug)
);

-- Índice pra buscar todas as metas de um mês (padrão de acesso da rota /metas).
CREATE INDEX IF NOT EXISTS idx_metas_produto_mes ON metas_produto(mes_iso);

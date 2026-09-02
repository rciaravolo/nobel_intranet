-- 0008_perfdb_indexes.sql
-- Adiciona índices nas tabelas quentes do nobel-performance-db pra reduzir
-- rows_read (dashboard/historico faziam full scan → estouramos o limite diário
-- do D1 free tier em 2026-09-02). Aplicado em PERF_DB, não em intra-db.
--
-- Padrão: WHERE id_assessor = ? → índice single-col em id_assessor.
-- receita_fundos e receita_prev são VIEWS sobre tb_diversificador — pra elas,
-- índice composto (id_assessor, produto) na tabela base.
-- cust_historica / cap_historica: query filtra por data + id_assessor → composto.

CREATE INDEX IF NOT EXISTS idx_receita_rv_assessor            ON receita_rv(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_rf_assessor            ON receita_rf(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_coe_assessor           ON receita_coe(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_cambio_assessor        ON receita_cambio(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_feefixo_assessor       ON receita_feefixo(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_seguros_assessor       ON receita_seguros(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_consorcio_assessor     ON receita_consorcio(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_dominion_assessor      ON receita_dominion(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_oferta_fundos_assessor ON receita_oferta_fundos(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_precas_assessor        ON receita_precas(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_financiamento_assessor ON receita_financiamento(id_assessor);
CREATE INDEX IF NOT EXISTS idx_receita_planejamento_assessor  ON receita_planejamento(id_assessor);

-- Cobre as VIEWS receita_fundos e receita_prev (WHERE produto=X AND id_assessor=Y)
CREATE INDEX IF NOT EXISTS idx_diversificador_assessor_produto ON tb_diversificador(id_assessor, produto);

-- Cobre queries do /historico (WHERE strftime('%Y', data) IN (...) AND id_assessor = ?)
-- Nota: strftime() no WHERE ainda impede o uso IDEAL do índice em data;
-- o Fix #2 (trocar strftime por range de datas) é complementar. Mas o composto
-- em (data, id_assessor) já permite range scan mais eficiente que full scan.
CREATE INDEX IF NOT EXISTS idx_cust_historica_data_assessor ON cust_historica(data, id_assessor);
CREATE INDEX IF NOT EXISTS idx_cap_historica_data_assessor  ON cap_historica(data, id_assessor);

ANALYZE;

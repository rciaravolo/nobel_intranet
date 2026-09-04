-- Migration: 0010_materiais
-- Cria a tabela `materiais` no intra-db: catálogo de arquivos publicados
-- por admins/masters e visíveis a todos os usuários logados.
-- Os binários vivem no bucket R2 `intra-materiais` (binding MATERIAIS_R2);
-- aqui guardamos só metadata + a chave R2.

CREATE TABLE IF NOT EXISTS `materiais` (
  `id`             TEXT NOT NULL PRIMARY KEY,
  `titulo`         TEXT NOT NULL,
  `descricao`      TEXT,
  `arquivo_nome`   TEXT NOT NULL,          -- nome original do upload
  `arquivo_key`    TEXT NOT NULL UNIQUE,   -- chave dentro do bucket R2
  `arquivo_size`   INTEGER NOT NULL,       -- bytes
  `arquivo_mime`   TEXT NOT NULL,
  `publicado_por`  TEXT NOT NULL,          -- email do admin que subiu
  `publicado_em`   TEXT NOT NULL DEFAULT (datetime('now')),
  `atualizado_em`  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS `idx_materiais_publicado_em`
  ON `materiais` (`publicado_em` DESC);

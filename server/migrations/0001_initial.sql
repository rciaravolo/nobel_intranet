-- Migration: 0001_initial
-- Criação das tabelas base do INTRA: comunicados e user_roles

CREATE TABLE IF NOT EXISTS `comunicados` (
  `id`               TEXT NOT NULL PRIMARY KEY,
  `titulo`           TEXT NOT NULL,
  `conteudo`         TEXT NOT NULL,
  `categoria`        TEXT NOT NULL CHECK(`categoria` IN ('RH', 'Produtos', 'PJ2')),
  `autor_email`      TEXT NOT NULL,
  `autor_nome`       TEXT NOT NULL,
  `data_expiracao`   TEXT,
  `ativo`            INTEGER NOT NULL DEFAULT 1,
  `criado_em`        TEXT NOT NULL DEFAULT (datetime('now')),
  `atualizado_em`    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS `idx_comunicados_categoria`
  ON `comunicados` (`categoria`);

CREATE INDEX IF NOT EXISTS `idx_comunicados_ativo`
  ON `comunicados` (`ativo`);

CREATE INDEX IF NOT EXISTS `idx_comunicados_autor_email`
  ON `comunicados` (`autor_email`);

CREATE TABLE IF NOT EXISTS `user_roles` (
  `email`      TEXT NOT NULL PRIMARY KEY,
  `role`       TEXT NOT NULL DEFAULT 'Membro' CHECK(`role` IN ('RH', 'Diretoria', 'Membro')),
  `criado_em`  TEXT NOT NULL DEFAULT (datetime('now'))
);

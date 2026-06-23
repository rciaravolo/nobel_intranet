-- Migration: 0002_login_events
-- Registro de acessos diários ao sistema (um registro por usuário por dia)

CREATE TABLE IF NOT EXISTS `login_events` (
  `id`        INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  `email`     TEXT NOT NULL,
  `nome`      TEXT NOT NULL DEFAULT '',
  `role`      TEXT NOT NULL DEFAULT '',
  `data`      TEXT NOT NULL,
  `logged_at` TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS `idx_login_events_email_data`
  ON `login_events` (`email`, `data`);

CREATE INDEX IF NOT EXISTS `idx_login_events_data`
  ON `login_events` (`data`);

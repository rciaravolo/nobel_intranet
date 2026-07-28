-- Migration: 0005_password_reset_tokens
-- Armazena sha256 dos tokens de reset (nunca o token cru).
-- Cada token uso único: usedAt marcado após reset bem-sucedido.

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `token_hash` TEXT NOT NULL PRIMARY KEY,
  `user_id`    TEXT NOT NULL,
  `expires_at` TEXT NOT NULL,
  `used_at`    TEXT,
  `criado_em`  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS `idx_prt_user_id`    ON `password_reset_tokens` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_prt_expires_at` ON `password_reset_tokens` (`expires_at`);

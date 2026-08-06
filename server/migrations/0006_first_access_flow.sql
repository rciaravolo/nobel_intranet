-- Migration: 0006_first_access_flow
-- 1) Adiciona flag must_change_password na tabela users.
--    Novos users provisionados com senha padrão têm must_change_password=1;
--    o fluxo de primeiro acesso força troca antes de liberar navegação.
-- 2) Semeia primeiro user de teste (roberta.figueira) com hash de "nobel2026".

ALTER TABLE `users` ADD COLUMN `must_change_password` INTEGER NOT NULL DEFAULT 0;

INSERT OR IGNORE INTO `users` (
  `id`, `username`, `email`, `password_hash`, `name`, `role`,
  `equipe`, `id_assessor`, `department`, `avatar_initials`,
  `must_change_password`
) VALUES (
  'usr_a21878_001',
  'roberta.figueira',
  'roberta.figueira@nobelcapital.com.br',
  '1cecae4be7885568fd37b97039ff231d1fc09bd7415f8d6760f045c634bdb39b12fcfbec1b2ca89ec4fad5b88e8364a03c6bb292fa9e7e48dbac5eb9f2904d99.59baa725c462b3100066f03c572317c6',
  'Roberta Figueira',
  'assessor',
  'PRIVATE',
  'A21878',
  'Assessoria — PRIVATE',
  'RF',
  1
);

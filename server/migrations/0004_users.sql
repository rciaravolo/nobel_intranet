-- Migration: 0004_users
-- Tabela de usuários e seeds iniciais migrados de src/lib/auth/users.ts.
-- Hashes preservados exatamente iguais ao array in-memory (nenhuma senha muda).

CREATE TABLE IF NOT EXISTS `users` (
  `id`              TEXT NOT NULL PRIMARY KEY,
  `username`        TEXT NOT NULL,
  `email`           TEXT NOT NULL,
  `password_hash`   TEXT NOT NULL,
  `name`            TEXT NOT NULL,
  `role`            TEXT NOT NULL,
  `equipe`          TEXT,
  `id_assessor`     TEXT,
  `department`      TEXT NOT NULL,
  `avatar_initials` TEXT NOT NULL,
  `ativo`           INTEGER NOT NULL DEFAULT 1,
  `criado_em`       TEXT NOT NULL DEFAULT (datetime('now')),
  `atualizado_em`   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS `idx_users_username` ON `users` (`username`);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_users_email`    ON `users` (`email`);

-- Seeds (12 usuários) — hashes idênticos ao SEED_USERS anterior.
INSERT OR IGNORE INTO `users` (
  `id`, `username`, `email`, `password_hash`, `name`, `role`,
  `equipe`, `id_assessor`, `department`, `avatar_initials`
) VALUES
  ('usr_admin_001', 'rafael.brandao', 'rafael.brandao@nobelcapital.com.br',
   '704fcea865f0c2eb89f925cadd2fa8a74b0fa5cd1170ea377849e8c53b18a842f643f65db22f7f4c14621834a6909addc4a8a18d97bcb151e209cc7ae015224d.a7f3d2e1c4b5a6f7d8e9c0b1a2f3d4e5',
   'Rafael Brandão', 'admin', NULL, NULL, 'Gestão', 'RB'),

  ('usr_a32005_001', 'fabio.ribeiro', 'fabio.ribeiro@nobelcapital.com.br',
   '0c32a40a02106a9d2a8dc16ae9ac32106689595d8ce16be9c2f3b336cdc286c275ae7e9a930c0af714be1b7875940439fb208ac2119034ee65567aed8f17642e.b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
   'Fábio Ribeiro', 'assessor', NULL, NULL, 'Assessoria — Equipe BRAVO', 'FR'),

  ('usr_master_001', 'luis.valente', 'luis.valente@nobelcapital.com.br',
   'cddd96033ba0086734e8be4113e35e64c536305456bb2500ae3199e630be4420f4b32a2f66d57c1f368cd61c9d8c48e356f196b58a07e59dc75958b16d54a083.e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
   'Luis Valente', 'master', NULL, NULL, 'Gestão', 'LV'),

  ('usr_master_002', 'vitor.baqueiro', 'vitor.baqueiro@nobelcapital.com.br',
   '8aac4c24d4d1ec36251594a27ed90676ffa74bb62031715600e5d664ada45dd509c6f76c4be3a8a15ad4a70b8a6cfbea3ab512785e82f082a3f3cc14f3e41cf1.f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
   'Vitor Baqueiro', 'master', NULL, NULL, 'Gestão', 'VB'),

  ('usr_a65954_001', 'adriano.fonseca', 'adriano.fonseca@nobelcapital.com.br',
   '6d22e2f635075d005517d6cdc3819b45f0ab3486dddfa5f1007734ccd808da9b5b3898ada2d65e972c045d03fddc98fa38da0b6779fe061d58e84df09a450550.a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
   'Adriano Fonseca', 'assessor', 'PRIVATE', NULL, 'Assessoria — PRIVATE', 'AF'),

  ('usr_a74811_001', 'igor.ladeira', 'igor.ladeira@nobelcapital.com.br',
   '16384db6df3976b002c37cfae71075ede70b67283d2011c37aa7da3b1165835f6e8b70a203cced7ed1a921192794027993210e242a569d5ee5bbd88f5799d277.f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6',
   'Igor Ladeira', 'assessor', 'SMART-Alfa', NULL, 'Assessoria — SMART-Alfa', 'IL'),

  ('usr_a44655_001', 'filipe.rezende', 'filipe.rezende@nobelcapital.com.br',
   '32b4a2a5a840a138633a2a1bb37d9a5c39c1f696d8f45dfa2c5dbc147a10c448a86ee87cc3626a9eac4fb43b41657f6b7c9a25d83df22965532c7fc407e7046b.c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
   'Filipe Rezende', 'assessor', 'SMART', NULL, 'Assessoria — SMART', 'FZ'),

  ('usr_lider_001', 'rafael.bonfim', 'rafael.bonfim@nobelcapital.com.br',
   '506d8e15d26d81be3824ac7056c6dac8721f6366cd9cc708b6dfb4bcf39dc7f79af06104d17d88e36f4fdcd0bb013fc5a72f5144280c138a3e1b88d1efe7186f.d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
   'Rafael Bonfim', 'lider', 'BRAVO', NULL, 'Assessoria — Equipe BRAVO', 'RBo'),

  ('usr_lider_002', 'viviane.fabbri', 'viviane.fabbri@nobelcapital.com.br',
   '8d6ee14d321fabdb226d7fb73e6426cd5622a6ebc7a925996b6ecb27fa82ece88c60bc508f60b330c6b315b383b65b2f647b42abc31c80910993bc4977b45122.d7bb74b66f8f099817340ee6024e6449',
   'Viviane Fabbri', 'lider', 'RIO PRETO', NULL, 'Assessoria — Equipe RIO PRETO', 'VF'),

  ('usr_a21351_001', 'alexandre.franca', 'alexandre.franca@nobelcapital.com.br',
   'caeb4f2fd2f68f4092a6bba0915cba148e1f619d8e1c5834d1a55c9af519425c36d692a347a5e70adeb622c58cf432a58d600282cbfaf942745da783a4616d9e.4fea7cf257d789e8dbb7f2a930f6883a',
   'Alexandre França', 'assessor', 'PRIVATE', NULL, 'Assessoria — PRIVATE', 'AF'),

  ('usr_a23591_001', 'marcos.pereira', 'marcos.pereira@nobelcapital.com.br',
   'a7828656586ee0783fca64d93e6b61539f856f6565ab4588db0e499fd970f217d4c8bb68761ced2bb6a2e65c42af86219005929017ddcb08d8b6e43b405e5fed.b6517036d46169d961a02e950b4c4185',
   'Marcos Pereira', 'assessor', 'SMART', NULL, 'Assessoria — SMART', 'MP'),

  ('usr_lider_pj_001', 'luis.vieira', 'luis.vieira@nobelcapital.com.br',
   '1b004cd5a7122e4406cfc4bc9eb976b07b940405817897622fad6a1663dc59b14a0d41a5136b64b7b575b779565ae0be35d8840bba6db27385386b5297bad099.1b9d74db5f48f4c898fc07600fef2119',
   'Luis Vieira', 'lider_pj', NULL, 'A25771', 'PJ1', 'LV');

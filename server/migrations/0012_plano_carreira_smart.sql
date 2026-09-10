-- Popula plano_carreira com os assessores do time SMART (classe Pleno).
-- Exclui contas operacionais: Marco Silveira (A32561, lider do time),
-- GEOVANNA FINDER (FINDER01) e "Smart - Mesa" (A51250) — confirmado com o Rafa.

INSERT INTO plano_carreira (id_assessor, nome_assessor, equipe, classe, status) VALUES
  ('A95945', 'Fabrício Mastro',   'SMART', 'Pleno', 'Ativo'),
  ('A44655', 'Filipe Rezende',    'SMART', 'Pleno', 'Ativo'),
  ('A74811', 'Igor Ladeira',      'SMART', 'Pleno', 'Ativo'),
  ('A54062', 'Luan Prado',        'SMART', 'Pleno', 'Ativo'),
  ('A26852', 'Lucas Pradella',    'SMART', 'Pleno', 'Ativo'),
  ('A23591', 'Marcos Pereira',    'SMART', 'Pleno', 'Ativo'),
  ('A96628', 'Rafael Paschoal',   'SMART', 'Pleno', 'Ativo'),
  ('A59119', 'Rodrigo Conforti',  'SMART', 'Pleno', 'Ativo');

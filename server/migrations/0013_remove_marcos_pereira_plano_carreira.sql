-- Remove Marcos Pereira do plano de carreira do time SMART (correcao de escopo,
-- confirmado com o Rafa apos a migration 0012).
DELETE FROM plano_carreira WHERE id_assessor = 'A23591' AND equipe = 'SMART';

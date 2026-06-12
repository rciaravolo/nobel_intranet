CREATE TABLE IF NOT EXISTS receita_snapshot (
  equipe        TEXT NOT NULL,
  data          TEXT NOT NULL,        -- ISO date: YYYY-MM-DD
  receita_total REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (equipe, data)
);

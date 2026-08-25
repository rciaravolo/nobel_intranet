import type { Env } from '../types'

const RECEITA_TABELAS = [
  'receita_rv', 'receita_rf', 'receita_coe', 'receita_cambio',
  'receita_feefixo', 'receita_seguros', 'receita_consorcio', 'receita_dominion',
  'receita_oferta_fundos', 'receita_parceiros', 'receita_precas',
  'receita_fundos', 'receita_prev', 'receita_financiamento',
] as const

// Equipes consideradas no snapshot de receita: 3 comerciais + planejamento.
// RIO PRETO removida (não é equipe ativa do PnL).
const EQUIPES_SNAPSHOT_SQL = `('SMART', 'PRIVATE', 'BRAVO', 'PLANEJAMENTO')`

export type SnapshotResult = {
  dataD2: string
  equipes: string[]
  totalByEquipe: Record<string, number>
}

export async function snapshotReceita(env: Env): Promise<SnapshotResult> {
  const db  = env.PERF_DB
  const brt = new Date(Date.now() - 3 * 60 * 60 * 1000)

  // Usa D-2 dias úteis como data de referência (dados do custodian chegam com lag de D+2)
  const refD2 = new Date(brt)
  let bizCount = 0
  while (bizCount < 2) {
    refD2.setUTCDate(refD2.getUTCDate() - 1)
    const dow = refD2.getUTCDay()
    if (dow !== 0 && dow !== 6) bizCount++
  }
  const dataD2 = [
    refD2.getUTCFullYear(),
    String(refD2.getUTCMonth() + 1).padStart(2, '0'),
    String(refD2.getUTCDate()).padStart(2, '0'),
  ].join('-')

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS receita_snapshot (
      equipe        TEXT NOT NULL,
      data          TEXT NOT NULL,
      receita_total REAL NOT NULL DEFAULT 0,
      PRIMARY KEY (equipe, data)
    )
  `).run()

  // D1 limita compound SELECT a 5 termos — rodamos uma query por tabela e
  // agregamos em JS (mesmo padrão de /pnl/indicadores/drill).
  const receitaResults = await Promise.all(
    RECEITA_TABELAS.map((tabela) =>
      db.prepare(`
        SELECT a.equipe, COALESCE(SUM(r.receita), 0) AS receita_total
        FROM   ${tabela} r
        JOIN   assessores a ON r.id_assessor = a.id_assessor
        WHERE  a.equipe IN ${EQUIPES_SNAPSHOT_SQL}
        GROUP  BY a.equipe
      `).all<{ equipe: string; receita_total: number }>()
    ),
  )

  const totalByEquipe: Record<string, number> = {}
  for (const res of receitaResults) {
    for (const r of res.results) {
      totalByEquipe[r.equipe] = (totalByEquipe[r.equipe] ?? 0) + r.receita_total
    }
  }

  const equipes = Object.keys(totalByEquipe)
  if (equipes.length === 0) return { dataD2, equipes, totalByEquipe }

  await db.batch(
    equipes.map((equipe) =>
      db
        .prepare(`INSERT OR REPLACE INTO receita_snapshot (equipe, data, receita_total) VALUES (?, ?, ?)`)
        .bind(equipe, dataD2, totalByEquipe[equipe]!),
    ),
  )

  return { dataD2, equipes, totalByEquipe }
}

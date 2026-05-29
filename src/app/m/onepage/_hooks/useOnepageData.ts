'use client'
import { useEffect, useState } from 'react'
import { PLACEHOLDER_DATA } from '../../_lib/placeholders'
import { rankColor } from '../../_lib/chartColor'
import type { CaptacaoMes, FaixaNet, MobileUser, OnePageData, Produto } from '../../_lib/types'

interface OnepageResponse {
  data: {
    dataRef: string | null
    mesLabel: string
    aum: number
    clientes: { ativos: number; inativos: number }
    captacao: { bruta: number; resgates: number; liquida: number }
    receita: { total: number; porProduto: { produto: string; receita: number }[] }
    faixasNet: { label: string; clientes: number; aum: number }[]
  }
}

interface HistoricoResponse {
  data: {
    historico: {
      mes: number
      label: string
      captacao: { v25: number | null; v26: number | null }
      custodia: { v25: number | null; v26: number | null }
    }[]
  }
}


const MES_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function buildSparkline(monthlyValues: number[], targetPoints: number): number[] {
  if (monthlyValues.length === 0) return Array(targetPoints).fill(0)
  if (monthlyValues.length === 1) {
    const v = monthlyValues[0]!
    return Array.from({ length: targetPoints }, (_, i) => v * (0.97 + i * 0.001))
  }
  const result: number[] = []
  const step = (monthlyValues.length - 1) / (targetPoints - 1)
  for (let i = 0; i < targetPoints; i++) {
    const pos = i * step
    const lo = Math.floor(pos)
    const hi = Math.min(lo + 1, monthlyValues.length - 1)
    const t = pos - lo
    result.push(monthlyValues[lo]! + (monthlyValues[hi]! - monthlyValues[lo]!) * t)
  }
  return result
}

export function useOnepageData(user: MobileUser): OnePageData {
  const [data, setData] = useState<OnePageData>({ ...PLACEHOLDER_DATA, user })

  useEffect(() => {
    Promise.all([
      fetch('/api/performance/onepage').then((r) => r.json() as Promise<OnepageResponse>),
      fetch('/api/performance/historico').then((r) => r.json() as Promise<HistoricoResponse>),
    ])
      .then(([onepage, historico]) => {
        const d = onepage.data
        const h = historico.data.historico

        const parts = (d.dataRef ?? '').slice(0, 10).split('-')
        const posicaoEm = parts.length === 3 ? `${parts[2]}/${parts[1]}` : '—'

        const total = d.receita.total
        const sortedProdutos = [...d.receita.porProduto].sort((a, b) => b.receita - a.receita)
        const produtos: Produto[] = sortedProdutos.map((p, i) => ({
          nome: p.produto,
          valor: p.receita,
          pct: total > 0 ? (p.receita / total) * 100 : 0,
          color: rankColor(i, sortedProdutos.length),
        }))

        const totalAum = d.aum
        const faixas: FaixaNet[] = d.faixasNet.map((f) => ({
          faixa: f.label,
          clientes: f.clientes,
          custodia: f.aum,
          pct: totalAum > 0 ? (f.aum / totalAum) * 100 : 0,
        }))

        const custPoints = h
          .filter((m) => m.custodia.v26 != null)
          .map((m) => m.custodia.v26 as number)
        const series90d = buildSparkline(custPoints.length >= 2 ? custPoints : [d.aum], 30)

        const deltaMes =
          custPoints.length >= 2
            ? (custPoints[custPoints.length - 1]! / custPoints[custPoints.length - 2]!) - 1
            : 0

        // Monta entradas cronológicas (ano+mês) para capturar a fronteira de ano corretamente
        const now = new Date()
        const curYearMonth = now.getFullYear() * 100 + (now.getMonth() + 1)

        const capEntries: Array<{ key: number; mes: number; value: number }> = []
        for (const row of h) {
          if (row.captacao.v26 != null) capEntries.push({ key: 202600 + row.mes, mes: row.mes, value: row.captacao.v26 })
          if (row.captacao.v25 != null) capEntries.push({ key: 202500 + row.mes, mes: row.mes, value: row.captacao.v25 })
        }
        capEntries.sort((a, b) => a.key - b.key)

        const last6 = capEntries.filter((e) => e.key <= curYearMonth).slice(-6)
        const seriesMeses: CaptacaoMes[] = last6.map(({ mes, value }) => {
          const v = value / 1_000_000
          return {
            m: MES_LABELS[mes - 1] ?? String(mes),
            liq: v,
            bruta: Math.max(v, 0),
            resgates: Math.abs(Math.min(v, 0)),
          }
        })

        setData({
          user,
          posicaoEm,
          custodia: { value: d.aum, deltaMes, series90d },
          clientes: {
            ativos: d.clientes.ativos,
            inativos: d.clientes.inativos,
            base: d.clientes.ativos + d.clientes.inativos,
          },
          receita: { mes: total, deltaMes: 0 },
          captacao: {
            bruta: d.captacao.bruta,
            resgates: Math.abs(d.captacao.resgates),
            liquida: d.captacao.liquida,
            series: seriesMeses.length > 0 ? seriesMeses : PLACEHOLDER_DATA.captacao.series,
            topMovs: [],
          },
          faixas: faixas.length > 0 ? faixas : PLACEHOLDER_DATA.faixas,
          produtos,
          materiais: PLACEHOLDER_DATA.materiais,
          topClientes: [],
        })
      })
      .catch((err) => {
        console.error('[useOnepageData] fetch failed:', err)
      })
  }, [user.name])

  return data
}

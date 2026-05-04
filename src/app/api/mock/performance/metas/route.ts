import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    data: {
      semMeta: false,
      mesISO: '2026-04',
      dias: { passados: 22, restantes: 8, total: 30 },
      produtos: [
        {
          slug: 'renda-fixa',
          label: 'Renda Fixa',
          meta: 820_000,
          realizado: 712_000,
          gap: -108_000,
          pctAtingido: 86.8,
          paceRealizado: 32_363,
          paceNecessario: 13_500,
          projecao: 980_000,
          pctMeta: 119.5,
        },
        {
          slug: 'renda-variavel',
          label: 'Renda Variável',
          meta: 550_000,
          realizado: 489_500,
          gap: -60_500,
          pctAtingido: 89.0,
          paceRealizado: 22_250,
          paceNecessario: 7_562,
          projecao: 638_000,
          pctMeta: 116.0,
        },
        {
          slug: 'fee-fixo',
          label: 'Fee Fixo',
          meta: 400_000,
          realizado: 398_000,
          gap: -2_000,
          pctAtingido: 99.5,
          paceRealizado: 18_090,
          paceNecessario: 250,
          projecao: 415_000,
          pctMeta: 103.7,
        },
        {
          slug: 'coe',
          label: 'COE',
          meta: 320_000,
          realizado: 281_000,
          gap: -39_000,
          pctAtingido: 87.8,
          paceRealizado: 12_772,
          paceNecessario: 4_875,
          projecao: 345_000,
          pctMeta: 107.8,
        },
        {
          slug: 'oferta-fundos',
          label: 'Oferta de Fundos',
          meta: 180_000,
          realizado: 214_000,
          gap: 34_000,
          pctAtingido: 118.9,
          paceRealizado: 9_727,
          paceNecessario: 0,
          projecao: 270_000,
          pctMeta: 150.0,
        },
      ],
      total: {
        meta: 2_270_000,
        realizado: 2_094_500,
        projecao: 2_648_000,
        gap: -175_500,
        pctAtingido: 92.3,
        pctMeta: 116.7,
      },
    },
  })
}

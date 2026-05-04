import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    data: {
      dataRef: '2026-04-30T00:00:00.000Z',
      mesLabel: 'Abril/26',
      aum: 847_320_000,
      clientes: { ativos: 1247, inativos: 89 },
      captacao: {
        bruta: 31_200_000,
        resgates: 18_720_000,
        liquida: 12_480_000,
      },
      receita: {
        total: 2_318_500,
        porProduto: [
          { produto: 'Renda Fixa', receita: 712_000 },
          { produto: 'Renda Variável', receita: 489_500 },
          { produto: 'Fee Fixo', receita: 398_000 },
          { produto: 'COE', receita: 281_000 },
          { produto: 'Oferta de Fundos', receita: 214_000 },
          { produto: 'Seguros', receita: 124_000 },
          { produto: 'Câmbio', receita: 100_000 },
        ],
      },
    },
  })
}

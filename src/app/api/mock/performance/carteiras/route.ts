import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    data: {
      dataRef: '2026-04-30T00:00:00.000Z',
      total: 847_320_000,
      alocacao: [
        { classe: 'Renda Fixa', valor: 381_294_000, pct: 45.0 },
        { classe: 'Multimercado', valor: 169_464_000, pct: 20.0 },
        { classe: 'Renda Variável', valor: 127_098_000, pct: 15.0 },
        { classe: 'Previdência', valor: 84_732_000, pct: 10.0 },
        { classe: 'Internacional', valor: 50_839_200, pct: 6.0 },
        { classe: 'Alternativos', valor: 33_892_800, pct: 4.0 },
      ],
    },
  })
}

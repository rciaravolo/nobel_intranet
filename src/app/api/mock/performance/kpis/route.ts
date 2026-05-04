import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    data: {
      aum: { value: 847_320_000, dataRef: '2026-04-30T00:00:00.000Z' },
      clientesAtivos: { value: 1247 },
      captacao: { value: 12_480_000, mesLabel: 'Abril/26' },
      receita: { value: 2_318_500 },
    },
  })
}

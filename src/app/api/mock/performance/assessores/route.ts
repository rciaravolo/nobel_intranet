import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    data: [
      {
        email: 'fabio.ribeiro@nobelcapital.com.br',
        name: 'Fábio Ribeiro',
        equipe: 'BRAVO',
        aum: 142_800_000,
        clientes: 198,
        captacao: 2_100_000,
        receita: 389_000,
      },
      {
        email: 'ana.torres@nobelcapital.com.br',
        name: 'Ana Torres',
        equipe: 'ALPHA',
        aum: 118_400_000,
        clientes: 164,
        captacao: 1_840_000,
        receita: 321_000,
      },
      {
        email: 'carlos.mendes@nobelcapital.com.br',
        name: 'Carlos Mendes',
        equipe: 'ALPHA',
        aum: 97_200_000,
        clientes: 141,
        captacao: 1_420_000,
        receita: 267_000,
      },
      {
        email: 'julia.costa@nobelcapital.com.br',
        name: 'Júlia Costa',
        equipe: 'BRAVO',
        aum: 88_600_000,
        clientes: 127,
        captacao: 1_310_000,
        receita: 243_000,
      },
      {
        email: 'pedro.alves@nobelcapital.com.br',
        name: 'Pedro Alves',
        equipe: 'DELTA',
        aum: 76_300_000,
        clientes: 112,
        captacao: 980_000,
        receita: 209_000,
      },
      {
        email: 'mariana.lima@nobelcapital.com.br',
        name: 'Mariana Lima',
        equipe: 'DELTA',
        aum: 71_900_000,
        clientes: 108,
        captacao: 890_000,
        receita: 197_000,
      },
      {
        email: 'rodrigo.santos@nobelcapital.com.br',
        name: 'Rodrigo Santos',
        equipe: 'BRAVO',
        aum: 65_400_000,
        clientes: 94,
        captacao: 760_000,
        receita: 178_000,
      },
      {
        email: 'beatriz.ferreira@nobelcapital.com.br',
        name: 'Beatriz Ferreira',
        equipe: 'ALPHA',
        aum: 58_200_000,
        clientes: 82,
        captacao: 640_000,
        receita: 159_000,
      },
    ],
  })
}

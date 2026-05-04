import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    data: {
      historico: [
        { mes: 1, label: 'Jan', custodia: { v25: 698_000_000, v26: 779_000_000 }, captacao: { v25: 8_200_000, v26: 11_400_000 }, roa: { v25: 0.00241, v26: 0.00268 }, receita: { v25: 1_682_000, v26: 2_087_000 } },
        { mes: 2, label: 'Fev', custodia: { v25: 712_000_000, v26: 798_000_000 }, captacao: { v25: 9_100_000, v26: 10_900_000 }, roa: { v25: 0.00248, v26: 0.00271 }, receita: { v25: 1_765_000, v26: 2_162_000 } },
        { mes: 3, label: 'Mar', custodia: { v25: 724_000_000, v26: 821_000_000 }, captacao: { v25: 10_400_000, v26: 13_200_000 }, roa: { v25: 0.00253, v26: 0.00278 }, receita: { v25: 1_832_000, v26: 2_282_000 } },
        { mes: 4, label: 'Abr', custodia: { v25: 738_000_000, v26: 847_000_000 }, captacao: { v25: 11_800_000, v26: 12_480_000 }, roa: { v25: 0.00259, v26: 0.00274 }, receita: { v25: 1_911_000, v26: 2_318_500 } },
        { mes: 5, label: 'Mai', custodia: { v25: 751_000_000, v26: null }, captacao: { v25: 9_600_000, v26: null }, roa: { v25: 0.00261, v26: null }, receita: { v25: 1_958_000, v26: null } },
        { mes: 6, label: 'Jun', custodia: { v25: 763_000_000, v26: null }, captacao: { v25: 8_400_000, v26: null }, roa: { v25: 0.00257, v26: null }, receita: { v25: 1_961_000, v26: null } },
        { mes: 7, label: 'Jul', custodia: { v25: 778_000_000, v26: null }, captacao: { v25: 12_100_000, v26: null }, roa: { v25: 0.00263, v26: null }, receita: { v25: 2_047_000, v26: null } },
        { mes: 8, label: 'Ago', custodia: { v25: 790_000_000, v26: null }, captacao: { v25: 10_200_000, v26: null }, roa: { v25: 0.00268, v26: null }, receita: { v25: 2_117_000, v26: null } },
        { mes: 9, label: 'Set', custodia: { v25: 802_000_000, v26: null }, captacao: { v25: 11_500_000, v26: null }, roa: { v25: 0.00271, v26: null }, receita: { v25: 2_173_000, v26: null } },
        { mes: 10, label: 'Out', custodia: { v25: 815_000_000, v26: null }, captacao: { v25: 9_800_000, v26: null }, roa: { v25: 0.00269, v26: null }, receita: { v25: 2_192_000, v26: null } },
        { mes: 11, label: 'Nov', custodia: { v25: 826_000_000, v26: null }, captacao: { v25: 8_700_000, v26: null }, roa: { v25: 0.00265, v26: null }, receita: { v25: 2_188_000, v26: null } },
        { mes: 12, label: 'Dez', custodia: { v25: 841_000_000, v26: null }, captacao: { v25: 14_200_000, v26: null }, roa: { v25: 0.00272, v26: null }, receita: { v25: 2_288_000, v26: null } },
      ],
      totais: {
        captacao: { v25: 124_000_000, v26: 47_980_000 },
        receita: { v25: 24_114_000, v26: 8_849_500 },
      },
    },
  })
}

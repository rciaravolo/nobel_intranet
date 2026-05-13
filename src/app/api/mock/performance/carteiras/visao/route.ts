import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    data: {
      totais: {
        rf: 508_392_000,
        rv: 169_464_000,
        coe: 84_732_000,
        liquidez: 84_732_000,
        total: 847_320_000,
      },

      rf: {
        porIndexador: [
          { indexador: '% CDI',  total: 203_356_800, posicoes: 1842, clientes: 684 },
          { indexador: 'CDI +',  total: 127_098_000, posicoes:  943, clientes: 412 },
          { indexador: 'IPCA',   total: 101_678_400, posicoes:  782, clientes: 318 },
          { indexador: 'PRE',    total:  50_839_200, posicoes:  467, clientes: 221 },
          { indexador: 'LFT',    total:  20_335_680, posicoes:  189, clientes:  98 },
          { indexador: 'Selic',  total:   5_083_920, posicoes:   54, clientes:  31 },
        ],

        maturities: [
          {
            janela: '0–1a',
            total: 152_517_600,
            itens: [
              { tipo: 'Emissão Bancária',  total:  76_258_800 },
              { tipo: 'Credito Privado',   total:  45_755_280 },
              { tipo: 'Título Público',    total:  30_503_520 },
            ],
          },
          {
            janela: '1–2a',
            total: 118_069_800,
            itens: [
              { tipo: 'Emissão Bancária',  total:  59_034_900 },
              { tipo: 'Credito Privado',   total:  35_420_940 },
              { tipo: 'Título Público',    total:  23_613_960 },
            ],
          },
          {
            janela: '2–3a',
            total: 88_963_800,
            itens: [
              { tipo: 'Emissão Bancária',                total: 44_481_900 },
              { tipo: 'Credito Privado',                 total: 26_689_140 },
              { tipo: 'Letra Imobiliária Garantida',     total: 17_792_760 },
            ],
          },
          {
            janela: '3–5a',
            total: 76_258_800,
            itens: [
              { tipo: 'Letras Financeiras',  total: 38_129_400 },
              { tipo: 'Credito Privado',     total: 22_877_640 },
              { tipo: 'Título Público',      total: 15_251_760 },
            ],
          },
          {
            janela: '5–10a',
            total: 48_297_240,
            itens: [
              { tipo: 'Letras Financeiras',             total: 24_148_620 },
              { tipo: 'Tesouro Direto',                 total: 14_489_172 },
              { tipo: 'Letra Imobiliária Garantida',    total:  9_659_448 },
            ],
          },
          {
            janela: '+10a',
            total: 24_284_760,
            itens: [
              { tipo: 'Tesouro Direto',     total: 14_570_856 },
              { tipo: 'Letras Financeiras', total:  9_713_904 },
            ],
          },
        ],

        marcacao: [
          { flag_marcacao: 'Mercado', total: 325_370_880, posicoes: 2841 },
          { flag_marcacao: 'Curva',   total: 183_021_120, posicoes: 1436 },
        ],
      },

      rv: {
        setorial: [
          { setor: 'Financeiro',                         produto: 'Ação PN',  total:  28_408_512, clientes: 228 },
          { setor: 'Financeiro',                         produto: 'Ação ON',  total:  14_931_408, clientes: 120 },
          { setor: 'Fundo Imobiliário',                  produto: 'FII',      total:  35_341_404, clientes: 284 },
          { setor: 'Petróleo & Gas',                     produto: 'Ação PN',  total:  22_145_676, clientes: 178 },
          { setor: 'Mineração & Siderurgia',             produto: 'Ação ON',  total:  18_641_040, clientes: 149 },
          { setor: 'Energia elétrica & Saneamento',      produto: 'Ação ON',  total:  16_946_400, clientes: 136 },
          { setor: 'Varejo',                             produto: 'Ação ON',  total:  13_557_120, clientes: 109 },
          { setor: 'Transportes & Bens Industriais',     produto: 'Ação ON',  total:  11_015_160, clientes:  88 },
          { setor: 'Agro, Alimentos & Bebidas',          produto: 'Ação ON',  total:   8_473_200, clientes:  68 },
          { setor: 'Papel & Celulose',                   produto: 'Ação ON',  total:   5_177_760, clientes:  41 },
          { setor: 'Outros',                             produto: 'Ação ON',  total:   3_997_560, clientes:  32 },
        ],

        topAtivos: [
          { ativo: 'PETR4',  setor: 'Petróleo & Gas',                produto: 'Ação PN',  total: 22_145_676, clientes: 178, variacao:  0.142 },
          { ativo: 'BBAS3',  setor: 'Financeiro',                    produto: 'Ação ON',  total: 19_829_520, clientes: 159, variacao:  0.083 },
          { ativo: 'HGLG11', setor: 'Fundo Imobiliário',             produto: 'FII',      total: 18_641_040, clientes: 149, variacao:  0.061 },
          { ativo: 'VALE3',  setor: 'Mineração & Siderurgia',        produto: 'Ação ON',  total: 18_641_040, clientes: 149, variacao: -0.037 },
          { ativo: 'ITUB4',  setor: 'Financeiro',                    produto: 'Ação PN',  total: 16_946_400, clientes: 136, variacao:  0.095 },
          { ativo: 'KNRI11', setor: 'Fundo Imobiliário',             produto: 'FII',      total: 16_764_364, clientes: 135, variacao:  0.047 },
          { ativo: 'WEGE3',  setor: 'Transportes & Bens Industriais',produto: 'Ação ON',  total: 11_015_160, clientes:  88, variacao:  0.218 },
          { ativo: 'XPML11', setor: 'Fundo Imobiliário',             produto: 'FII',      total: 13_557_120, clientes: 109, variacao:  0.029 },
          { ativo: 'EGIE3',  setor: 'Energia elétrica & Saneamento', produto: 'Ação ON',  total:  8_473_200, clientes:  68, variacao: -0.018 },
          { ativo: 'MXRF11', setor: 'Fundo Imobiliário',             produto: 'FII',      total:  6_780_840, clientes:  54, variacao:  0.011 },
        ],
      },

      coe: {
        porTipo: [
          {
            tipo: 'BOND',
            posicoes:       342,
            total_compra:   54_869_760,
            total_atual:    58_526_760,
            total_cupom:     3_657_000,
            clientes:            214,
            pl:              7_314_000,
          },
          {
            tipo: 'PARTICIPACAO',
            posicoes:       156,
            total_compra:   25_419_600,
            total_atual:    26_205_240,
            total_cupom:             0,
            clientes:             98,
            pl:                785_640,
          },
        ],
      },

      liquidez: {
        porIndexador: [
          { indexador: '% CDI', total: 48_301_440, posicoes: 847, clientes: 423 },
          { indexador: 'Selic', total: 23_050_080, posicoes: 412, clientes: 206 },
          { indexador: 'CDI +', total: 13_380_480, posicoes: 231, clientes: 115 },
        ],
      },
    },
  })
}

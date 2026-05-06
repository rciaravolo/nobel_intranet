import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const now = new Date()
const h = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString()

export function GET() {
  return NextResponse.json({
    data: {
      atualizadoEm: now.toISOString(),
      noticias: [
        {
          id: 'mock-1',
          source: 'Valor Econômico',
          sourceColor: '#1a56db',
          category: 'Renda Fixa',
          headline:
            'Selic em 13,25% mantém atratividade de fundos de crédito privado no segundo trimestre',
          summary:
            'Com a taxa básica estável, gestores apontam que ativos de crédito high grade continuam com prêmio relevante sobre o CDI, sustentando captação nos fundos multimercado e renda fixa.',
          url: 'https://valor.globo.com',
          publishedAt: h(1),
        },
        {
          id: 'mock-2',
          source: 'InfoMoney',
          sourceColor: '#f97316',
          category: 'Renda Variável',
          headline:
            'Ibovespa sobe 1,2% puxado por commodities e bancos após dados positivos de inflação',
          summary:
            'IPCA abaixo do esperado reduz pressão sobre Copom e anima mercado com perspectiva de ciclo de corte de juros no segundo semestre.',
          url: 'https://www.infomoney.com.br',
          publishedAt: h(2),
        },
        {
          id: 'mock-3',
          source: 'Bloomberg',
          sourceColor: '#6366f1',
          category: 'Global',
          headline: 'Fed sinaliza apenas um corte em 2026 com economia americana ainda resiliente',
          summary:
            'Membros do FOMC indicaram cautela após dados de emprego acima do esperado, mantendo os juros em nível restritivo por mais tempo.',
          url: 'https://www.bloomberg.com',
          publishedAt: h(3),
        },
        {
          id: 'mock-4',
          source: 'ANBIMA',
          sourceColor: '#059669',
          category: 'Fundos',
          headline:
            'Indústria de fundos atinge R$ 9,8 trilhões em patrimônio com crescimento de multimercados',
          summary:
            'Dados de março/26 mostram aceleração nos fundos de ações e multimercado macro, com retomada de apetite a risco pelos investidores institucionais.',
          url: 'https://www.anbima.com.br',
          publishedAt: h(4),
        },
        {
          id: 'mock-5',
          source: 'Valor Econômico',
          sourceColor: '#1a56db',
          category: 'Câmbio',
          headline:
            'Dólar recua para R$ 5,12 com melhora do ambiente externo e fluxo de capital estrangeiro',
          summary:
            'Investidores estrangeiros ampliaram posição em bolsa brasileira, atraídos pelo diferencial de juros e valuation defasado frente a pares emergentes.',
          url: 'https://valor.globo.com',
          publishedAt: h(5),
        },
        {
          id: 'mock-6',
          source: 'CVM',
          sourceColor: '#7c3aed',
          category: 'Regulatório',
          headline:
            'CVM publica nova resolução sobre dever de adequação (suitability) para assessores de investimentos',
          summary:
            'Resolução 179 amplia responsabilidades dos assessores na verificação do perfil do cliente e exige atualização do questionário de suitability a cada 24 meses.',
          url: 'https://www.gov.br/cvm',
          publishedAt: h(6),
        },
      ],
    },
  })
}

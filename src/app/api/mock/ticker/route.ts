import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    data: {
      tickers: [
        { name: 'IBOV', value: '134.820', change: '+1,24%', up: true },
        { name: 'PETR4', value: 'R$ 38,42', change: '+2,10%', up: true },
        { name: 'VALE3', value: 'R$ 61,17', change: '-0,83%', up: false },
        { name: 'BBAS3', value: 'R$ 29,85', change: '+0,47%', up: true },
        { name: 'USD/BRL', value: 'R$ 5,12', change: '-0,34%', up: false },
        { name: 'EUR/BRL', value: 'R$ 5,81', change: '-0,19%', up: false },
        { name: 'CDI', value: '13,25%', change: 'a.a.', up: null },
        { name: 'IPCA', value: '4,83%', change: 'acum. 12m', up: null },
        { name: 'S&P 500', value: '5.648', change: '+0,68%', up: true },
        { name: 'BTC', value: 'US$ 94.210', change: '+3,15%', up: true },
      ],
    },
  })
}

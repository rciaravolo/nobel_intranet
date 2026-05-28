export interface MobileUser {
  name: string
  role: string
  initials: string
}

export interface FaixaNet {
  faixa: string
  clientes: number
  custodia: number
  pct: number
}

export interface Produto {
  nome: string
  valor: number
  pct: number
  color: string
}

export interface CaptacaoMes {
  m: string
  liq: number
  bruta: number
  resgates: number
}

export interface MovimentacaoCliente {
  cliente: string
  iniciais: string
  tipo: 'Aporte' | 'Resgate'
  valor: number
  data: string
}

export interface MaterialArquivo {
  nome: string
  tag: 'PRODUTOS' | 'MACRO' | 'ALLOCATION'
  tamanhoKb?: number
  paginas?: number
  isNew?: boolean
}

export interface MaterialMes {
  mes: string
  arquivos: MaterialArquivo[]
}

export interface TopCliente {
  nome: string
  iniciais: string
  net: number
  perfil: 'Conservadora' | 'Moderada' | 'Sofisticada'
  trendPct: number
}

export interface OnePageData {
  user: MobileUser
  posicaoEm: string
  custodia: {
    value: number
    deltaMes: number
    series90d: number[]
  }
  clientes: {
    ativos: number
    inativos: number
    base: number
  }
  receita: {
    mes: number
    deltaMes: number
  }
  captacao: {
    bruta: number
    resgates: number
    liquida: number
    series: CaptacaoMes[]
    topMovs?: MovimentacaoCliente[]
  }
  faixas: FaixaNet[]
  produtos: Produto[]
  materiais: MaterialMes[]
  topClientes?: TopCliente[]
}

export type Theme = 'light' | 'dark'

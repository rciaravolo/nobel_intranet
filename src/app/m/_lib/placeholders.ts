import type { CaptacaoMes, FaixaNet, MaterialMes, OnePageData, Produto } from './types'

const emptyMonths: CaptacaoMes[] = Array(6)
  .fill(null)
  .map(() => ({
    m: '—',
    liq: 0,
    bruta: 0,
    resgates: 0,
  }))

const emptyFaixas: FaixaNet[] = [
  { faixa: '0 – 300K', clientes: 0, custodia: 0, pct: 0 },
  { faixa: '300K – 1MM', clientes: 0, custodia: 0, pct: 0 },
  { faixa: '1MM – 10MM', clientes: 0, custodia: 0, pct: 0 },
  { faixa: '> 10MM', clientes: 0, custodia: 0, pct: 0 },
]

const emptyProdutos: Produto[] = [
  { nome: 'Fee Fixo', valor: 0, pct: 0, color: '262 70% 60%' },
  { nome: 'Fundos', valor: 0, pct: 0, color: '200 75% 55%' },
  { nome: 'Previdência', valor: 0, pct: 0, color: '140 55% 45%' },
  { nome: 'Renda Variável', valor: 0, pct: 0, color: '30 90% 55%' },
  { nome: 'Renda Fixa', valor: 0, pct: 0, color: '45 95% 50%' },
  { nome: 'COE', valor: 0, pct: 0, color: '0 70% 55%' },
  { nome: 'Câmbio', valor: 0, pct: 0, color: '210 12% 50%' },
]

const emptyMateriais: MaterialMes[] = [{ mes: '—', arquivos: [] }]

export const PLACEHOLDER_DATA: OnePageData = {
  user: { name: '—', role: 'Assessor', initials: '—' },
  posicaoEm: '—',
  custodia: { value: 0, deltaMes: 0, series90d: Array(25).fill(0) },
  clientes: { ativos: 0, inativos: 0, base: 0 },
  receita: { mes: 0, deltaMes: 0 },
  captacao: { bruta: 0, resgates: 0, liquida: 0, series: emptyMonths, topMovs: [] },
  faixas: emptyFaixas,
  produtos: emptyProdutos,
  materiais: emptyMateriais,
  topClientes: [],
}

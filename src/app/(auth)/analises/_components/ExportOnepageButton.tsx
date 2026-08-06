'use client'

import { useState } from 'react'

type Props = {
  assessorName: string
  dataRef: string | null
  /** ID do elemento DOM a capturar. Default: 'onepage-export-area'. */
  targetId?: string
}

/* ── Constantes de layout do PDF ─────────────────────────────────────────────
 * Página única, largura padrão de slide 16:9, altura calculada do conteúdo.
 */
const PAGE_W_MM = 338.67 // 13.333" — largura padrão de slide widescreen
const MARGIN_X_MM = 8
const MARGIN_TOP_MM = 8
const FOOTER_H_MM = 12
const CONTENT_W_MM = PAGE_W_MM - MARGIN_X_MM * 2

// Paleta Nobel operacional (para impressão)
const COLOR_PAPER = '#FAFAF7'
const COLOR_MUTED = '#5C5A4F'
const COLOR_DARK = '#25241F'
const COLOR_GOLD = '#C9A961'

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ]
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function dateStamp(iso: string | null): string {
  if (iso) {
    const d = new Date(iso)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
}

function fmtDateBR(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
}

type FooterInfo = {
  assessorName: string
  dateRef: string
  pageH: number
}

type PdfLike = {
  setDrawColor: (r: number, g: number, b: number) => void
  setFillColor: (r: number, g: number, b: number) => void
  setLineWidth: (w: number) => void
  line: (x1: number, y1: number, x2: number, y2: number) => void
  setFont: (family: string, style?: string) => void
  setFontSize: (size: number) => void
  setTextColor: (r: number, g: number, b: number) => void
  getTextWidth: (t: string) => number
  text: (t: string, x: number, y: number) => void
  rect: (x: number, y: number, w: number, h: number, style?: string) => void
}

function drawFooter(pdf: PdfLike, info: FooterInfo) {
  const yLine = info.pageH - FOOTER_H_MM + 2
  const yText = info.pageH - 4

  // Hairline dourado (regra Nobel: ouro entra 1× por bloco, aqui é o rodapé)
  const [gr, gg, gb] = rgb(COLOR_GOLD)
  pdf.setDrawColor(gr, gg, gb)
  pdf.setLineWidth(0.3)
  pdf.line(MARGIN_X_MM, yLine, PAGE_W_MM - MARGIN_X_MM, yLine)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)

  // Esquerda: NOBEL CAPITAL (muted, uppercase) · assessor (dark, bold)
  const [mr, mg, mb] = rgb(COLOR_MUTED)
  pdf.setTextColor(mr, mg, mb)
  pdf.text('NOBEL CAPITAL', MARGIN_X_MM, yText)
  const lockupW = pdf.getTextWidth('NOBEL CAPITAL')
  const [dr, dg, db] = rgb(COLOR_DARK)
  pdf.setTextColor(dr, dg, db)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`  ·  ${info.assessorName}`, MARGIN_X_MM + lockupW, yText)

  // Direita: data de referência em dourado
  if (info.dateRef) {
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(gr, gg, gb)
    const dateW = pdf.getTextWidth(info.dateRef)
    pdf.text(info.dateRef, PAGE_W_MM - MARGIN_X_MM - dateW, yText)
  }
}

export function ExportOnepageButton({
  assessorName,
  dataRef,
  targetId = 'onepage-export-area',
}: Props) {
  const [downloading, setDownloading] = useState(false)

  async function handleExport() {
    if (downloading) return
    const el = document.getElementById(targetId)
    if (!el) return

    setDownloading(true)

    // Esconde [data-noprint] durante a captura
    const hidden: { node: HTMLElement; prev: string }[] = []
    for (const node of Array.from(el.querySelectorAll<HTMLElement>('[data-noprint]'))) {
      hidden.push({ node, prev: node.style.visibility })
      node.style.visibility = 'hidden'
    }

    // Força tema light temporariamente (evita PDF escuro se assessor tá em dark)
    const html = document.documentElement
    const hadDark = html.classList.contains('dark')
    if (hadDark) html.classList.remove('dark')

    // Achata sombras dos cards e força fundo paper-white — rasterizam melhor
    const printStyle = document.createElement('style')
    const safeTarget = targetId.replace(/[^\w-]/g, '')
    printStyle.textContent = `
      #${safeTarget} *, #${safeTarget} *::before, #${safeTarget} *::after {
        box-shadow: none !important;
      }
      #${safeTarget} { background: ${COLOR_PAPER} !important; }
    `
    document.head.appendChild(printStyle)

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ])

      // Captura em alta resolução — usa a largura REAL do conteúdo (não da
      // janela), senão sobra espaço vazio à direita quando a viewport é wide.
      const captureWidth = el.scrollWidth + 24
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: COLOR_PAPER,
        windowWidth: captureWidth,
        width: captureWidth,
        logging: false,
      })

      // Página única: altura calculada da altura do canvas.
      const pxPerMm = canvas.width / CONTENT_W_MM
      const contentH_mm = canvas.height / pxPerMm
      const pageH_mm = MARGIN_TOP_MM + contentH_mm + FOOTER_H_MM

      const pdf = new jsPDF({
        unit: 'mm',
        format: [PAGE_W_MM, pageH_mm],
        orientation: 'portrait',
      })

      // Pinta fundo paper-white
      const [pr, pg, pb] = rgb(COLOR_PAPER)
      pdf.setFillColor(pr, pg, pb)
      pdf.rect(0, 0, PAGE_W_MM, pageH_mm, 'F')

      // Snapshot inteiro como uma imagem só
      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      pdf.addImage(imgData, 'JPEG', MARGIN_X_MM, MARGIN_TOP_MM, CONTENT_W_MM, contentH_mm)

      drawFooter(pdf as unknown as PdfLike, {
        assessorName,
        dateRef: fmtDateBR(dataRef),
        pageH: pageH_mm,
      })

      const nome = slugify(assessorName) || 'assessor'
      const dt = dateStamp(dataRef)
      pdf.save(`onepage_${nome}_${dt}.pdf`)
    } finally {
      document.head.removeChild(printStyle)
      if (hadDark) html.classList.add('dark')
      for (const { node, prev } of hidden) {
        node.style.visibility = prev
      }
      setDownloading(false)
    }
  }

  return (
    <button
      type="button"
      data-noprint
      onClick={handleExport}
      disabled={downloading}
      title="Exportar snapshot do Onepage em PDF"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 34,
        padding: '0 14px',
        borderRadius: 8,
        border: '1px solid var(--line-strong)',
        background: 'var(--bg-elev)',
        color: 'var(--fg)',
        fontFamily: 'var(--f-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        cursor: downloading ? 'wait' : 'pointer',
        opacity: downloading ? 0.6 : 1,
        transition: 'border-color .15s, background .15s',
      }}
      onMouseEnter={(e) => {
        if (downloading) return
        e.currentTarget.style.borderColor = 'var(--c-gold)'
        e.currentTarget.style.background = 'var(--bg)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line-strong)'
        e.currentTarget.style.background = 'var(--bg-elev)'
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        width="14"
        height="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {downloading ? 'Gerando PDF…' : 'Exportar PDF'}
    </button>
  )
}

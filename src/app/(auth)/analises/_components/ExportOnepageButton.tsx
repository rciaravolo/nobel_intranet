'use client'

import { useState } from 'react'

type Props = {
  assessorName: string
  dataRef: string | null
  /** ID do elemento DOM a capturar. Default: 'onepage-export-area'. */
  targetId?: string
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

    // Esconde qualquer elemento marcado com data-noprint durante a captura
    const hidden: { node: HTMLElement; prev: string }[] = []
    for (const node of Array.from(el.querySelectorAll<HTMLElement>('[data-noprint]'))) {
      hidden.push({ node, prev: node.style.visibility })
      node.style.visibility = 'hidden'
    }

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ])

      // Coleta breakpoints seguros ANTES da captura (posições em CSS px
      // relativas ao topo do elemento onde é seguro quebrar página).
      const elTop = el.getBoundingClientRect().top
      const rawBreakpoints = new Set<number>()
      const collect = (node: Element) => {
        const r = node.getBoundingClientRect()
        rawBreakpoints.add(Math.round(r.bottom - elTop))
      }
      for (const child of Array.from(el.children)) {
        collect(child)
        for (const gc of Array.from(child.children)) {
          collect(gc)
          for (const ggc of Array.from(gc.children)) {
            collect(ggc)
          }
        }
      }
      const breakpointsCssPx = Array.from(rawBreakpoints)
        .filter((v) => v > 0)
        .sort((a, b) => a - b)

      // Renderiza com buffer na largura para evitar corte lateral.
      const captureWidth = Math.max(el.scrollWidth, window.innerWidth) + 24
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: captureWidth,
        width: captureWidth,
        logging: false,
      })

      const canvasScale = canvas.width / captureWidth // canvas px por CSS px
      const breakpointsPx = breakpointsCssPx.map((v) => Math.round(v * canvasScale))

      // A4 landscape com margens estreitas
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
      const pageW = pdf.internal.pageSize.getWidth() // 297
      const pageH = pdf.internal.pageSize.getHeight() // 210
      const margin = 6
      const contentW = pageW - margin * 2
      const contentH = pageH - margin * 2

      const pxPerMm = canvas.width / contentW
      const pageHpx = contentH * pxPerMm

      // Fatia inteligentemente: para cada página, encontra o maior
      // breakpoint <= startPx + pageHpx (e > startPx + pageHpx * 0.55),
      // caindo pra corte reto quando não há breakpoint bom.
      // Se o remanescente após o corte for pequeno (< 15% de página),
      // absorve tudo na página atual pra evitar página final quase vazia.
      let startPx = 0
      let firstPage = true
      while (startPx < canvas.height) {
        const idealEndPx = startPx + pageHpx
        let endPx: number
        if (idealEndPx >= canvas.height) {
          endPx = canvas.height
        } else {
          const min = startPx + pageHpx * 0.55
          const valid = breakpointsPx.filter((bp) => bp > min && bp <= idealEndPx)
          endPx = valid.length > 0 ? Math.max(...valid) : Math.floor(idealEndPx)
          if (canvas.height - endPx < pageHpx * 0.15) {
            endPx = canvas.height
          }
        }
        const sliceHpx = endPx - startPx
        if (sliceHpx <= 0) break
        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = canvas.width
        sliceCanvas.height = sliceHpx
        const ctx = sliceCanvas.getContext('2d')
        if (!ctx) break
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, sliceHpx)
        ctx.drawImage(canvas, 0, startPx, canvas.width, sliceHpx, 0, 0, canvas.width, sliceHpx)
        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.94)
        const drawH = sliceHpx / pxPerMm
        if (!firstPage) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', margin, margin, contentW, drawH)
        firstPage = false
        startPx = endPx
      }

      const nome = slugify(assessorName) || 'assessor'
      const dt = dateStamp(dataRef)
      pdf.save(`onepage_${nome}_${dt}.pdf`)
    } finally {
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

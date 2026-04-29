'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import styles from './landing.module.css'

const MODULES = [
  {
    num: '01',
    name: 'Dashboard',
    desc: 'Visão consolidada de indicadores, metas e performance em tempo real.',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    num: '02',
    name: 'Captação',
    desc: 'Acompanhamento de captação líquida, metas mensais e ranking de assessores.',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    num: '03',
    name: 'Performance',
    desc: 'Métricas XPerformance, histórico de resultados e análise por período.',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    num: '04',
    name: 'Missões',
    desc: 'Desafios ativos, pontuação da equipe e programa de reconhecimento Nobel.',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
]

const DESTAQUES = [
  {
    num: 'R$ 2.4',
    sup: 'B',
    label: 'Atualizado — Mar 2026',
    text: 'Volume total sob gestão. Nobel Capital consolidou-se como uma das maiores escritórias XP do Brasil, com crescimento de 34% no último trimestre.',
  },
  {
    num: '48',
    sup: '+',
    label: 'Headcount — Mar 2026',
    text: 'Assessores ativos em expansão com 5 novas contratações previstas para Q2 2026.',
  },
  {
    num: '91',
    sup: '%',
    label: 'NPS — Q4 2025',
    text: 'Taxa de retenção de clientes. Índice acima da média nacional, reconhecido pelo prêmio Elite Partner 2025.',
  },
  {
    num: '12',
    sup: '×',
    label: 'Histórico — 2018–2026',
    text: 'Multiplicador de crescimento desde a fundação, sustentado por gestão orientada a dados.',
  },
]

const RECENTES = [
  {
    date: '17 Mar 2026',
    tag: 'Missões',
    title: 'Missão Q1 encerrada — confira os resultados e premiações',
  },
  {
    date: '14 Mar 2026',
    tag: 'Performance',
    title: 'Relatório XPerformance — Fevereiro 2026 disponível',
  },
  {
    date: '10 Mar 2026',
    tag: 'Captação',
    title: 'Novo recorde de captação líquida — R$ 180M em fevereiro',
  },
  {
    date: '05 Mar 2026',
    tag: 'Time',
    title: 'Bem-vindo ao time — 3 novos assessores iniciando em abril',
  },
  {
    date: '01 Mar 2026',
    tag: 'Comunicado',
    title: 'Calendário de reuniões gerenciais — Q2 2026 publicado',
  },
]

const ArrowRight = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const ArrowDiag = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
)

export default function Landing() {
  const rootRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const ruleRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    if (!root || !dot || !ring) return

    /* ── cursor ── */
    let mx = 0
    let my = 0
    let rx = 0
    let ry = 0
    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      dot.style.left = `${mx}px`
      dot.style.top = `${my}px`
    }
    document.addEventListener('mousemove', onMove)

    let rafId: number
    const tick = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      ring.style.left = `${rx}px`
      ring.style.top = `${ry}px`
      rafId = requestAnimationFrame(tick)
    }
    tick()

    const hoverTargets = root.querySelectorAll<HTMLElement>('a, button, [data-hover]')
    for (const el of hoverTargets) {
      el.addEventListener('mouseenter', () => root.classList.add(styles.rootHovering ?? ''))
      el.addEventListener('mouseleave', () => root.classList.remove(styles.rootHovering ?? ''))
    }

    /* ── nav scroll ── */
    const onScroll = () =>
      navRef.current?.classList.toggle(styles.navScrolled ?? '', window.scrollY > 60)
    window.addEventListener('scroll', onScroll)

    /* ── hero letter animation ── */
    const animLine = (
      el: HTMLSpanElement | null,
      text: string,
      delay: number,
      onDone?: () => void,
    ) => {
      if (!el) return
      el.innerHTML = ''
      const chars = text.split('').map((ch) => {
        const s = document.createElement('span')
        s.className = styles.char ?? ''
        s.textContent = ch === ' ' ? '\u00A0' : ch
        el.appendChild(s)
        return s
      })
      for (const [i, s] of chars.entries()) {
        setTimeout(
          () => {
            s.style.transform = 'translateY(0)'
            s.style.opacity = '1'
            if (i === chars.length - 1) onDone?.()
          },
          delay + i * 50,
        )
      }
    }

    setTimeout(() => {
      if (eyebrowRef.current) {
        eyebrowRef.current.style.opacity = '1'
        eyebrowRef.current.style.transform = 'translateY(0)'
      }
    }, 200)

    animLine(line1Ref.current, 'INTRA', 400, () => {
      animLine(line2Ref.current, 'NOBEL CAPITAL', 50, () => {
        setTimeout(() => {
          ruleRef.current?.classList.add(styles.ruleDrawn ?? '')
          setTimeout(() => {
            taglineRef.current?.classList.add(styles.visible ?? '')
            metaRef.current?.classList.add(styles.visible ?? '')
          }, 500)
        }, 150)
      })
    })

    /* ── scroll observer ── */
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          setTimeout(
            () => el.classList.add(styles.visible ?? ''),
            Number.parseInt(el.dataset.delay ?? '0'),
          )
          obs.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    const observables = root.querySelectorAll<HTMLElement>(
      `.${styles.sectionLabel},.${styles.sectionTitle},.${styles.moduleCard},.${styles.destaqueItem},.${styles.recenteItem}`,
    )
    for (const [i, el] of observables.entries()) {
      if (
        el.classList.contains(styles.moduleCard ?? '') ||
        el.classList.contains(styles.destaqueItem ?? '') ||
        el.classList.contains(styles.recenteItem ?? '')
      ) {
        el.dataset.delay = String((i % 4) * 100)
      }
      obs.observe(el)
    }

    return () => {
      document.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
      obs.disconnect()
    }
  }, [])

  return (
    <div ref={rootRef} className={styles.root}>
      {/* cursor — inside root so CSS module parent selector works */}
      <div ref={dotRef} className={styles.cursor} />
      <div ref={ringRef} className={styles.cursorRing} />

      {/* NAV */}
      <nav ref={navRef} className={styles.nav}>
        <Link href="/" className={styles.navLogo}>
          <div className={styles.navMark}>N</div>
          INTRA
        </Link>
        <ul className={styles.navLinks}>
          <li>
            <a href="#modulos">Dashboard</a>
          </li>
          <li>
            <a href="#modulos">Time</a>
          </li>
          <li>
            <a href="#recentes">Missões</a>
          </li>
          <li>
            <a href="#recentes">Relatórios</a>
          </li>
          <li>
            <Link href="/login" className={styles.navCta}>
              Entrar
            </Link>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGrid} />
        <div className={styles.heroScrollHint}>
          <div className={styles.heroScrollLine} />
          <span>Scroll</span>
        </div>
        <div className={styles.heroContent}>
          <p ref={eyebrowRef} className={styles.heroEyebrow}>
            Sistema Interno — Acesso Restrito
          </p>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine} ref={line1Ref} />
            <span className={styles.heroTitleLine} ref={line2Ref} />
          </h1>
          <div ref={ruleRef} className={styles.heroRule} />
          <p ref={taglineRef} className={styles.heroTagline}>
            O hub central da <strong>Nobel Capital</strong> &amp; XP Investimentos.
            <br />
            Acesse métricas, missões, equipe e relatórios em um só lugar.
          </p>
          <div ref={metaRef} className={styles.heroMeta}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>48</span>
              <span className={styles.heroStatLabel}>Assessores ativos</span>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>R$ 2.4B</span>
              <span className={styles.heroStatLabel}>AuM total</span>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>12</span>
              <span className={styles.heroStatLabel}>Módulos integrados</span>
            </div>
          </div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section id="modulos" className={styles.sectionDark}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Navegação</p>
            <h2 className={styles.sectionTitle}>
              Módulos <em>principais</em>
            </h2>
          </div>
          <Link href="/login" className={styles.sectionLink}>
            Ver todos <ArrowRight />
          </Link>
        </div>
        <div className={styles.modulesGrid}>
          {MODULES.map((m) => (
            <div key={m.num} className={styles.moduleCard} data-hover>
              <div className={styles.moduleThumb}>
                <div className={styles.moduleThumbInner}>{m.icon}</div>
              </div>
              <span className={styles.moduleNum}>{m.num}</span>
              <h3 className={styles.moduleName}>{m.name}</h3>
              <p className={styles.moduleDesc}>{m.desc}</p>
              <div className={styles.moduleArrow}>
                Acessar <ArrowRight />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DESTAQUES */}
      <section id="destaques" className={styles.sectionBase}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Números Nobel</p>
            <h2 className={styles.sectionTitle}>
              Resultados <em>que falam</em>
            </h2>
          </div>
        </div>
        <div className={styles.destaqueGrid}>
          {DESTAQUES.map((d) => (
            <div key={d.num} className={styles.destaqueItem}>
              <div className={styles.destaqueBigNum}>
                {d.num}
                <sup>{d.sup}</sup>
              </div>
              <div className={styles.destaqueRule} />
              <p className={styles.destaqueText}>{d.text}</p>
              <span className={styles.destaqueCaption}>{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* RECENTES */}
      <section id="recentes" className={styles.sectionMid}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Feed interno</p>
            <h2 className={styles.sectionTitle}>Recentes</h2>
          </div>
          <Link href="/login" className={styles.sectionLink}>
            Ver arquivo <ArrowRight />
          </Link>
        </div>
        <div className={styles.recenteList}>
          {RECENTES.map((r) => (
            <div key={r.title} className={styles.recenteItem} data-hover>
              <span className={styles.recenteDate}>{r.date}</span>
              <div className={styles.recenteContent}>
                <span className={styles.recenteTag}>{r.tag}</span>
                <span className={styles.recenteTitle}>{r.title}</span>
              </div>
              <div className={styles.recenteArrow}>
                <ArrowDiag />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span className={styles.footerWordmark}>Nobel Capital</span>
        <div className={styles.footerCenter}>
          <div className={styles.footerMark}>N</div>
          <span className={styles.footerCopy}>© 2026 — Sistema Interno INTRA</span>
        </div>
        <ul className={styles.footerLinks}>
          <li>
            <Link href="/login">Suporte</Link>
          </li>
          <li>
            <Link href="/login">Privacidade</Link>
          </li>
          <li>
            <Link href="/login">Acesso</Link>
          </li>
        </ul>
      </footer>
    </div>
  )
}

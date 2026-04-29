'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const errors: typeof fieldErrors = {}
    if (!username.trim()) errors.username = 'Informe seu username'
    if (!password) errors.password = 'Informe sua senha'
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao fazer login')
        setPassword('')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shell">
      {/* ── LEFT — editorial brand panel ─────────────────────── */}
      <div className="left">
        {/* Subtle gold radial */}
        <div className="left-bg" />

        {/* Nobel lockup */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-lockup.png" alt="Nobel Capital" className="lockup-img" />

        {/* Display headline */}
        <h1 className="headline">
          Sistema interno
          <br />
          <em className="headline-em">INTRA</em>
        </h1>

        {/* Hairline rule */}
        <div className="rule" />

        {/* Tagline */}
        <p className="tagline">Permanência · Rigor · Clareza</p>

        {/* Bottom meta */}
        <div className="left-meta">
          <span>Nobel Capital &amp; XP Investimentos</span>
          <span>Acesso restrito · colaboradores</span>
        </div>
      </div>

      {/* ── RIGHT — form panel ───────────────────────────────── */}
      <div className="right">
        {/* Subtle grid texture */}
        <div className="right-grid" />

        <div className="card">
          {/* Gold top accent line */}
          <div className="card-accent" />

          <p className="eyebrow">Acesso restrito</p>
          <h2 className="card-title">Entre na sua conta</h2>

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="field">
              <label htmlFor="username">Username</label>
              <div className="input-wrap">
                <input
                  id="username"
                  type="text"
                  placeholder="seu.nome"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setFieldErrors((p) => {
                      const { username: _, ...r } = p
                      return r
                    })
                  }}
                  data-error={!!fieldErrors.username}
                />
              </div>
              {fieldErrors.username && <p className="error-msg">{fieldErrors.username}</p>}
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="password">Senha</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setFieldErrors((p) => {
                      const { password: _, ...r } = p
                      return r
                    })
                  }}
                  data-error={!!fieldErrors.password}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPw ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && <p className="error-msg">{fieldErrors.password}</p>}
            </div>

            {/* Global error */}
            {error && (
              <div className="global-error" role="alert">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Entrar →'}
            </button>
          </form>

          <div className="card-footer">
            Acesso disponível apenas para colaboradores
            <br />
            <strong>Nobel Capital &amp; XP Investimentos</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ── Shell ─────────────────────────────────────────── */
        .shell {
          display: flex;
          min-height: 100vh;
          font-family: var(--f-text);
          background: var(--bg);
          color: var(--fg);
        }

        /* ── LEFT ──────────────────────────────────────────── */
        .left {
          width: 520px;
          flex-shrink: 0;
          /* P-04 cross-hatch gold — breathing texture for the brand panel */
          background-color: var(--bg);
          background-image:
            repeating-linear-gradient(45deg, rgba(184, 150, 62, 0.055) 0, rgba(184, 150, 62, 0.055) 1px, transparent 0, transparent 50%),
            repeating-linear-gradient(-45deg, rgba(184, 150, 62, 0.055) 0, rgba(184, 150, 62, 0.055) 1px, transparent 0, transparent 50%);
          background-size: 18px 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 72px 80px;
          position: relative;
          border-right: 1px solid var(--line);
          overflow: hidden;
        }

        .left-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 50% at 20% 65%, color-mix(in oklch, var(--c-gold) 10%, transparent) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Nobel lockup */
        .lockup-img {
          height: 52px;
          width: auto;
          margin-bottom: 60px;
          position: relative;
          z-index: 1;
          display: block;
        }

        /* Display headline */
        .headline {
          font-family: var(--f-display);
          font-size: 52px;
          font-weight: 300;
          color: var(--fg);
          line-height: 1.05;
          letter-spacing: -.01em;
          position: relative;
          z-index: 1;
          margin: 0;
        }

        .headline-em {
          font-style: italic;
          color: var(--c-gold-deep);
          font-weight: 400;
        }

        .rule {
          width: 40px;
          height: 1px;
          background: var(--c-gold);
          margin: 32px 0 16px;
          position: relative;
          z-index: 1;
        }

        .tagline {
          font-family: var(--f-mono);
          font-size: 10px;
          font-weight: 400;
          color: var(--fg-faint);
          letter-spacing: .14em;
          text-transform: uppercase;
          line-height: 1.7;
          position: relative;
          z-index: 1;
        }

        .left-meta {
          position: absolute;
          bottom: 32px;
          left: 80px;
          right: 80px;
          display: flex;
          justify-content: space-between;
          font-family: var(--f-mono);
          font-size: 9px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--fg-faint);
          z-index: 1;
        }

        /* ── RIGHT ─────────────────────────────────────────── */
        .right {
          flex: 1;
          background: var(--bg-deep);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .right-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--line) 1px, transparent 1px),
            linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size: 52px 52px;
          pointer-events: none;
        }

        /* ── Card ──────────────────────────────────────────── */
        .card {
          width: 440px;
          background: var(--bg-elev);
          border: 1px solid var(--line);
          padding: 48px;
          position: relative;
          z-index: 1;
        }

        .card-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--c-gold), var(--c-gold-soft), transparent);
        }

        .eyebrow {
          font-family: var(--f-mono);
          font-size: 9px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--c-gold-deep);
          font-weight: 500;
          margin-bottom: 8px;
        }

        .card-title {
          font-family: var(--f-display);
          font-size: 24px;
          font-weight: 400;
          color: var(--fg);
          margin-bottom: 36px;
          line-height: 1.2;
        }

        /* ── Fields ────────────────────────────────────────── */
        .field { margin-bottom: 22px; }

        .field label {
          display: block;
          font-family: var(--f-mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--fg-mute);
          margin-bottom: 8px;
        }

        .input-wrap { position: relative; }

        .input-wrap input {
          width: 100%;
          height: 46px;
          background: var(--bg);
          border: 1px solid var(--line-strong);
          padding: 0 14px;
          font-family: var(--f-text);
          font-size: 14px;
          color: var(--fg);
          outline: none;
          transition: border-color .18s, box-shadow .18s;
          border-radius: var(--r-1);
          -webkit-appearance: none;
        }

        .input-wrap input::placeholder { color: var(--fg-faint); }

        .input-wrap input:focus {
          border-color: var(--c-gold);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--c-gold) 12%, transparent);
        }

        .input-wrap input[data-error='true'] {
          border-color: var(--c-negative);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--c-negative) 10%, transparent);
        }

        .toggle-pw {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--fg-faint);
          padding: 4px;
          transition: color .15s;
          display: flex;
          align-items: center;
        }

        .toggle-pw:hover { color: var(--c-gold-deep); }
        .toggle-pw svg { width: 14px; height: 14px; display: block; }

        .error-msg {
          font-family: var(--f-mono);
          font-size: 10px;
          color: var(--c-negative);
          margin-top: 5px;
          letter-spacing: .04em;
        }

        .global-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: color-mix(in oklch, var(--c-negative) 8%, transparent);
          border: 1px solid color-mix(in oklch, var(--c-negative) 30%, transparent);
          padding: 10px 14px;
          font-family: var(--f-text);
          font-size: 13px;
          color: var(--c-negative);
          margin-top: 4px;
          margin-bottom: 4px;
          border-radius: var(--r-1);
        }

        .global-error svg { width: 14px; height: 14px; flex-shrink: 0; }

        /* ── Buttons ───────────────────────────────────────── */
        .btn-submit {
          width: 100%;
          height: 48px;
          background: var(--fg);
          border: none;
          font-family: var(--f-text);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: .10em;
          text-transform: uppercase;
          color: var(--bg-elev);
          cursor: pointer;
          margin-top: 28px;
          margin-bottom: 10px;
          transition: background .2s, transform .15s, box-shadow .2s;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--r-1);
        }

        .btn-submit:hover:not(:disabled) {
          background: var(--c-gold-deep);
          color: #1a1408;
          transform: translateY(-1px);
          box-shadow: var(--e-2);
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 1.5px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Footer ────────────────────────────────────────── */
        .card-footer {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--line);
          text-align: center;
          font-family: var(--f-mono);
          font-size: 10px;
          color: var(--fg-faint);
          line-height: 1.8;
          letter-spacing: .04em;
        }

        .card-footer strong {
          color: var(--fg-mute);
          font-weight: 500;
        }

        /* ── Responsive ────────────────────────────────────── */
        @media (max-width: 900px) {
          .shell { flex-direction: column; }
          .left  { width: 100%; min-height: 40vh; padding: 48px; }
          .left-meta { display: none; }
          .headline { font-size: 36px; }
        }

        @media (max-width: 520px) {
          .right { padding: 24px; align-items: flex-start; padding-top: 40px; }
          .card  { width: 100%; padding: 32px 24px; }
          .left  { padding: 32px 24px; }
        }
      `}</style>
    </div>
  )
}

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
      {/* ── LEFT ─────────────────────────────────────────────── */}
      <div className="left">
        <div className="left-glow" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="logo-wrap">
          <img src="/logo-lockup-ivory.png" alt="Nobel Capital" />
        </div>

        <h1 className="headline">
          INTRA
          <br />
          NOBEL
        </h1>

        <div className="rule" />
        <p className="tagline">Sistema interno — Nobel Capital</p>
      </div>

      {/* ── RIGHT ────────────────────────────────────────────── */}
      <div className="right">
        <div className="right-grid" />

        <div className="card">
          <div className="card-top-line" />

          <p className="card-eyebrow">Acesso restrito</p>
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
                  className={fieldErrors.username ? 'error' : ''}
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
                  className={fieldErrors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPw ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && <p className="error-msg">{fieldErrors.password}</p>}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              <span className="btn-inner">
                {loading ? <span className="spinner" /> : <span>Entrar</span>}
              </span>
            </button>

            <button type="button" className="btn-forgot">
              Esqueci minha senha
            </button>
          </form>

          <div className="card-footer">
            Acesso disponível apenas para colaboradores
            <br />
            <strong>Nobel Capital &amp; XP Investimentos</strong>
          </div>
        </div>
      </div>

      {/* Toast de erro */}
      {error && (
        <div className="toast" role="alert">
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
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        /* ── Tokens ─────────────────────────────────────────── */
        .shell {
          --bg-left:       #1A1209;
          --bg-right:      #231A0D;
          --card-bg:       #2E2010;
          --card-border:   #4A3520;
          --input-bg:      #1A1209;
          --gold-from:     #D4A96A;
          --gold-to:       #B8963E;
          --gold-shadow:   rgba(212,169,106,0.3);
          --gold-text:     #C9A87C;
          --gold-rule:     #D4A96A;
          --cream:         #F5ECD7;
          --btn-text:      #1A1209;
          --error:         #e74c3c;
          --font-lora:     var(--font-lora, 'Georgia', serif);
        }

        /* ── Shell ──────────────────────────────────────────── */
        .shell {
          display: flex;
          width: 100%;
          min-height: 100vh;
          font-family: 'Geist', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          background: var(--bg-left);
        }

        /* ── LEFT ───────────────────────────────────────────── */
        .left {
          width: 695px;
          flex-shrink: 0;
          background: var(--bg-left);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
          gap: 16px;
          position: relative;
        }

        .left-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 50% at 30% 50%, rgba(212,169,106,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .logo-wrap {
          margin-bottom: 32px;
          position: relative;
          z-index: 1;
        }

        .logo-wrap img {
          height: 94px;
          width: auto;
          display: block;
          margin: 0 auto;
        }

        .headline {
          font-family: var(--font-lora, 'Georgia', serif);
          font-size: 52px;
          font-weight: 700;
          color: var(--cream);
          line-height: 1.15;
          margin-bottom: 32px;
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .rule {
          width: 48px;
          height: 2px;
          background: var(--gold-rule);
          margin-bottom: 16px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
          z-index: 1;
        }

        .tagline {
          font-size: 14px;
          color: var(--gold-text);
          font-weight: 400;
          opacity: 0.8;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 1;
          text-align: center;
        }

        /* ── RIGHT ──────────────────────────────────────────── */
        .right {
          flex: 1;
          background: var(--bg-right);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .right-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(212,169,106,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,169,106,0.08) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* ── Card ───────────────────────────────────────────── */
        .card {
          width: 480px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 56px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
          position: relative;
          z-index: 1;
        }

        .card-top-line {
          position: absolute;
          top: 0; left: 48px; right: 48px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold-rule), transparent);
          opacity: 0.6;
        }

        .card-eyebrow {
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold-text);
          font-weight: 600;
          margin-bottom: 8px;
          opacity: 0.7;
        }

        .card-title {
          font-family: var(--font-lora, 'Georgia', serif);
          font-size: 24px;
          font-weight: 700;
          color: var(--cream);
          margin-bottom: 36px;
          line-height: 1.2;
        }

        /* ── Fields ─────────────────────────────────────────── */
        .field { margin-bottom: 20px; }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--gold-text);
          margin-bottom: 8px;
          letter-spacing: 0.01em;
        }

        .input-wrap { position: relative; }

        .input-wrap input {
          width: 100%;
          height: 52px;
          background: var(--input-bg);
          border: 1.5px solid var(--card-border);
          border-radius: 10px;
          padding: 0 16px;
          font-size: 14px;
          color: var(--cream);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }

        .input-wrap input::placeholder { color: rgba(201,168,124,0.35); }

        .input-wrap input:focus {
          border-color: var(--gold-from);
          box-shadow: 0 0 0 3px rgba(212,169,106,0.1);
        }

        .input-wrap input.error {
          border-color: #c0392b;
          box-shadow: 0 0 0 3px rgba(192,57,43,0.1);
        }

        .toggle-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--gold-text);
          opacity: 0.5;
          padding: 4px;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
        }

        .toggle-pw:hover { opacity: 1; }

        .toggle-pw svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.5;
          display: block;
        }

        .error-msg {
          font-size: 12px;
          color: var(--error);
          margin-top: 6px;
        }

        /* ── Buttons ────────────────────────────────────────── */
        .btn-submit {
          width: 100%;
          height: 56px;
          background: linear-gradient(135deg, var(--gold-from) 0%, var(--gold-to) 100%);
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--btn-text);
          cursor: pointer;
          margin-top: 28px;
          margin-bottom: 12px;
          box-shadow: 0 8px 24px var(--gold-shadow);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }

        .btn-submit::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          border-radius: inherit;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(212,169,106,0.4);
        }

        .btn-submit:active { transform: translateY(0); }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-forgot {
          width: 100%;
          height: 52px;
          background: transparent;
          border: 1.5px solid var(--card-border);
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: var(--gold-text);
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }

        .btn-forgot:hover {
          border-color: var(--gold-text);
          background: rgba(212,169,106,0.05);
        }

        /* ── Spinner ────────────────────────────────────────── */
        .spinner {
          display: block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(26,18,9,0.3);
          border-top-color: var(--btn-text);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Footer ─────────────────────────────────────────── */
        .card-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(74,53,32,0.5);
          text-align: center;
          font-size: 12px;
          color: rgba(201,168,124,0.4);
          letter-spacing: 0.03em;
        }

        .card-footer strong {
          color: rgba(201,168,124,0.6);
          font-weight: 500;
        }

        /* ── Toast ──────────────────────────────────────────── */
        .toast {
          position: fixed;
          bottom: 32px;
          right: 32px;
          background: #1a0a0a;
          border: 1px solid rgba(231,76,60,0.4);
          color: #e74c3c;
          padding: 14px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          animation: slideUp 0.3s ease;
          z-index: 999;
        }

        .toast svg { width: 16px; height: 16px; flex-shrink: 0; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ─────────────────────────────────────── */
        @media (max-width: 900px) {
          .shell { flex-direction: column; }
          .left  { width: 100%; padding: 48px; }
          .headline { font-size: 36px; }
        }

        @media (max-width: 520px) {
          .right { padding: 24px; align-items: flex-start; padding-top: 40px; }
          .card  { width: 100%; padding: 32px 24px; border-radius: 12px; }
          .left  { padding: 32px 24px; }
        }
      `}</style>
    </div>
  )
}

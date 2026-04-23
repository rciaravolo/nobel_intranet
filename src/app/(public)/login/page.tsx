'use client'

import Image from 'next/image'
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
      {/* LEFT */}
      <div className="left">
        <div className="logo-wrap">
          <Image
            src="/logo-light.png"
            alt="Nobel Capital"
            width={240}
            height={46}
            priority
            style={{ height: 46, width: 'auto' }}
          />
        </div>

        <h1 className="headline">
          INTRA
          <br />
          NOBEL
        </h1>

        <div className="rule" />
        <p className="tagline">Sistema interno — Nobel Capital &amp; XP Investimentos</p>
      </div>

      {/* RIGHT */}
      <div className="right">
        <div className="card">
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
                    setFieldErrors((p) => { const { username: _, ...rest } = p; return rest })
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
                    setFieldErrors((p) => { const { password: _, ...rest } = p; return rest })
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Entrar'}
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

      <style jsx>{`
        .shell {
          display: flex;
          min-height: 100vh;
          font-family: var(--font-geist), 'Geist', system-ui, sans-serif;
          background: #F6F3ED;
        }

        /* LEFT — editorial brand panel */
        .left {
          width: 600px;
          flex-shrink: 0;
          background: #F6F3ED;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
          gap: 0;
          position: relative;
          border-right: 1px solid rgba(184,150,62,0.15);
        }

        .left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 55% at 20% 60%, rgba(184,150,62,0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        .logo-wrap {
          margin-bottom: 56px;
          position: relative;
          z-index: 1;
        }

        .headline {
          font-family: 'Lora', serif;
          font-size: 64px;
          font-weight: 700;
          color: #1A1209;
          line-height: 0.95;
          letter-spacing: -0.025em;
          position: relative;
          z-index: 1;
        }

        .rule {
          width: 48px;
          height: 1px;
          background: #B8963E;
          margin-top: 40px;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .tagline {
          font-size: 13px;
          font-weight: 300;
          color: rgba(26,18,9,0.45);
          letter-spacing: 0.04em;
          line-height: 1.7;
          position: relative;
          z-index: 1;
        }

        /* RIGHT — form panel */
        .right {
          flex: 1;
          background: #FDFAF5;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(184,150,62,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,150,62,0.05) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
        }

        /* CARD */
        .card {
          width: 460px;
          background: #FFFFFF;
          border: 1px solid rgba(184,150,62,0.18);
          border-radius: 4px;
          padding: 52px;
          box-shadow: 0 4px 40px rgba(26,18,9,0.07), 0 1px 4px rgba(26,18,9,0.04);
          position: relative;
          z-index: 1;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 40px; right: 40px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #B8963E, transparent);
          opacity: 0.7;
        }

        .card-eyebrow {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #B8963E;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .card-title {
          font-family: 'Lora', serif;
          font-size: 22px;
          font-weight: 600;
          color: #1A1209;
          margin-bottom: 36px;
          letter-spacing: -0.01em;
        }

        /* FIELDS */
        .field { margin-bottom: 20px; }

        .field label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(26,18,9,0.45);
          margin-bottom: 8px;
        }

        .input-wrap { position: relative; }

        .input-wrap input {
          width: 100%;
          height: 50px;
          background: #F6F3ED;
          border: 1.5px solid rgba(184,150,62,0.22);
          border-radius: 4px;
          padding: 0 16px;
          font-family: var(--font-geist), 'Geist', system-ui, sans-serif;
          font-size: 14px;
          color: #1A1209;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
        }

        .input-wrap input::placeholder { color: rgba(26,18,9,0.25); }

        .input-wrap input:focus {
          background: #FFFFFF;
          border-color: #B8963E;
          box-shadow: 0 0 0 3px rgba(184,150,62,0.1);
        }

        .input-wrap input[data-error='true'] {
          border-color: #c0392b;
          box-shadow: 0 0 0 3px rgba(192,57,43,0.08);
        }

        .toggle-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(26,18,9,0.3);
          padding: 4px;
          transition: color 0.15s;
          display: flex;
          align-items: center;
        }

        .toggle-pw:hover { color: #B8963E; }
        .toggle-pw svg { width: 15px; height: 15px; display: block; }

        .error-msg {
          font-size: 11px;
          color: #c0392b;
          margin-top: 5px;
          letter-spacing: 0.01em;
        }

        .global-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(192,57,43,0.05);
          border: 1px solid rgba(192,57,43,0.2);
          border-radius: 4px;
          padding: 12px 14px;
          font-size: 13px;
          color: #c0392b;
          margin-top: 4px;
          margin-bottom: 4px;
        }

        .global-error svg { width: 15px; height: 15px; flex-shrink: 0; }

        /* BUTTONS */
        .btn-submit {
          width: 100%;
          height: 52px;
          background: #1A1209;
          border: none;
          border-radius: 4px;
          font-family: var(--font-geist), 'Geist', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #F6F3ED;
          cursor: pointer;
          margin-top: 28px;
          margin-bottom: 10px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-submit:hover:not(:disabled) {
          background: #B8963E;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(184,150,62,0.25);
        }

        .btn-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(246,243,237,0.3);
          border-top-color: #F6F3ED;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .btn-forgot {
          width: 100%;
          height: 48px;
          background: transparent;
          border: 1.5px solid rgba(184,150,62,0.22);
          border-radius: 4px;
          font-family: var(--font-geist), 'Geist', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.06em;
          color: rgba(26,18,9,0.45);
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }

        .btn-forgot:hover {
          border-color: #B8963E;
          color: #B8963E;
        }

        .card-footer {
          margin-top: 32px;
          padding-top: 22px;
          border-top: 1px solid rgba(184,150,62,0.14);
          text-align: center;
          font-size: 11px;
          color: rgba(26,18,9,0.3);
          line-height: 1.7;
        }

        .card-footer strong {
          color: rgba(26,18,9,0.5);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

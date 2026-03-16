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
            src="/logo-dark.png"
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
                    setFieldErrors((p) => ({ ...p, username: undefined }))
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
                    setFieldErrors((p) => ({ ...p, password: undefined }))
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
          font-family: 'Geist', system-ui, sans-serif;
          background: #1a1209;
        }

        /* LEFT */
        .left {
          width: 695px;
          flex-shrink: 0;
          background: #1a1209;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
          gap: 16px;
          position: relative;
        }

        .left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 50% at 30% 50%, rgba(212,169,106,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .logo-wrap { margin-bottom: 8px; position: relative; z-index: 1; }

        .headline {
          font-family: 'Lora', serif;
          font-size: 52px;
          font-weight: 700;
          color: #f5ecd7;
          line-height: 1.15;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .rule {
          width: 48px;
          height: 2px;
          background: #d4a96a;
          margin-top: 48px;
          position: relative;
          z-index: 1;
        }

        .tagline {
          font-size: 14px;
          color: #c9a87c;
          opacity: 0.8;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 1;
        }

        /* RIGHT */
        .right {
          flex: 1;
          background: #231a0d;
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
            linear-gradient(rgba(212,169,106,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,169,106,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* CARD */
        .card {
          width: 480px;
          background: #2e2010;
          border: 1px solid #4a3520;
          border-radius: 20px;
          padding: 56px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
          position: relative;
          z-index: 1;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 48px; right: 48px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #d4a96a, transparent);
          opacity: 0.6;
        }

        .card-eyebrow {
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c9a87c;
          font-weight: 600;
          margin-bottom: 8px;
          opacity: 0.7;
        }

        .card-title {
          font-family: 'Lora', serif;
          font-size: 24px;
          font-weight: 700;
          color: #f5ecd7;
          margin-bottom: 36px;
        }

        /* FIELD */
        .field { margin-bottom: 20px; }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #c9a87c;
          margin-bottom: 8px;
        }

        .input-wrap { position: relative; }

        .input-wrap input {
          width: 100%;
          height: 52px;
          background: #1a1209;
          border: 1.5px solid #4a3520;
          border-radius: 10px;
          padding: 0 16px;
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 14px;
          color: #f5ecd7;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }

        .input-wrap input::placeholder { color: rgba(201,168,124,0.35); }

        .input-wrap input:focus {
          border-color: #d4a96a;
          box-shadow: 0 0 0 3px rgba(212,169,106,0.1);
        }

        .input-wrap input[data-error='true'] {
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
          color: #c9a87c;
          opacity: 0.5;
          padding: 4px;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
        }

        .toggle-pw:hover { opacity: 1; }
        .toggle-pw svg { width: 16px; height: 16px; display: block; }

        .error-msg {
          font-size: 12px;
          color: #e74c3c;
          margin-top: 6px;
        }

        .global-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(192,57,43,0.1);
          border: 1px solid rgba(192,57,43,0.3);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: #e74c3c;
          margin-top: 4px;
          margin-bottom: 4px;
        }

        .global-error svg { width: 16px; height: 16px; flex-shrink: 0; }

        /* BUTTONS */
        .btn-submit {
          width: 100%;
          height: 56px;
          background: linear-gradient(135deg, #d4a96a 0%, #b8963e 100%);
          border: none;
          border-radius: 12px;
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #1a1209;
          cursor: pointer;
          margin-top: 28px;
          margin-bottom: 12px;
          box-shadow: 0 8px 24px rgba(212,169,106,0.3);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(212,169,106,0.4);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(26,18,9,0.3);
          border-top-color: #1a1209;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .btn-forgot {
          width: 100%;
          height: 52px;
          background: transparent;
          border: 1.5px solid #4a3520;
          border-radius: 12px;
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #c9a87c;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-forgot:hover {
          border-color: #c9a87c;
          background: rgba(212,169,106,0.05);
        }

        .card-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(74,53,32,0.5);
          text-align: center;
          font-size: 12px;
          color: rgba(201,168,124,0.4);
          line-height: 1.6;
        }

        .card-footer strong {
          color: rgba(201,168,124,0.6);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

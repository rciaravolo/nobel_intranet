'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function NovaSenhaForm({ token }: { token: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tokenMissing = !token
  const passwordTooShort = password.length > 0 && password.length < 8
  const mismatch = confirm.length > 0 && confirm !== password

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (tokenMissing) {
      setError('Link inválido. Solicite uma nova redefinição.')
      return
    }
    if (password.length < 8) {
      setError('A senha precisa ter no mínimo 8 caracteres')
      return
    }
    if (password !== confirm) {
      setError('As senhas não conferem')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível redefinir a senha')
        return
      }
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shell">
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

      <div className="right">
        <div className="right-grid" />

        <div className="card">
          <div className="card-top-line" />

          <p className="card-eyebrow">Recuperação de acesso</p>
          <h2 className="card-title">Definir nova senha</h2>

          {done ? (
            <div className="success">
              <p>Senha redefinida com sucesso. Redirecionando para o login…</p>
            </div>
          ) : tokenMissing ? (
            <div className="warn">
              <p>Link inválido ou expirado. Solicite uma nova redefinição de senha.</p>
              <Link href="/esqueci-senha" className="btn-back">
                Solicitar novo link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="hint">
                Escolha uma nova senha com <strong>no mínimo 8 caracteres</strong>. Você usará esta
                senha para entrar na INTRA a partir de agora.
              </p>

              <div className="field">
                <label htmlFor="password">Nova senha</label>
                <div className="input-wrap">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    className={passwordTooShort ? 'error' : ''}
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
                {passwordTooShort && <p className="error-msg">Mínimo de 8 caracteres</p>}
              </div>

              <div className="field">
                <label htmlFor="confirm">Confirmar senha</label>
                <div className="input-wrap">
                  <input
                    id="confirm"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value)
                      setError(null)
                    }}
                    className={mismatch ? 'error' : ''}
                  />
                </div>
                {mismatch && <p className="error-msg">As senhas não conferem</p>}
              </div>

              {error && <p className="error-msg global-error">{error}</p>}

              <button type="submit" className="btn-submit" disabled={loading}>
                <span className="btn-inner">
                  {loading ? <span className="spinner" /> : <span>Redefinir senha</span>}
                </span>
              </button>

              <Link href="/login" className="btn-back">
                Voltar para o login
              </Link>
            </form>
          )}

          <div className="card-footer">
            Acesso disponível apenas para colaboradores
            <br />
            <strong>Nobel Capital &amp; XP Investimentos</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        .shell {
          --bg-left: #1a1209;
          --bg-right: #231a0d;
          --card-bg: #2e2010;
          --card-border: #4a3520;
          --input-bg: #1a1209;
          --gold-from: #d4a96a;
          --gold-to: #b8963e;
          --gold-shadow: rgba(212, 169, 106, 0.3);
          --gold-text: #c9a87c;
          --cream: #f5ecd7;
          --btn-text: #1a1209;
          --error: #e74c3c;
        }

        .shell {
          display: flex;
          width: 100%;
          min-height: 100vh;
          font-family: 'Geist', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          background: var(--bg-left);
        }

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
          background: radial-gradient(
            ellipse 60% 50% at 30% 50%,
            rgba(212, 169, 106, 0.06) 0%,
            transparent 70%
          );
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
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .rule {
          width: 48px;
          height: 2px;
          background: var(--gold-from);
          margin: 0 auto 16px;
          position: relative;
          z-index: 1;
        }

        .tagline {
          font-size: 14px;
          color: var(--gold-text);
          opacity: 0.8;
          letter-spacing: 0.02em;
          text-align: center;
          position: relative;
          z-index: 1;
        }

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
          background-image: linear-gradient(rgba(212, 169, 106, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 169, 106, 0.08) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .card {
          width: 480px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 56px;
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5);
          position: relative;
          z-index: 1;
        }

        .card-top-line {
          position: absolute;
          top: 0;
          left: 48px;
          right: 48px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold-from), transparent);
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
          margin-bottom: 24px;
          line-height: 1.2;
        }

        .hint {
          color: rgba(201, 168, 124, 0.7);
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .hint strong {
          color: var(--gold-text);
          font-weight: 600;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--gold-text);
          margin-bottom: 8px;
          letter-spacing: 0.01em;
        }

        .input-wrap {
          position: relative;
        }

        input {
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

        input::placeholder {
          color: rgba(201, 168, 124, 0.35);
        }

        input:focus {
          border-color: var(--gold-from);
          box-shadow: 0 0 0 3px rgba(212, 169, 106, 0.1);
        }

        input.error {
          border-color: #c0392b;
          box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.1);
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

        .toggle-pw:hover {
          opacity: 1;
        }

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

        .error-msg.global-error {
          margin-top: 12px;
          margin-bottom: 12px;
        }

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
          margin-top: 8px;
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
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 60%);
          border-radius: inherit;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(212, 169, 106, 0.4);
        }

        .btn-submit:active {
          transform: translateY(0);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          display: block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(26, 18, 9, 0.3);
          border-top-color: var(--btn-text);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .btn-back {
          display: block;
          text-align: center;
          padding: 14px;
          font-size: 14px;
          color: var(--gold-text);
          text-decoration: none;
          border: 1.5px solid var(--card-border);
          border-radius: 12px;
          transition: border-color 0.2s, background 0.2s;
        }

        .btn-back:hover {
          border-color: var(--gold-text);
          background: rgba(212, 169, 106, 0.05);
        }

        .success p,
        .warn p {
          color: var(--cream);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 24px;
          padding: 16px 18px;
          background: rgba(212, 169, 106, 0.08);
          border: 1px solid rgba(212, 169, 106, 0.2);
          border-radius: 10px;
        }

        .warn p {
          background: rgba(231, 76, 60, 0.08);
          border-color: rgba(231, 76, 60, 0.3);
        }

        .card-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(74, 53, 32, 0.5);
          text-align: center;
          font-size: 12px;
          color: rgba(201, 168, 124, 0.4);
          letter-spacing: 0.03em;
        }

        .card-footer strong {
          color: rgba(201, 168, 124, 0.6);
          font-weight: 500;
        }

        @media (max-width: 900px) {
          .shell {
            flex-direction: column;
          }
          .left {
            width: 100%;
            padding: 48px;
          }
          .headline {
            font-size: 36px;
          }
        }

        @media (max-width: 520px) {
          .right {
            padding: 24px;
            align-items: flex-start;
            padding-top: 40px;
          }
          .card {
            width: 100%;
            padding: 32px 24px;
            border-radius: 12px;
          }
          .left {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  )
}

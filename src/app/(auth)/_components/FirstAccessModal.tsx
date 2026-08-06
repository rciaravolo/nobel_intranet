'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  userName: string
}

export function FirstAccessModal({ userName }: Props) {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tooShort = newPassword.length > 0 && newPassword.length < 8
  const mismatch = confirm.length > 0 && confirm !== newPassword
  const sameAsOld = newPassword.length > 0 && newPassword === currentPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!currentPassword) {
      setError('Informe a senha atual')
      return
    }
    if (newPassword.length < 8) {
      setError('A nova senha precisa ter no mínimo 8 caracteres')
      return
    }
    if (newPassword === currentPassword) {
      setError('A nova senha precisa ser diferente da atual')
      return
    }
    if (newPassword !== confirm) {
      setError('As senhas não conferem')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível trocar a senha')
        return
      }
      // Sucesso — recarrega o layout pra pegar a sessão nova (sem a flag)
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const firstName = userName.split(' ')[0] ?? userName

  return (
    // biome-ignore lint/a11y/useSemanticElements: <dialog> exigiria showModal() imperativo e permite ESC/click-outside; queremos modal 100% bloqueante
    <div className="backdrop" role="dialog" aria-modal="true" aria-labelledby="fa-title">
      <div className="card">
        <p className="eyebrow">Primeiro acesso</p>
        <h2 id="fa-title" className="title">
          Bem-vinda, {firstName}
        </h2>
        <p className="hint">
          Para continuar, defina uma senha pessoal com <strong>no mínimo 8 caracteres</strong>. Essa
          senha vai substituir a padrão em todos os próximos acessos.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="fa-current">Senha atual</label>
            <div className="input-wrap">
              <input
                id="fa-current"
                type={showPw ? 'text' : 'password'}
                placeholder="senha padrão"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  setError(null)
                }}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="fa-new">Nova senha</label>
            <div className="input-wrap">
              <input
                id="fa-new"
                type={showPw ? 'text' : 'password'}
                placeholder="mínimo 8 caracteres"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setError(null)
                }}
                className={tooShort || sameAsOld ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Ocultar senhas' : 'Mostrar senhas'}
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
            {tooShort && <p className="error-msg">Mínimo de 8 caracteres</p>}
            {sameAsOld && <p className="error-msg">Precisa ser diferente da atual</p>}
          </div>

          <div className="field">
            <label htmlFor="fa-confirm">Confirmar nova senha</label>
            <div className="input-wrap">
              <input
                id="fa-confirm"
                type={showPw ? 'text' : 'password'}
                placeholder="repita a nova senha"
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
              {loading ? <span className="spinner" /> : <span>Definir nova senha</span>}
            </span>
          </button>
        </form>
      </div>

      <style jsx>{`
        .backdrop {
          position: fixed;
          inset: 0;
          background: rgba(14, 26, 43, 0.72);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }

        .card {
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          border: 1px solid #e0ddd0;
          border-radius: 16px;
          padding: 40px 40px 36px;
          box-shadow: 0 32px 80px rgba(14, 26, 43, 0.35);
          animation: slideUp 0.28s ease;
        }

        .eyebrow {
          font-family: var(--f-mono, ui-monospace, monospace);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #c9a961;
          margin: 0 0 8px;
        }

        .title {
          font-family: var(--f-text, system-ui, sans-serif);
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #14130f;
          margin: 0 0 12px;
          line-height: 1.2;
        }

        .hint {
          font-size: 13px;
          line-height: 1.55;
          color: #5c5a4f;
          margin: 0 0 24px;
        }

        .hint strong {
          color: #25241f;
          font-weight: 600;
        }

        .field {
          margin-bottom: 16px;
        }

        .field label {
          display: block;
          font-family: var(--f-mono, ui-monospace, monospace);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #5c5a4f;
          margin-bottom: 6px;
        }

        .input-wrap {
          position: relative;
        }

        input {
          width: 100%;
          height: 42px;
          background: #fafaf7;
          border: 1px solid #d4cec1;
          border-radius: 8px;
          padding: 0 40px 0 12px;
          font-family: var(--f-text, system-ui, sans-serif);
          font-size: 14px;
          color: #14130f;
          outline: none;
          transition:
            border-color 0.15s,
            box-shadow 0.15s;
        }

        input::placeholder {
          color: #a6a290;
        }

        input:focus {
          border-color: #2d5fa0;
          box-shadow: 0 0 0 3px rgba(45, 95, 160, 0.12);
        }

        input.error {
          border-color: #d94141;
          box-shadow: 0 0 0 3px rgba(217, 65, 65, 0.1);
        }

        .toggle-pw {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #5c5a4f;
          opacity: 0.6;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: opacity 0.15s;
        }

        .toggle-pw:hover {
          opacity: 1;
        }

        .toggle-pw svg {
          width: 15px;
          height: 15px;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.6;
          display: block;
        }

        .error-msg {
          font-size: 12px;
          color: #d94141;
          margin: 4px 0 0;
        }

        .error-msg.global-error {
          background: #fdecec;
          border: 1px solid #f4b4b4;
          border-radius: 6px;
          padding: 8px 12px;
          margin: 12px 0 4px;
        }

        .btn-submit {
          width: 100%;
          height: 46px;
          margin-top: 20px;
          background: linear-gradient(135deg, #d4a96a 0%, #b8963e 100%);
          border: none;
          border-radius: 10px;
          font-family: var(--f-text, system-ui, sans-serif);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #14130f;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(201, 169, 97, 0.28);
          transition:
            transform 0.15s,
            box-shadow 0.15s;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(201, 169, 97, 0.35);
        }

        .btn-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .btn-inner {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          display: block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(20, 19, 15, 0.25);
          border-top-color: #14130f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

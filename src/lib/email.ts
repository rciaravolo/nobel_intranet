/**
 * Envio de e-mail via Resend HTTP API (sem SDK).
 * Se RESEND_API_KEY não estiver setada, imprime o e-mail no console —
 * útil para dev local antes de configurar o provedor.
 */

const RESEND_API_URL = 'https://api.resend.com/emails'
const FALLBACK_FROM = 'INTRA Nobel <onboarding@resend.dev>'

export interface SendEmailInput {
  to: string
  subject: string
  html: string
}

export interface SendEmailResult {
  ok: boolean
  reason?: string
  status?: number
  detail?: string | undefined
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM ?? FALLBACK_FROM

  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY não configurada — email não enviado')
    console.info('[email]', {
      to: input.to,
      subject: input.subject,
      html: input.html.slice(0, 500),
    })
    return { ok: false, reason: 'no-api-key' }
  }

  if (from === FALLBACK_FROM) {
    console.error(
      '[email] RESEND_FROM não configurada — usando onboarding@resend.dev, que só entrega para o dono da conta Resend. Configure RESEND_FROM com um domínio verificado.',
    )
    return { ok: false, reason: 'missing-from' }
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[email] Resend erro', res.status, detail)
      return { ok: false, reason: 'resend-error', status: res.status, detail }
    }

    const data = (await res.json().catch(() => undefined)) as { id?: string } | undefined
    if (data?.id) {
      console.info('[email] Resend ok', { id: data.id, to: input.to, subject: input.subject })
    }

    return { ok: true, status: res.status, detail: data?.id }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[email] fetch throw', detail)
    return { ok: false, reason: 'fetch-throw', detail }
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function resetPasswordEmail(params: { userName: string; resetUrl: string }): {
  subject: string
  html: string
} {
  const { userName, resetUrl } = params

  const subject = 'Redefinição de senha — INTRA Nobel'

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#1A1209;font-family:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1A1209;padding:48px 24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#2E2010;border:1px solid #4A3520;border-radius:16px;padding:40px 40px 32px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#F5ECD7;letter-spacing:.02em;">INTRA NOBEL</div>
              <div style="height:2px;width:40px;background:#D4A96A;margin:12px auto 0;"></div>
            </td>
          </tr>
          <tr>
            <td style="color:#F5ECD7;font-size:18px;font-weight:600;padding-bottom:8px;">
              Olá, ${escapeHtml(userName)}
            </td>
          </tr>
          <tr>
            <td style="color:#C9A87C;font-size:14px;line-height:1.6;padding-bottom:24px;">
              Recebemos uma solicitação para redefinir a senha da sua conta na INTRA Nobel.
              Se foi você, use o botão abaixo para criar uma nova senha. O link expira em 30 minutos.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4A96A 0%,#B8963E 100%);color:#1A1209;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:.02em;">
                Redefinir minha senha
              </a>
            </td>
          </tr>
          <tr>
            <td style="color:rgba(201,168,124,.6);font-size:12px;line-height:1.6;padding-bottom:16px;">
              Se o botão não funcionar, copie e cole este link no navegador:<br />
              <span style="color:#C9A87C;word-break:break-all;">${resetUrl}</span>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid rgba(74,53,32,.6);padding-top:16px;color:rgba(201,168,124,.5);font-size:12px;line-height:1.6;">
              Se você não solicitou esta redefinição, ignore este e-mail — sua senha continua inalterada.
            </td>
          </tr>
        </table>
        <div style="margin-top:20px;color:rgba(201,168,124,.4);font-size:11px;letter-spacing:.05em;">
          Nobel Capital &amp; XP Investimentos
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

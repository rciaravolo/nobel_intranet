import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendEmail } from './email'

describe('sendEmail', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    process.env.RESEND_API_KEY = 're_test_key'
    process.env.RESEND_FROM = 'INTRA Nobel <no-reply@nobelcapital.com.br>'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    // biome-ignore lint/performance/noDelete: limpando env entre testes
    delete process.env.RESEND_API_KEY
    // biome-ignore lint/performance/noDelete: limpando env entre testes
    delete process.env.RESEND_FROM
  })

  it('sends the correct payload to Resend with a verified-domain sender', async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify({ id: 're_123' }), { status: 200 }))

    const result = await sendEmail({
      to: 'colaborador@nobelcapital.com.br',
      subject: 'Redefinição de senha',
      html: '<p>link</p>',
    })

    expect(result.ok).toBe(true)
    expect(result.status).toBe(200)
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    expect(fetchSpy.mock.calls[0]).toBeDefined()
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')

    const body = JSON.parse(init.body as string)
    expect(body.from).toBe('INTRA Nobel <no-reply@nobelcapital.com.br>')
    expect(body.to).toBe('colaborador@nobelcapital.com.br')
    expect(body.subject).toBe('Redefinição de senha')
    expect(body.html).toBe('<p>link</p>')

    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer re_test_key')
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('never falls back to the restricted resend.dev test domain when RESEND_FROM is missing', async () => {
    // biome-ignore lint/performance/noDelete: simulando env ausente
    delete process.env.RESEND_FROM

    const result = await sendEmail({
      to: 'colaborador@nobelcapital.com.br',
      subject: 'Redefinição de senha',
      html: '<p>link</p>',
    })

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('missing-from')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns no-api-key in dev mode and skips the network call', async () => {
    // biome-ignore lint/performance/noDelete: simulando env ausente
    delete process.env.RESEND_API_KEY
    // biome-ignore lint/performance/noDelete: simulando env ausente
    delete process.env.RESEND_FROM

    const result = await sendEmail({
      to: 'colaborador@nobelcapital.com.br',
      subject: 'Redefinição de senha',
      html: '<p>link</p>',
    })

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('no-api-key')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('surfaces Resend HTTP errors with status and detail', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ message: 'You can only send testing emails to your own email address.' }),
        { status: 403, statusText: 'Forbidden' },
      ),
    )

    const result = await sendEmail({
      to: 'colaborador@nobelcapital.com.br',
      subject: 'Redefinição de senha',
      html: '<p>link</p>',
    })

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('resend-error')
    expect(result.status).toBe(403)
    expect(result.detail).toContain('testing emails')
  })

  it('catches network-level fetch failures and reports the reason', async () => {
    fetchSpy.mockRejectedValue(new TypeError('fetch failed'))

    const result = await sendEmail({
      to: 'colaborador@nobelcapital.com.br',
      subject: 'Redefinição de senha',
      html: '<p>link</p>',
    })

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('fetch-throw')
    expect(result.detail).toContain('fetch failed')
  })
})

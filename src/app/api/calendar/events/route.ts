import { type NextRequest, NextResponse } from 'next/server'

const TENANT_ID = process.env.MSGRAPH_TENANT_ID
const CLIENT_ID = process.env.MSGRAPH_CLIENT_ID
const CLIENT_SECRET = process.env.MSGRAPH_CLIENT_SECRET
const USER_EMAIL = process.env.MSGRAPH_USER_EMAIL ?? 'rafael.brandao@nobelcapital.com.br'

async function getAccessToken(): Promise<string | null> {
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) return null
  try {
    const res = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { access_token?: string }
    return data.access_token ?? null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start') ?? new Date().toISOString()
  const end = searchParams.get('end') ?? new Date(Date.now() + 8 * 86_400_000).toISOString()

  const token = await getAccessToken()

  if (!token) {
    return NextResponse.json({
      events: [],
      source: 'unconfigured',
      hint: 'Defina MSGRAPH_TENANT_ID, MSGRAPH_CLIENT_ID e MSGRAPH_CLIENT_SECRET no .env.local',
    })
  }

  try {
    const url = new URL(`https://graph.microsoft.com/v1.0/users/${USER_EMAIL}/calendarView`)
    url.searchParams.set('startDateTime', start)
    url.searchParams.set('endDateTime', end)
    url.searchParams.set('$select', 'id,subject,start,end,location,organizer,isAllDay,bodyPreview')
    url.searchParams.set('$orderby', 'start/dateTime')
    url.searchParams.set('$top', '100')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      next: { revalidate: 300 }, // cache 5 min
    })

    if (!res.ok) {
      const err = await res.text()
      // biome-ignore lint/suspicious/noConsole: server-side error logging
      console.error('[calendar] Graph error:', err)
      return NextResponse.json({ events: [], source: 'error', error: err })
    }

    const data = (await res.json()) as {
      value?: Array<{
        id: string
        subject: string
        start: { dateTime: string; timeZone: string }
        end: { dateTime: string; timeZone: string }
        location?: { displayName?: string }
        organizer?: { emailAddress?: { name?: string } }
        isAllDay?: boolean
        bodyPreview?: string
      }>
    }

    const events = (data.value ?? []).map((e) => ({
      id: e.id,
      title: e.subject,
      start: e.start.dateTime,
      end: e.end.dateTime,
      timeZone: e.start.timeZone,
      location: e.location?.displayName ?? '',
      organizer: e.organizer?.emailAddress?.name ?? '',
      isAllDay: e.isAllDay ?? false,
      preview: e.bodyPreview ?? '',
    }))

    return NextResponse.json({ events, source: 'outlook' })
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: server-side error logging
    console.error('[calendar] Unexpected error:', err)
    return NextResponse.json({ events: [], source: 'error' })
  }
}

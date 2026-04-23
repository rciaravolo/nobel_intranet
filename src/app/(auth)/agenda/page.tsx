import { requireSession } from '@/lib/auth/session'

/* ─── Tipos ─────────────────────────────────────────────────────────────── */

interface GraphEvent {
  id: string
  title: string
  start: string
  end: string
  location: string
  organizer: string
  isAllDay: boolean
}

interface GridEvent {
  id: string
  day: number        // 0 = seg … 4 = sex
  startHour: number  // 8.5 = 08:30
  duration: number   // em horas
  title: string
  where: string
  color: string
  bgColor: string
  textColor: string
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function getWeekDays(base: Date) {
  const d    = new Date(base)
  const dow  = d.getDay() // 0=Dom
  const diff = dow === 0 ? -6 : 1 - dow
  const mon  = new Date(d)
  mon.setDate(d.getDate() + diff)

  return Array.from({ length: 5 }, (_, i) => {
    const day = new Date(mon)
    day.setDate(mon.getDate() + i)
    return day
  })
}

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

function eventColor(title: string) {
  const t = title.toLowerCase()
  if (t.includes('daily') || t.includes('standup'))
    return { color: '#B8963E', bgColor: 'rgba(184,150,62,0.12)', textColor: '#92700A' }
  if (t.includes('comitê') || t.includes('comite') || t.includes('committee'))
    return { color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)',  textColor: '#6d28d9' }
  if (t.includes('workshop') || t.includes('treinamento'))
    return { color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)',  textColor: '#b45309' }
  if (t.includes('review') || t.includes('revisão') || t.includes('apresentação'))
    return { color: '#10b981', bgColor: 'rgba(16,185,129,0.1)',  textColor: '#047857' }
  return   { color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)', textColor: '#1d4ed8' }
}

function toLocalHour(isoString: string): number {
  const d = new Date(isoString)
  return d.getHours() + d.getMinutes() / 60
}

function graphToGrid(ev: GraphEvent, weekDays: Date[]): GridEvent | null {
  if (ev.isAllDay) return null
  const start = new Date(ev.start)
  const end   = new Date(ev.end)

  const dayIdx = weekDays.findIndex(
    (d) => d.toDateString() === start.toDateString()
  )
  if (dayIdx === -1) return null

  const startHour = toLocalHour(ev.start)
  const endHour   = toLocalHour(ev.end)
  const duration  = Math.max(endHour - startHour, 0.5)

  return {
    id:        ev.id,
    day:       dayIdx,
    startHour,
    duration,
    title:     ev.title,
    where:     ev.location || ev.organizer || '',
    ...eventColor(ev.title),
  }
}

/* ─── Fetch Microsoft Graph (server-side) ───────────────────────────────── */

async function fetchOutlookEvents(start: Date, end: Date): Promise<{ events: GridEvent[]; source: string }> {
  const TENANT_ID    = process.env.MSGRAPH_TENANT_ID
  const CLIENT_ID    = process.env.MSGRAPH_CLIENT_ID
  const CLIENT_SECRET = process.env.MSGRAPH_CLIENT_SECRET
  const USER_EMAIL   = process.env.MSGRAPH_USER_EMAIL ?? 'rafael.brandao@nobelcapital.com.br'

  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    return { events: [], source: 'unconfigured' }
  }

  try {
    // 1. Get token
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'client_credentials',
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SECRET,
          scope:         'https://graph.microsoft.com/.default',
        }),
        cache: 'no-store',
      }
    )
    if (!tokenRes.ok) return { events: [], source: 'token_error' }
    const { access_token } = await tokenRes.json() as { access_token?: string }
    if (!access_token) return { events: [], source: 'no_token' }

    // 2. Fetch calendar view
    const url = new URL(`https://graph.microsoft.com/v1.0/users/${USER_EMAIL}/calendarView`)
    url.searchParams.set('startDateTime', start.toISOString())
    url.searchParams.set('endDateTime',   end.toISOString())
    url.searchParams.set('$select',       'id,subject,start,end,location,organizer,isAllDay')
    url.searchParams.set('$orderby',      'start/dateTime')
    url.searchParams.set('$top',          '100')

    const evRes = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${access_token}` },
      next: { revalidate: 300 },
    })
    if (!evRes.ok) return { events: [], source: 'graph_error' }

    const data = await evRes.json() as {
      value?: Array<{
        id: string
        subject: string
        start: { dateTime: string }
        end:   { dateTime: string }
        location?: { displayName?: string }
        organizer?: { emailAddress?: { name?: string } }
        isAllDay?: boolean
      }>
    }

    const weekDays = getWeekDays(start)

    const events = (data.value ?? [])
      .map((e) => graphToGrid(
        {
          id:        e.id,
          title:     e.subject,
          start:     e.start.dateTime,
          end:       e.end.dateTime,
          location:  e.location?.displayName ?? '',
          organizer: e.organizer?.emailAddress?.name ?? '',
          isAllDay:  e.isAllDay ?? false,
        },
        weekDays
      ))
      .filter((e): e is GridEvent => e !== null)

    return { events, source: 'outlook' }
  } catch {
    return { events: [], source: 'error' }
  }
}

/* ─── Constantes de layout ──────────────────────────────────────────────── */

const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00']
const HOUR_H = 64 // px por hora

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default async function AgendaPage() {
  await requireSession()

  // Semana atual dinâmica
  const today    = new Date()
  const weekDays = getWeekDays(today)
  const lastDay  = weekDays[4] ?? weekDays[weekDays.length - 1] ?? today
  const weekEnd  = new Date(lastDay)
  weekEnd.setDate(weekEnd.getDate() + 1)

  const startDay = weekDays[0] ?? today
  const { events, source } = await fetchOutlookEvents(startDay, weekEnd)

  const todayEvents = events.filter((e) => e.day === 0 ||
    weekDays[e.day]?.toDateString() === today.toDateString()
  )
  const todayIdx = weekDays.findIndex((d) => d.toDateString() === today.toDateString())

  // Formatar cabeçalho de semana
  const fmtDay   = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric' })
  const fmtMonth = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  const firstDay = weekDays[0] ?? today
  const lastDayDisplay = lastDay
  const weekLabel = `${fmtDay(firstDay)} – ${fmtDay(lastDayDisplay)} ${fmtMonth(lastDayDisplay).charAt(0).toUpperCase() + fmtMonth(lastDayDisplay).slice(1)} ${lastDayDisplay.getFullYear()}`

  const todayLabel = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.4)', marginBottom: 4 }}>Semana de {weekLabel}</p>
          <h1 style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 24, fontWeight: 600, color: '#1A1209', display: 'flex', alignItems: 'center', gap: 10 }}>
            Agenda
            {source === 'outlook' && (
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#059669', background: 'rgba(5,150,105,0.1)', padding: '3px 8px', borderRadius: 20 }}>
                ● Outlook sincronizado
              </span>
            )}
            {source === 'unconfigured' && (
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', background: 'rgba(180,83,9,0.08)', padding: '3px 8px', borderRadius: 20 }}>
                ⚠ Outlook não configurado
              </span>
            )}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 1, border: '1px solid rgba(184,150,62,0.2)', borderRadius: 6, overflow: 'hidden' }}>
            {['Semana', 'Mês'].map((v, i) => (
              <button key={v} style={{ padding: '8px 16px', background: i === 0 ? '#1A1209' : '#fff', border: 'none', fontSize: 12, fontWeight: 500, color: i === 0 ? '#F6F3ED' : 'rgba(26,18,9,0.5)', cursor: 'pointer' }}>{v}</button>
            ))}
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#B8963E', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo evento
          </button>
        </div>
      </div>

      {source === 'unconfigured' && (
        <div style={{ marginBottom: 20, padding: '14px 18px', background: 'rgba(180,83,9,0.06)', border: '1px solid rgba(180,83,9,0.15)', borderRadius: 8, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
          <strong>Para sincronizar com o Outlook:</strong> adicione <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>MSGRAPH_TENANT_ID</code>, <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>MSGRAPH_CLIENT_ID</code> e <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>MSGRAPH_CLIENT_SECRET</code> no <strong>.env.local</strong> e faça redeploy.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>

        {/* Grid do calendário */}
        <div style={{ background: '#fff', border: '1px solid rgba(184,150,62,0.12)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(26,18,9,0.05)' }}>
          {/* Cabeçalho dos dias */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', borderBottom: '1px solid rgba(184,150,62,0.1)' }}>
            <div style={{ background: '#F6F3ED' }} />
            {weekDays.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString()
              return (
                <div key={i} style={{ padding: '12px 8px', textAlign: 'center', background: isToday ? 'rgba(184,150,62,0.05)' : '#F6F3ED', borderLeft: '1px solid rgba(184,150,62,0.08)' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: isToday ? '#B8963E' : 'rgba(26,18,9,0.35)', marginBottom: 4 }}>{DAY_LABELS[i]}</div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: isToday ? '#1A1209' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontFamily: 'var(--font-lora, serif)', fontSize: 14, fontWeight: 600, color: isToday ? '#F6F3ED' : '#1A1209' }}>
                    {d.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grade de horas */}
          <div style={{ position: 'relative', overflowY: 'auto', maxHeight: 640 }}>
            {HOURS.map((h) => {
              const hourNum = parseInt(h)
              return (
                <div key={h} style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', height: HOUR_H, borderBottom: '1px solid rgba(184,150,62,0.06)' }}>
                  <div style={{ padding: '4px 8px 0', textAlign: 'right' }}>
                    <span style={{ fontSize: 10, color: 'rgba(26,18,9,0.3)', fontVariantNumeric: 'tabular-nums' }}>{h}</span>
                  </div>
                  {weekDays.map((d, di) => {
                    const isToday = d.toDateString() === today.toDateString()
                    return (
                      <div key={di} style={{ borderLeft: '1px solid rgba(184,150,62,0.06)', position: 'relative', background: isToday ? 'rgba(184,150,62,0.015)' : 'transparent' }}>
                        {events
                          .filter((e) => e.day === di && Math.floor(e.startHour) === hourNum)
                          .map((ev) => {
                            const topOffset = (ev.startHour - hourNum) * HOUR_H
                            return (
                              <div
                                key={ev.id}
                                style={{
                                  position: 'absolute',
                                  top: topOffset + 2,
                                  left: 2,
                                  right: 2,
                                  height: ev.duration * HOUR_H - 4,
                                  background: ev.bgColor,
                                  borderLeft: `2px solid ${ev.color}`,
                                  borderRadius: 4,
                                  padding: '4px 6px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  zIndex: 1,
                                }}
                              >
                                <div style={{ fontSize: 11, fontWeight: 600, color: ev.textColor, lineHeight: 1.3, marginBottom: 2 }}>{ev.title}</div>
                                {ev.duration >= 0.75 && ev.where && (
                                  <div style={{ fontSize: 10, color: ev.textColor, opacity: 0.7 }}>{ev.where}</div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Hoje */}
          <div style={{ background: '#fff', border: '1px solid rgba(184,150,62,0.12)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(26,18,9,0.05)' }}>
            <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid rgba(184,150,62,0.1)', background: '#F6F3ED', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 14, fontWeight: 500, color: '#1A1209' }}>Hoje · {todayLabel}</span>
              <span style={{ fontSize: 11, color: '#B8963E', fontWeight: 500 }}>
                {todayIdx !== -1
                  ? `${events.filter((e) => e.day === todayIdx).length} eventos`
                  : `${todayEvents.length} eventos`
                }
              </span>
            </div>

            {(() => {
              const evs = todayIdx !== -1
                ? events.filter((e) => e.day === todayIdx)
                : []
              if (evs.length === 0) {
                return (
                  <div style={{ padding: '20px 18px', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.35)' }}>
                      {source === 'outlook' ? 'Sem eventos hoje.' : 'Conecte o Outlook para ver eventos reais.'}
                    </p>
                  </div>
                )
              }
              return evs.map((ev) => (
                <div key={ev.id} style={{ display: 'flex', gap: 12, padding: '12px 18px', borderBottom: '1px solid rgba(184,150,62,0.07)', cursor: 'pointer' }}>
                  <div style={{ width: 3, borderRadius: 2, background: ev.color, flexShrink: 0, alignSelf: 'stretch' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 12.5, fontWeight: 500, color: '#1A1209', marginBottom: 2 }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(26,18,9,0.4)' }}>
                      {`${Math.floor(ev.startHour)}:${String(Math.round((ev.startHour % 1) * 60)).padStart(2, '0')}`}
                      {ev.where ? ` · ${ev.where}` : ''}
                    </div>
                  </div>
                </div>
              ))
            })()}
          </div>

          {/* Próximos dias */}
          <div style={{ background: '#fff', border: '1px solid rgba(184,150,62,0.12)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(26,18,9,0.05)' }}>
            <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid rgba(184,150,62,0.1)', background: '#F6F3ED' }}>
              <span style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 14, fontWeight: 500, color: '#1A1209' }}>Próximos dias</span>
            </div>
            {(() => {
              const upcoming = events
                .filter((e) => todayIdx !== -1 ? e.day > todayIdx : e.day >= 0)
                .slice(0, 6)

              if (upcoming.length === 0) {
                return (
                  <div style={{ padding: '20px 18px', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.35)' }}>
                      {source === 'outlook' ? 'Sem próximos eventos.' : 'Calendário não conectado.'}
                    </p>
                  </div>
                )
              }
              return upcoming.map((ev) => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid rgba(184,150,62,0.07)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: ev.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={ev.color} strokeWidth="1.5" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1209', lineHeight: 1.3 }}>{ev.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(26,18,9,0.4)' }}>
                      {DAY_LABELS[ev.day]} {weekDays[ev.day]?.getDate()}/{String((weekDays[ev.day]?.getMonth() ?? 0) + 1).padStart(2,'0')} · {`${Math.floor(ev.startHour)}:${String(Math.round((ev.startHour % 1) * 60)).padStart(2, '0')}`}
                    </div>
                  </div>
                </div>
              ))
            })()}
          </div>

        </div>
      </div>
    </div>
  )
}

import { setSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  await setSession({
    userId: 'usr_demo_001',
    username: 'demo',
    name: 'Demo Nobel',
    role: 'admin',
    email: 'demo@nobelcapital.com.br',
  })

  return NextResponse.redirect(new URL('/dashboard', _req.url))
}

/**
 * Middleware — Edge Runtime compatible.
 *
 * Responsabilidade: gate rápido de presença de cookie.
 * A verificação criptográfica real do JWT ocorre no servidor
 * via requireSession() nos layouts/pages (Node.js runtime).
 */
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC = ['/login', '/api/auth/login', '/api/auth/logout', '/_next', '/favicon']
const ASSET_RE = /\.(png|jpg|jpeg|svg|ico|webp|woff2?|css|js|map)$/

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC.some((p) => pathname.startsWith(p)) || ASSET_RE.test(pathname)) {
    return NextResponse.next()
  }

  const token = req.cookies.get('intra_session')?.value

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Cookie presente → passa. Server component vai verificar JWT completo.
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

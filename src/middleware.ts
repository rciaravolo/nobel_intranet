import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/session'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Deixar passar: rotas públicas, assets, _next
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(png|jpg|svg|ico|webp|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Verificar sessão
  const token = req.cookies.get('intra_session')?.value
  const session = token ? verifyToken(token) : null

  if (!session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Adicionar headers de sessão para server components
  const res = NextResponse.next()
  res.headers.set('x-user-id', session.userId)
  res.headers.set('x-user-name', session.name)
  res.headers.set('x-user-role', session.role)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

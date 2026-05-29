import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC = ['/login', '/api/auth/login', '/api/auth/logout', '/api/auth/demo', '/api/mock', '/demo', '/_next', '/favicon']
const ASSET_RE = /\.(png|jpg|jpeg|svg|ico|webp|woff2?|css|js|map)$/
const MOBILE_UA = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

const MOBILE_MAP: Record<string, string> = {
  '/dashboard': '/m/onepage',
  '/analises': '/m/onepage',
  '/carteiras': '/m/onepage',
  '/clientes': '/m/onepage',
  '/pnl': '/m/onepage',
  '/relatorios': '/m/materiais',
  '/documentos': '/m/materiais',
  '/configuracoes': '/m/settings',
  '/agenda': '/m/onepage',
  '/comunicados': '/m/onepage',
  '/automacoes': '/m/onepage',
}

const REVERSE_MAP = Object.fromEntries(
  Object.entries(MOBILE_MAP).map(([k, v]) => [v, k])
)

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

  const ua = req.headers.get('user-agent') ?? ''
  const isMobile = MOBILE_UA.test(ua)
  const isMobileRoute = pathname.startsWith('/m/')

  if (isMobile && !isMobileRoute && !pathname.startsWith('/api/')) {
    const mobilePath = MOBILE_MAP[pathname] ?? '/m/onepage'
    const url = req.nextUrl.clone()
    url.pathname = mobilePath
    return NextResponse.redirect(url)
  }

  if (!isMobile && isMobileRoute) {
    const desktopPath = REVERSE_MAP[pathname] ?? '/dashboard'
    const url = req.nextUrl.clone()
    url.pathname = desktopPath
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

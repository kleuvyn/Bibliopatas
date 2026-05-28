import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SESSION_COOKIE = 'admin_session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

  const isAdminPage = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'
  const isAdminApi = pathname.startsWith('/api/admin')
  const isAuthApi = pathname === '/api/admin/login'

  if ((isAdminPage && !isLoginPage) || (isAdminApi && !isAuthApi)) {
    if (!hasSession) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
      }

      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

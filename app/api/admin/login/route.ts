import { NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionValue,
  validateAdminCredentials,
} from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body?.email || '')
    const password = String(body?.password || '')

    if (!validateAdminCredentials(email, password)) {
      return NextResponse.json({ error: 'Credenciais invalidas.' }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: getAdminSessionValue(),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Falha ao processar login.' }, { status: 400 })
  }
}

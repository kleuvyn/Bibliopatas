import { timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_SESSION_COOKIE = 'admin_session'

const DEFAULT_ADMIN_EMAIL = 'admin@bibliopatas.df'
const DEFAULT_ADMIN_PASSWORD = 'admin123'
const DEFAULT_SESSION_SECRET = 'bibliopatas-admin-session'

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return timingSafeEqual(aBuffer, bBuffer)
}

function getAuthConfig() {
  return {
    email: process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
    sessionSecret: process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET,
  }
}

export function getAdminEmail() {
  return getAuthConfig().email
}

export function getAdminSessionValue() {
  return getAuthConfig().sessionSecret
}

export function validateAdminCredentials(email: string, password: string) {
  const config = getAuthConfig()
  return safeEqual(email.trim(), config.email) && safeEqual(password, config.password)
}

export function isValidAdminSession(session: string | null | undefined) {
  if (!session) {
    return false
  }

  return safeEqual(session, getAuthConfig().sessionSecret)
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
}

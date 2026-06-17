import { cookies } from 'next/headers'
import { signJWT, verifyJWT, SessionPayload } from './jwt'

const SESSION_COOKIE = 'cresco_session'

export async function setSession(payload: SessionPayload) {
  const token = await signJWT(payload)
  const cookieStore = await cookies()
  
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyJWT(token)
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

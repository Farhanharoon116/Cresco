'use server'

import { cookies } from 'next/headers'
import { signJWT, verifyJWT, SessionPayload } from '@/lib/auth/jwt'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const ADMIN_SESSION_COOKIE = 'cresco_admin_session'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid admin password' }
  }

  const payload: SessionPayload = { id: 'admin', email: 'admin@cresco.app' }
  const token = await signJWT(payload)
  const cookieStore = await cookies()

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 1 day
  })

  redirect('/admin')
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null
  return verifyJWT(token)
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
  redirect('/admin/login')
}

export async function getAdminDashboardData() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }

  const supabase = await createClient()

  // We fetch standard stats assuming RLS allows anon select on these
  // The query `supabase.from('users').select('*')` might be restricted by RLS. 
  // Let's attempt it. If it fails, it returns empty array.
  
  const [{ count: userCount, data: users }, { count: expenseCount }, { count: goalCount }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact' }),
    supabase.from('expenses').select('*', { count: 'exact', head: true }),
    supabase.from('savings_goals').select('*', { count: 'exact', head: true }),
  ])

  return {
    success: true,
    data: {
      stats: {
        totalUsers: userCount || 0,
        totalExpenses: expenseCount || 0,
        totalGoals: goalCount || 0,
      },
      users: users || []
    }
  }
}

export async function deleteUser(userId: string) {
  const session = await getAdminSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const supabase = await createClient()
  
  const { error } = await supabase.from('users').delete().eq('id', userId)
  if (error) return { success: false, error: error.message }
  
  return { success: true }
}

export async function broadcastAlert(formData: FormData) {
  const session = await getAdminSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  
  const title = formData.get('title') as string
  const message = formData.get('message') as string
  
  if (!title || !message) return { success: false, error: 'Title and message required' }
  
  const supabase = await createClient()
  
  const { data: users, error: userError } = await supabase.from('users').select('id')
  if (userError || !users) return { success: false, error: 'Failed to fetch users' }
  if (users.length === 0) return { success: true, count: 0 }
  
  const alertsToInsert = users.map(u => ({
    user_id: u.id,
    type: 'system_broadcast',
    title,
    message,
    severity: 'info',
    is_read: false,
    metadata: { source: 'admin' }
  }))
  
  const { error: alertError } = await supabase.from('alerts').insert(alertsToInsert)
  if (alertError) return { success: false, error: alertError.message }
  
  return { success: true, count: users.length }
}

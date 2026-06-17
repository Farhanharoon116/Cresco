'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthError } from '@/lib/errors'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth/jwt'
import { setSession, getSession, clearSession } from '@/lib/auth/session'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required').max(100),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function signUp(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('full_name') as string,
  }

  const parsed = signupSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' }
  }

  const hashedPassword = await hashPassword(parsed.data.password)
  const supabase = await createClient()

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      email: parsed.data.email.toLowerCase(),
      password_hash: hashedPassword,
      full_name: parsed.data.full_name,
    })
    .select('id, email')
    .single()

  if (error || !newUser) {
    if (error?.code === '23505') {
      return { success: false as const, error: 'An account with this email already exists.', code: 'EMAIL_TAKEN' }
    }
    return { success: false as const, error: error?.message || 'Failed to create user', code: 'AUTH_ERROR' }
  }

  await setSession({ id: newUser.id, email: newUser.email })

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signIn(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' }
  }

  const hashedPassword = await hashPassword(parsed.data.password)
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', parsed.data.email.toLowerCase())
    .eq('password_hash', hashedPassword)
    .single()

  if (error || !user) {
    return { success: false as const, error: 'Incorrect email or password.', code: 'INVALID_CREDENTIALS' }
  }

  await setSession({ id: user.id, email: user.email })

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  await clearSession()
  redirect('/login')
}

export async function getUser() {
  const session = await getSession()
  return session
}

export async function getUserProfile() {
  const session = await getSession()
  if (!session) throw new AuthError()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.id)
    .single()

  if (error || !data) throw new AuthError('Profile not found')
  return data
}

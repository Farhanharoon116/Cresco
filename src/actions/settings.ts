'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthError, handleSupabaseError, toActionError } from '@/lib/errors'
import { profileSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/types/ai'
import { getUser } from '@/actions/auth'

export async function updateProfile(data: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const parsed = profileSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Invalid profile data.', code: 'VALIDATION_ERROR' }
    }

    const { error } = await supabase
      .from('users')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) handleSupabaseError(error)
    revalidatePath('/', 'layout')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function updateInterests(interests: string[]): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { error } = await supabase
      .from('interest_profiles')
      .upsert({ user_id: user.id, interests, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

    if (error) handleSupabaseError(error)
    revalidatePath('/settings')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function deleteAllData(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    // Delete all financial data (cascades via FK on user_id)
    await Promise.all([
      supabase.from('expenses').delete().eq('user_id', user.id),
      supabase.from('budgets').delete().eq('user_id', user.id),
      supabase.from('savings_goals').delete().eq('user_id', user.id),
      supabase.from('alerts').delete().eq('user_id', user.id),
      supabase.from('forecasts').delete().eq('user_id', user.id),
      supabase.from('monthly_reports').delete().eq('user_id', user.id),
      supabase.from('recommendations').delete().eq('user_id', user.id),
      supabase.from('incomes').delete().eq('user_id', user.id),
    ])

    // Reset onboarding
    await supabase
      .from('users')
      .update({ onboarding_complete: false })
      .eq('id', user.id)

    revalidatePath('/', 'layout')
    redirect('/onboarding')
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function deleteAccount(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    // Delete user profile (cascades all data)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    if (error) handleSupabaseError(error)

    await supabase.auth.signOut()
    redirect('/')
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function exportData(): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const [expensesRes, budgetsRes, goalsRes, incomesRes] = await Promise.all([
      supabase.from('expenses').select('*, category:categories(name)').eq('user_id', user.id),
      supabase.from('budgets').select('*, category:categories(name)').eq('user_id', user.id),
      supabase.from('savings_goals').select('*').eq('user_id', user.id),
      supabase.from('incomes').select('*').eq('user_id', user.id),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      expenses: expensesRes.data ?? [],
      budgets: budgetsRes.data ?? [],
      savings_goals: goalsRes.data ?? [],
      incomes: incomesRes.data ?? [],
    }

    return { success: true, data: JSON.stringify(exportData, null, 2) }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

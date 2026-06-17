'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthError, handleSupabaseError, toActionError } from '@/lib/errors'
import { budgetSchema } from '@/lib/validators'
import { getCurrentMonthRange } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/ai'
import type { Budget } from '@/types/database'
import { getUser } from '@/actions/auth'

export async function createBudget(data: unknown): Promise<ActionResult<Budget>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const parsed = budgetSchema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
      return { success: false, error: 'Please fix the errors below.', code: 'VALIDATION_ERROR', fieldErrors }
    }

    const { start: period_start, end: period_end } = getCurrentMonthRange()

    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id: parsed.data.category_id,
        limit_amount: parsed.data.limit_amount,
        period: parsed.data.period,
        period_start,
        period_end,
      })
      .select('*, category:categories(*)')
      .single()

    if (error) handleSupabaseError(error)
    revalidatePath('/budgets')
    revalidatePath('/dashboard')
    return { success: true, data: budget as Budget }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function updateBudget(id: string, data: unknown): Promise<ActionResult<Budget>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const parsed = budgetSchema.partial().safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Invalid budget data.', code: 'VALIDATION_ERROR' }
    }

    const { data: budget, error } = await supabase
      .from('budgets')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, category:categories(*)')
      .single()

    if (error) handleSupabaseError(error)
    revalidatePath('/budgets')
    revalidatePath('/dashboard')
    return { success: true, data: budget as Budget }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) handleSupabaseError(error)
    revalidatePath('/budgets')
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function getBudgets(): Promise<ActionResult<Budget[]>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { start: period_start } = getCurrentMonthRange()

    const { data, error } = await supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .eq('period_start', period_start)
      .order('created_at', { ascending: true })

    if (error) handleSupabaseError(error)

    const budgets = (data ?? []).map((b) => ({
      ...b,
      percentage: b.limit_amount > 0 ? Math.min(Math.round((b.spent_amount / b.limit_amount) * 100), 100) : 0,
      status: getBudgetStatus(b.spent_amount, b.limit_amount),
    })) as Budget[]

    return { success: true, data: budgets }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

function getBudgetStatus(spent: number, limit: number): Budget['status'] {
  const pct = limit > 0 ? (spent / limit) * 100 : 0
  if (pct >= 100) return 'exceeded'
  if (pct >= 90) return 'danger'
  if (pct >= 75) return 'warning'
  return 'safe'
}

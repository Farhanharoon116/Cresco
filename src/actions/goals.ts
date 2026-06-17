'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthError, handleSupabaseError, toActionError } from '@/lib/errors'
import { savingsGoalSchema, addToGoalSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/ai'
import type { SavingsGoal } from '@/types/database'
import { getUser } from '@/actions/auth'

export async function createGoal(data: unknown): Promise<ActionResult<SavingsGoal>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const parsed = savingsGoalSchema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
      return { success: false, error: 'Please fix the errors below.', code: 'VALIDATION_ERROR', fieldErrors }
    }

    const { data: goal, error } = await supabase
      .from('savings_goals')
      .insert({ user_id: user.id, ...parsed.data })
      .select()
      .single()

    if (error) handleSupabaseError(error)
    revalidatePath('/goals')
    revalidatePath('/dashboard')
    return { success: true, data: goal as SavingsGoal }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function updateGoal(id: string, data: unknown): Promise<ActionResult<SavingsGoal>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const parsed = savingsGoalSchema.partial().safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Invalid goal data.', code: 'VALIDATION_ERROR' }
    }

    const { data: goal, error } = await supabase
      .from('savings_goals')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) handleSupabaseError(error)

    // Auto-complete if target reached
    if (goal && goal.current_amount >= goal.target_amount && goal.status === 'active') {
      await supabase.from('savings_goals').update({ status: 'completed' }).eq('id', id)
      await supabase.from('alerts').insert({
        user_id: user.id,
        type: 'goal_milestone',
        title: `🎉 Goal "${goal.name}" completed!`,
        message: `Congratulations! You've reached your savings goal of ${goal.target_amount}.`,
        severity: 'info',
        metadata: { goal_id: id, goal_name: goal.name },
      })
    }

    revalidatePath('/goals')
    revalidatePath('/dashboard')
    return { success: true, data: goal as SavingsGoal }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function addToGoal(data: unknown): Promise<ActionResult<SavingsGoal>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const parsed = addToGoalSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Invalid amount.', code: 'VALIDATION_ERROR' }
    }

    // Get current amount first
    const { data: current } = await supabase
      .from('savings_goals')
      .select('current_amount, target_amount, name, status')
      .eq('id', parsed.data.goal_id)
      .eq('user_id', user.id)
      .single()

    if (!current) return { success: false, error: 'Goal not found.', code: 'NOT_FOUND' }
    if (current.status !== 'active') return { success: false, error: 'Goal is not active.', code: 'INVALID_STATE' }

    const newAmount = current.current_amount + parsed.data.amount

    return updateGoal(parsed.data.goal_id, { current_amount: newAmount })
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) handleSupabaseError(error)
    revalidatePath('/goals')
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function getGoals(): Promise<ActionResult<SavingsGoal[]>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'paused'])
      .order('created_at', { ascending: false })

    if (error) handleSupabaseError(error)

    const goals = (data ?? []).map((g) => ({
      ...g,
      percentage: g.target_amount > 0
        ? Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100)
        : 0,
      days_remaining: g.target_date
        ? Math.max(0, Math.ceil((new Date(g.target_date).getTime() - Date.now()) / 86400000))
        : null,
    })) as SavingsGoal[]

    return { success: true, data: goals }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

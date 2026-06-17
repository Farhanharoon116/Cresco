'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthError, handleSupabaseError, toActionError } from '@/lib/errors'
import { onboardingSchema } from '@/lib/validators'
import { getCurrentMonthRange } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/ai'
import { getUser } from '@/actions/auth'

export async function completeOnboarding(data: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const parsed = onboardingSchema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
      return { success: false, error: 'Please fix the errors below.', code: 'VALIDATION_ERROR', fieldErrors }
    }

    const { income, categories, goal, interests, currency } = parsed.data
    const { start: period_start, end: period_end } = getCurrentMonthRange()

    // 1. Update user currency + mark onboarding complete
    const { error: userErr } = await supabase
      .from('users')
      .update({ currency, onboarding_complete: true })
      .eq('id', user.id)
    if (userErr) handleSupabaseError(userErr)

    // 2. Create income record
    const { error: incErr } = await supabase.from('incomes').insert({
      user_id: user.id,
      amount: income.amount,
      source: income.source,
      frequency: income.frequency,
      day_of_month: income.day_of_month,
    })
    if (incErr) handleSupabaseError(incErr)

    // 3. Create categories + budgets in batch
    const categoryInserts = categories.map((c) => ({
      user_id: user.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      is_default: true,
    }))

    const { data: createdCats, error: catErr } = await supabase
      .from('categories')
      .insert(categoryInserts)
      .select()
    if (catErr) handleSupabaseError(catErr)

    // 4. Create a monthly budget for each category
    const budgetLimit = Math.floor(income.amount / categories.length)
    const budgetInserts = (createdCats ?? []).map((cat) => ({
      user_id: user.id,
      category_id: cat.id,
      limit_amount: budgetLimit,
      period: 'monthly' as const,
      period_start,
      period_end,
    }))

    if (budgetInserts.length > 0) {
      const { error: budErr } = await supabase.from('budgets').insert(budgetInserts)
      if (budErr) handleSupabaseError(budErr)
    }

    // 5. Create savings goal (optional)
    if (goal) {
      const { error: goalErr } = await supabase.from('savings_goals').insert({
        user_id: user.id,
        name: goal.name,
        description: goal.description,
        icon: goal.icon,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount ?? 0,
        target_date: goal.target_date,
      })
      if (goalErr) handleSupabaseError(goalErr)
    }

    // 6. Create interest profile
    const { error: intErr } = await supabase.from('interest_profiles').upsert({
      user_id: user.id,
      interests,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    if (intErr) handleSupabaseError(intErr)

    revalidatePath('/', 'layout')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function checkOnboardingStatus(): Promise<boolean> {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) return false

  const { data } = await supabase
    .from('users')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single()

  return data?.onboarding_complete ?? false
}

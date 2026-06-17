'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthError, handleSupabaseError, toActionError } from '@/lib/errors'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/ai'
import { getUser } from '@/actions/auth'
import { addDays, addMonths, parseISO } from 'date-fns'

// ─── Types ────────────────────────────────────────────────

export interface RecurringExpense {
  id: string
  user_id: string
  name: string
  amount: number
  category_id: string | null
  frequency: 'weekly' | 'biweekly' | 'monthly'
  next_due_date: string
  is_active: boolean
  created_at: string
  /** Joined category fields */
  category?: { name: string; icon: string } | null
}

// ─── Queries ─────────────────────────────────────────────

/** Fetch all recurring expenses for the authenticated user, ordered by next_due_date ascending */
export async function getRecurringExpenses(): Promise<ActionResult<RecurringExpense[]>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*, category:categories(name, icon)')
      .eq('user_id', user.id)
      .order('next_due_date', { ascending: true })

    if (error) handleSupabaseError(error)

    return { success: true, data: (data ?? []) as RecurringExpense[] }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

// ─── Mutations ────────────────────────────────────────────

/** Create a new recurring expense for the authenticated user */
export async function createRecurringExpense(data: {
  name: string
  amount: number
  category_id: string | null
  frequency: 'weekly' | 'biweekly' | 'monthly'
  next_due_date: string
}): Promise<ActionResult<RecurringExpense>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    if (!data.name?.trim()) {
      return { success: false, error: 'Name is required.', code: 'VALIDATION_ERROR' }
    }
    if (!data.amount || data.amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0.', code: 'VALIDATION_ERROR' }
    }
    if (!data.next_due_date) {
      return { success: false, error: 'Next due date is required.', code: 'VALIDATION_ERROR' }
    }

    const { data: recurring, error } = await supabase
      .from('recurring_expenses')
      .insert({
        user_id: user.id,
        name: data.name.trim(),
        amount: data.amount,
        category_id: data.category_id ?? null,
        frequency: data.frequency,
        next_due_date: data.next_due_date,
        is_active: true,
      })
      .select('*, category:categories(name, icon)')
      .single()

    if (error) handleSupabaseError(error)
    revalidatePath('/expenses')
    return { success: true, data: recurring as RecurringExpense }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

/** Delete a recurring expense by id — guarded by user_id */
export async function deleteRecurringExpense(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // RLS guard

    if (error) handleSupabaseError(error)
    revalidatePath('/expenses')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

/**
 * Apply a recurring expense today:
 * 1. Fetches the recurring expense (with user_id guard)
 * 2. Inserts a real expense into the expenses table (today's date)
 * 3. Advances next_due_date by the appropriate frequency interval
 * 4. Revalidates /expenses and /dashboard
 */
export async function applyRecurringExpense(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    // 1. Fetch the recurring expense
    const { data: recurring, error: fetchError } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // RLS guard
      .single()

    if (fetchError) handleSupabaseError(fetchError)
    if (!recurring) {
      return { success: false, error: 'Recurring expense not found.', code: 'NOT_FOUND' }
    }

    const today = new Date().toISOString().split('T')[0]

    // 2. Insert into expenses table
    const { error: insertError } = await supabase.from('expenses').insert({
      user_id: user.id,
      amount: recurring.amount,
      category_id: recurring.category_id ?? null,
      description: recurring.name,
      merchant: null,
      expense_date: today,
      notes: `Applied from recurring expense: ${recurring.name}`,
      ai_categorized: false,
      ai_confidence: null,
      user_corrected: false,
    })

    if (insertError) handleSupabaseError(insertError)

    // 3. Advance next_due_date based on frequency
    const currentDue = parseISO(recurring.next_due_date)
    let nextDue: Date

    switch (recurring.frequency as 'weekly' | 'biweekly' | 'monthly') {
      case 'weekly':
        nextDue = addDays(currentDue, 7)
        break
      case 'biweekly':
        nextDue = addDays(currentDue, 14)
        break
      case 'monthly':
      default:
        nextDue = addMonths(currentDue, 1)
        break
    }

    const { error: updateError } = await supabase
      .from('recurring_expenses')
      .update({ next_due_date: nextDue.toISOString().split('T')[0] })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) handleSupabaseError(updateError)

    revalidatePath('/expenses')
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthError, handleSupabaseError, toActionError } from '@/lib/errors'
import { expenseSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/ai'
import type { Expense } from '@/types/database'
import { getUser } from '@/actions/auth'
import { runBudgetMonitor } from '@/lib/ai/agents/budget'

export async function createExpense(data: unknown): Promise<ActionResult<Expense>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const parsed = expenseSchema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
      return { success: false, error: 'Please fix the errors below.', code: 'VALIDATION_ERROR', fieldErrors }
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({ user_id: user.id, ...parsed.data })
      .select('*, category:categories(*)')
      .single()

    if (error) handleSupabaseError(error)

    // Run budget monitor in the background — fires budget threshold alerts
    runBudgetMonitor(user.id).catch(console.error)

    revalidatePath('/', 'layout')
    return { success: true, data: expense as Expense }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function updateExpense(id: string, data: unknown): Promise<ActionResult<Expense>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const parsed = expenseSchema.partial().safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Invalid data provided.', code: 'VALIDATION_ERROR' }
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id) // RLS guard
      .select('*, category:categories(*)')
      .single()

    if (error) handleSupabaseError(error)

    // Re-check budget thresholds after update
    runBudgetMonitor(user.id).catch(console.error)

    revalidatePath('/', 'layout')
    return { success: true, data: expense as Expense }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) handleSupabaseError(error)
    revalidatePath('/', 'layout')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function getExpenses(options: {
  month?: number
  year?: number
  category_id?: string
  limit?: number
  offset?: number
} = {}): Promise<ActionResult<{ expenses: Expense[]; total: number }>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const now = new Date()
    const month = options.month ?? now.getMonth() + 1
    const year = options.year ?? now.getFullYear()
    const limit = options.limit ?? 50
    const offset = options.offset ?? 0

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    let query = supabase
      .from('expenses')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (options.category_id) {
      query = query.eq('category_id', options.category_id)
    }

    const { data, error, count } = await query
    if (error) handleSupabaseError(error)

    return { success: true, data: { expenses: (data ?? []) as Expense[], total: count ?? 0 } }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function correctExpenseCategory(
  expenseId: string,
  categoryId: string
): Promise<ActionResult<Expense>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({ category_id: categoryId, user_corrected: true })
      .eq('id', expenseId)
      .eq('user_id', user.id)
      .select('*, category:categories(*)')
      .single()

    if (error) handleSupabaseError(error)
    revalidatePath('/', 'layout')
    return { success: true, data: expense as Expense }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function exportAllExpensesAsCsv(): Promise<ActionResult<{ csv: string }>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false })

    if (error) handleSupabaseError(error)

    if (!expenses || expenses.length === 0) {
      return { success: true, data: { csv: 'date,amount,merchant,category,description\n' } }
    }

    const header = 'date,amount,merchant,category,description\n'
    const rows = expenses.map(e => {
      const catName = e.category?.name ?? ''
      const desc = (e.description ?? '').replace(/"/g, '""')
      const merch = (e.merchant ?? '').replace(/"/g, '""')
      return `${e.expense_date},${e.amount},"${merch}","${catName}","${desc}"`
    })

    return { success: true, data: { csv: header + rows.join('\n') } }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthError, handleSupabaseError, toActionError } from '@/lib/errors'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/ai'
import type { Alert, DashboardSummary, CategorySpending, Expense, Forecast, SavingsGoal } from '@/types/database'
import { getUser } from '@/actions/auth'

export async function getDashboardData(): Promise<ActionResult<{
  summary: DashboardSummary
  categorySpending: CategorySpending[]
  recentExpenses: Expense[]
  unreadAlerts: Alert[]
  latestForecast: Forecast | null
  activeGoals: SavingsGoal[]
}>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    // Run all queries in parallel for speed
    const [summaryRes, categoryRes, expensesRes, alertsRes, forecastRes, goalsRes] = await Promise.all([
      supabase.rpc('get_dashboard_summary', { p_user_id: user.id }),
      supabase.rpc('get_monthly_spending_by_category', { p_user_id: user.id, p_month: month, p_year: year }),
      supabase
        .from('expenses')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .limit(5),
      supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('forecasts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3),
    ])

    return {
      success: true,
      data: {
        summary: summaryRes.data as DashboardSummary,
        categorySpending: (categoryRes.data ?? []) as CategorySpending[],
        recentExpenses: (expensesRes.data ?? []) as Expense[],
        unreadAlerts: (alertsRes.data ?? []) as Alert[],
        latestForecast: (forecastRes.data ?? null) as Forecast | null,
        activeGoals: (goalsRes.data ?? []) as SavingsGoal[],
      },
    }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function markAlertRead(alertId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .eq('user_id', user.id)

    if (error) handleSupabaseError(error)
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function markAllAlertsRead(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) handleSupabaseError(error)
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function getWeeklySpending(): Promise<ActionResult<{ week: string; amount: number }[]>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    const { data, error } = await supabase
      .from('expenses')
      .select('amount, expense_date')
      .eq('user_id', user.id)
      .gte('expense_date', fourWeeksAgo.toISOString().split('T')[0])
      .order('expense_date', { ascending: true })

    if (error) handleSupabaseError(error)

    // Group by week
    const weekMap: Record<string, number> = {}
    for (const e of data ?? []) {
      const d = new Date(e.expense_date)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toISOString().split('T')[0]
      weekMap[key] = (weekMap[key] ?? 0) + Number(e.amount)
    }

    const result = Object.entries(weekMap).map(([week, amount]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: Math.round(amount * 100) / 100,
    }))

    return { success: true, data: result }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}

export async function getUnreadAlertCount(): Promise<ActionResult<number>> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) throw new AuthError()

    const { count, error } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) handleSupabaseError(error)
    return { success: true, data: count ?? 0 }
  } catch (err) {
    return { success: false, ...toActionError(err) }
  }
}


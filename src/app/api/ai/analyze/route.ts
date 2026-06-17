import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runFinancialCoach } from '@/lib/ai/agents/coach'
import { getUser } from '@/actions/auth'

export async function POST() {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const daysElapsed = now.getDate()
    const daysTotal = new Date(year, month, 0).getDate()
    const daysRemaining = daysTotal - daysElapsed

    // Gather all data for the coach
    const [profileRes, incomeRes, expensesRes, budgetsRes, goalsRes, interestsRes] = await Promise.all([
      supabase.from('users').select('currency').eq('id', user.id).single(),
      supabase.from('incomes').select('amount').eq('user_id', user.id).eq('is_active', true),
      supabase.from('expenses').select('id, amount, description, merchant, expense_date, category:categories(name)')
        .eq('user_id', user.id)
        .gte('expense_date', `${year}-${String(month).padStart(2, '0')}-01`)
        .order('expense_date', { ascending: false }),
      supabase.from('budgets').select('*, category:categories(name)').eq('user_id', user.id).eq('period_start', `${year}-${String(month).padStart(2, '0')}-01`),
      supabase.from('savings_goals').select('name, target_amount, current_amount').eq('user_id', user.id).eq('status', 'active'),
      supabase.from('interest_profiles').select('interests').eq('user_id', user.id).single(),
    ])

    const currency = profileRes.data?.currency ?? 'USD'
    const monthlyIncome = (incomeRes.data ?? []).reduce((sum, i) => sum + Number(i.amount), 0)
    const totalSpent = (expensesRes.data ?? []).reduce((sum, e) => sum + Number(e.amount), 0)

    const avgByCategory: Record<string, number> = {}
    const categoryTotals: Record<string, { spent: number; limit: number; count: number; name: string }> = {}

    for (const budget of budgetsRes.data ?? []) {
      const name = (budget.category as { name: string } | null)?.name ?? 'Other'
      categoryTotals[name] = {
        spent: budget.spent_amount,
        limit: budget.limit_amount,
        count: 0,
        name,
      }
    }

    for (const expense of expensesRes.data ?? []) {
      const name = (expense.category as unknown as { name: string } | null)?.name ?? 'Other'
      if (!avgByCategory[name]) avgByCategory[name] = 0
      avgByCategory[name] += Number(expense.amount)
      if (categoryTotals[name]) categoryTotals[name].count++
    }

    // Average
    for (const key of Object.keys(avgByCategory)) {
      const count = categoryTotals[key]?.count ?? 1
      avgByCategory[key] = avgByCategory[key] / count
    }

    const recentExpenses = (expensesRes.data ?? []).slice(0, 20).map((e) => ({
      id: e.id,
      amount: Number(e.amount),
      description: e.description ?? '',
      merchant: e.merchant,
      category: (e.category as unknown as { name: string } | null)?.name ?? 'Other',
      date: e.expense_date,
    }))

    const result = await runFinancialCoach({
      monthly_income: monthlyIncome,
      total_spent: totalSpent,
      days_elapsed: daysElapsed,
      days_remaining: daysRemaining,
      spending_by_category: Object.values(categoryTotals),
      recent_expenses: recentExpenses,
      avg_by_category: avgByCategory,
      savings_goals: (goalsRes.data ?? []).map((g) => ({
        name: g.name,
        target: g.target_amount,
        current: g.current_amount,
      })),
      interests: interestsRes.data?.interests ?? [],
      currency,
    })

    // Store forecast + recommendations in DB
    await Promise.all([
      supabase.from('forecasts').insert({
        user_id: user.id,
        predicted_balance: result.forecast.predicted_balance,
        avg_daily_spending: result.forecast.avg_daily_spending,
        remaining_days: result.forecast.remaining_days,
        confidence: result.forecast.confidence,
        risk_level: result.forecast.risk_level,
      }),
      result.recommendations.length > 0
        ? supabase.from('recommendations').insert(
            result.recommendations.map((r) => ({
              user_id: user.id,
              category: r.category,
              title: r.title,
              description: r.description,
              url: r.url,
              estimated_cost: r.estimated_cost,
              reason: r.reason,
              month,
              year,
            }))
          )
        : Promise.resolve(),
      // Store anomaly alerts
      result.anomalies.length > 0
        ? supabase.from('alerts').insert(
            result.anomalies.map((a) => ({
              user_id: user.id,
              type: 'anomaly',
              title: `Unusual spending detected`,
              message: a.reason,
              severity: a.severity,
              metadata: { expense_id: a.expense_id, amount: a.amount },
            }))
          )
        : Promise.resolve(),
    ])

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('[/api/ai/analyze]', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}

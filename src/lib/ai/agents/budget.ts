import { createClient } from '@/lib/supabase/server'
import { BUDGET_ALERT_THRESHOLDS } from '@/lib/constants'

/**
 * Budget Monitor Agent
 * Runs after any expense mutation. Checks all active budgets against their
 * current spent_amount and fires alerts when thresholds are crossed.
 * Uses server-side Supabase to read budgets and write alerts.
 * This is a lightweight rule-based agent (no LLM call needed — thresholds are deterministic).
 */
export async function runBudgetMonitor(userId: string): Promise<void> {
  try {
    const supabase = await createClient()

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`

    // Get all budgets for this period
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*, category:categories(name, icon)')
      .eq('user_id', userId)
      .eq('period_start', periodStart)

    if (budgetError || !budgets?.length) return

    // Get existing alerts for this period to avoid duplicate alerts
    const { data: existingAlerts } = await supabase
      .from('alerts')
      .select('type, metadata')
      .eq('user_id', userId)
      .eq('type', 'budget_threshold')
      .gte('created_at', `${year}-${String(month).padStart(2, '0')}-01`)

    const alertedKeys = new Set(
      (existingAlerts ?? []).map((a) => {
        const meta = a.metadata as { budget_id?: string; threshold?: number }
        return `${meta.budget_id}-${meta.threshold}`
      })
    )

    const newAlerts: {
      user_id: string
      type: string
      title: string
      message: string
      severity: 'info' | 'warning' | 'critical'
      metadata: Record<string, unknown>
    }[] = []

    for (const budget of budgets) {
      const pct = budget.limit_amount > 0
        ? Math.round((budget.spent_amount / budget.limit_amount) * 100)
        : 0

      const catName = (budget.category as { name: string; icon: string } | null)?.name ?? 'Unknown'
      const catIcon = (budget.category as { name: string; icon: string } | null)?.icon ?? '📦'

      // Check each threshold in descending order — alert for the highest breached
      for (const threshold of [...BUDGET_ALERT_THRESHOLDS].reverse()) {
        if (pct >= threshold) {
          const alertKey = `${budget.id}-${threshold}`
          if (alertedKeys.has(alertKey)) break // Already alerted for this threshold

          let severity: 'info' | 'warning' | 'critical'
          let title: string
          let message: string

          if (threshold >= 100) {
            severity = 'critical'
            title = `${catIcon} Budget Exceeded: ${catName}`
            message = `You've exceeded your ${catName} budget! Spent ${budget.spent_amount} of ${budget.limit_amount} limit (${pct}%). Consider reviewing your spending.`
          } else if (threshold >= 90) {
            severity = 'critical'
            title = `${catIcon} Almost Over Budget: ${catName}`
            message = `${catName} budget is at ${pct}% — only ${(budget.limit_amount - budget.spent_amount).toFixed(0)} remaining. Be careful!`
          } else if (threshold >= 75) {
            severity = 'warning'
            title = `${catIcon} Budget Warning: ${catName}`
            message = `${catName} spending is at ${pct}% of your monthly limit. You have ${(budget.limit_amount - budget.spent_amount).toFixed(0)} left.`
          } else {
            severity = 'info'
            title = `${catIcon} Budget Check: ${catName}`
            message = `${catName} is at ${pct}% of your monthly budget. You're halfway there — keep an eye on it.`
          }

          newAlerts.push({
            user_id: userId,
            type: 'budget_threshold',
            title,
            message,
            severity,
            metadata: { budget_id: budget.id, threshold, percentage: pct, category: catName },
          })
          break // Only alert for the highest threshold breached
        }
      }
    }

    if (newAlerts.length > 0) {
      await supabase.from('alerts').insert(newAlerts)
    }
  } catch (err) {
    // Budget monitor failures should be silent — don't break expense creation
    console.error('[BudgetMonitor]', err)
  }
}

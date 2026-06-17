import { getDashboardData, getWeeklySpending } from '@/actions/dashboard'
import { DashboardMetrics } from '@/components/dashboard/metric-cards'
import { CategoryPieChart } from '@/components/dashboard/category-pie-chart'
import { SpendingTrendChart } from '@/components/dashboard/spending-trend'
import { RecentExpenses } from '@/components/dashboard/recent-expenses'
import { BudgetUtilizationChart } from '@/components/dashboard/budget-utilization'
import { BudgetGuardianBanner } from '@/components/dashboard/budget-guardian'
import { AddExpenseDialog } from '@/components/expenses/add-expense-dialog'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/actions/auth'
import type { Expense } from '@/types/database'

export const metadata = {
  title: 'Dashboard — Cresco',
  description: 'Your AI-powered student finance dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const user = await getUser()

  const [dashData, weeklyData, budgetsData, profileData, categoriesData, latestAlertData] = await Promise.all([
    getDashboardData(),
    getWeeklySpending(),
    supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('user_id', user!.id)
      .order('spent_amount', { ascending: false })
      .limit(6),
    supabase.from('users').select('currency, full_name').eq('id', user!.id).single(),
    supabase.from('categories').select('*').eq('user_id', user!.id).order('name'),
    supabase.from('alerts').select('message').eq('user_id', user!.id).eq('is_read', false)
      .order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const dashboard = dashData.success ? dashData.data : null
  const weekly = weeklyData.success ? weeklyData.data : []
  const budgets = budgetsData.data ?? []
  const currency = profileData.data?.currency ?? 'USD'
  const userName = profileData.data?.full_name ?? 'Student'
  const categories = categoriesData.data ?? []
  const latestInsight = latestAlertData.data?.message ?? null

  // Greeting based on local time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Semester label
  const now = new Date()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const semLabel = `Semester budget · ${monthNames[now.getMonth()]}-${monthNames[(now.getMonth() + 2) % 12]} ${now.getFullYear()}`

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            {greeting}, {userName}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-primary font-semibold flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-primary pulse-teal" />
              {semLabel}
            </p>
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
              🔥 5 Day Saving Streak!
            </div>
          </div>
        </div>
        <AddExpenseDialog categories={categories} />
      </div>

      {/* Metric Cards */}
      <DashboardMetrics
        summary={dashboard?.summary ?? null}
        latestForecast={dashboard?.latestForecast as { predicted_balance: number; risk_level: string } | null | undefined}
        currency={currency}
        userName={userName}
      />

      {/* Budget Guardian Insight Banner */}
      <BudgetGuardianBanner insight={latestInsight} />

      {/* Charts Row: Forecast + Spending Breakdown */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <SpendingTrendChart
            data={weekly}
            confidence={87}
          />
        </div>
        <div className="lg:col-span-2">
          <CategoryPieChart
            data={dashboard?.categorySpending ?? []}
            totalSpent={dashboard?.summary?.total_spent}
            currency={currency}
          />
        </div>
      </div>

      {/* Budget Utilization */}
      {budgets.length > 0 && (
        <BudgetUtilizationChart budgets={budgets} />
      )}

      {/* Bottom Row: Recent Transactions */}
      <div>
        <RecentExpenses
          expenses={(dashboard?.recentExpenses as unknown as Expense[]) ?? []}
          currency={currency}
        />
      </div>
    </div>
  )
}

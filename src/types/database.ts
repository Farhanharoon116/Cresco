// ─── Database Entity Types ────────────────────────────────
export type Currency = string

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  currency: Currency
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface Income {
  id: string
  user_id: string
  amount: number
  source: string
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'irregular'
  day_of_month: number | null
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  amount: number
  category_id: string | null
  description: string | null
  merchant: string | null
  expense_date: string
  notes: string | null
  ai_categorized: boolean
  ai_confidence: number | null
  user_corrected: boolean
  created_at: string
  updated_at: string
  // Joined
  category?: Category | null
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  limit_amount: number
  spent_amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  period_start: string
  period_end: string
  status?: 'safe' | 'warning' | 'danger' | 'exceeded'
  percentage?: number
  created_at: string
  updated_at: string
  // Joined
  category?: Category | null
}

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  description: string | null
  icon: string
  target_amount: number
  current_amount: number
  target_date: string | null
  status: 'active' | 'paused' | 'completed'
  created_at: string
  updated_at: string
  // Computed
  percentage?: number
  days_remaining?: number | null
}

export interface Alert {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  is_read: boolean
  metadata: Record<string, unknown>
  created_at: string
}

export interface Forecast {
  id: string
  user_id: string
  predicted_balance: number
  avg_daily_spending: number
  remaining_days: number
  confidence: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
}

export interface MonthlyReport {
  id: string
  user_id: string
  month: number
  year: number
  total_income: number
  total_spent: number
  total_saved: number
  health_score: number
  top_categories: CategorySpending[]
  suggestions: string[]
  narrative: string | null
  created_at: string
}

export interface Recommendation {
  id: string
  user_id: string
  category: 'learn' | 'build' | 'enjoy' | 'grow'
  title: string
  description: string | null
  url: string | null
  estimated_cost: number | null
  reason: string | null
  month: number
  year: number
  is_dismissed: boolean
  created_at: string
}

export interface InterestProfile {
  id: string
  user_id: string
  interests: string[]
  updated_at: string
}

// ─── Computed / Aggregate Types ───────────────────────────

export interface DashboardSummary {
  monthly_income: number
  total_spent: number
  remaining_budget: number
  forecast_balance: number
  days_remaining: number
  total_expenses: number
}

export interface CategorySpending {
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  total_spent: number
  budget_limit: number | null
  transaction_count: number
}

// ─── AI Provider Types ────────────────────────────────────
export type AIProvider = 'groq' | 'gemini' | 'all' | 'parser'

export interface AIRequestOptions {
  preferredProvider?: 'groq' | 'gemini'
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

// ─── Agent Result Types ───────────────────────────────────

export interface CategorizationResult {
  category_name: string
  confidence: number
  merchant: string | null
  reasoning: string
}

export interface NLParseResult {
  amount: number | null
  description: string | null
  merchant: string | null
  category_name: string | null
  expense_date: string | null
  confidence: number
  raw_text: string
}

export interface ForecastResult {
  predicted_balance: number
  avg_daily_spending: number
  remaining_days: number
  confidence: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  narrative: string
}

export interface AnomalyItem {
  expense_id: string
  description: string
  reason: string
  severity: 'info' | 'warning' | 'critical'
  amount: number
}

export interface AnomalyResult {
  is_anomaly: boolean
  anomalies: AnomalyItem[]
}

export interface ReportResult {
  total_income: number
  total_spent: number
  total_saved: number
  health_score: number
  top_categories: { name: string; amount: number; percentage: number }[]
  spending_summary: {
    highest_category: string
    best_category: string
    over_budget_categories: string[]
    savings_rate_percentage: string | number
  }
  suggestions: string[]
  narrative: string
}

export interface RecommendationItem {
  category: 'learn' | 'build' | 'enjoy' | 'grow'
  title: string
  description: string
  url: string
  estimated_cost: number
  reason: string
}

export interface RecommendationResult {
  recommendations: RecommendationItem[]
}

export interface FinancialCoachResult {
  health_score: number
  summary: string
  key_findings: string[]
  action_items: string[]
  anomalies: AnomalyItem[]
  forecast: ForecastResult
  recommendations: RecommendationItem[]
}

// ─── Chat Types ───────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isStreaming?: boolean
}

// ─── Action Result Types ──────────────────────────────────
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code: string; fieldErrors?: Record<string, string[]> }

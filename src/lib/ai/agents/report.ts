import { callAI, parseAIJson } from '../provider'
import type { ReportResult } from '@/types/ai'

const REPORT_SYSTEM = `You are a financial health analyst AI for Cresco, a student finance app.
Generate comprehensive monthly financial reports with actionable insights.
Be encouraging but honest. Use student-appropriate language. Respond with valid JSON.`

export async function generateMonthlyReport(context: {
  month: number
  year: number
  monthly_income: number
  total_spent: number
  spending_by_category: Array<{ name: string; spent: number; limit: number; count: number }>
  top_expenses: Array<{ amount: number; description: string; category: string; date: string }>
  savings_goals: Array<{ name: string; target: number; current: number }>
  currency: string
}): Promise<ReportResult> {
  const total_saved = context.monthly_income - context.total_spent
  const savings_rate = context.monthly_income > 0
    ? ((total_saved / context.monthly_income) * 100).toFixed(1)
    : '0'

  const userPrompt = `
Monthly Financial Report — ${context.month}/${context.year}
Currency: ${context.currency}

Income: ${context.monthly_income}
Total Spent: ${context.total_spent}
Saved: ${total_saved} (${savings_rate}% savings rate)

Spending by category:
${JSON.stringify(context.spending_by_category, null, 2)}

Top 5 expenses:
${JSON.stringify(context.top_expenses, null, 2)}

Savings goals:
${JSON.stringify(context.savings_goals, null, 2)}

Generate a comprehensive report. Respond with JSON:
{
  "total_income": ${context.monthly_income},
  "total_spent": ${context.total_spent},
  "total_saved": ${total_saved},
  "health_score": 72,
  "top_categories": [
    { "name": "Food", "amount": 2000, "percentage": 40 }
  ],
  "spending_summary": {
    "highest_category": "Food & Dining",
    "best_category": "Transport",
    "over_budget_categories": ["Shopping"],
    "savings_rate_percentage": ${savings_rate}
  },
  "suggestions": [
    "Reduce food spending by cooking at home 2x per week",
    "Cancel unused subscriptions to save 500/month",
    "Set aside 10% of income on payday automatically"
  ],
  "narrative": "3-4 sentence summary of the month written directly to the student"
}

Health score (0-100):
- Start at 50
- +20 if savings rate > 20%
- +10 if savings rate > 10%
- +10 if no categories exceeded budget
- -10 for each category over budget
- +10 if savings goal progress made
- -5 for each anomaly detected`

  const raw = await callAI(REPORT_SYSTEM, userPrompt, {
    preferredProvider: 'gemini',
    jsonMode: true,
    temperature: 0.4,
    maxTokens: 1024,
  })

  return parseAIJson<ReportResult>(raw)
}

import { callAI, parseAIJson } from '../provider'
import { generateForecast } from './forecast'
import { detectAnomalies } from './anomaly'
import { generateRecommendations } from './recommend'
import type { FinancialCoachResult } from '@/types/ai'

const COACH_SYSTEM = `You are Cresco's AI Financial Coach — a knowledgeable, encouraging personal finance advisor for students.
You synthesize data from multiple analyses to produce a comprehensive financial health summary.
Be direct, specific, and actionable. Use student-friendly language. Respond with valid JSON.`

export async function runFinancialCoach(context: {
  monthly_income: number
  total_spent: number
  days_elapsed: number
  days_remaining: number
  spending_by_category: Array<{ name: string; spent: number; limit: number; count: number }>
  recent_expenses: Array<{ id: string; amount: number; description: string; merchant: string | null; category: string; date: string }>
  avg_by_category: Record<string, number>
  savings_goals: Array<{ name: string; target: number; current: number }>
  interests: string[]
  currency: string
}): Promise<FinancialCoachResult> {
  // Run sub-agents in parallel for speed
  const [forecastResult, anomalyResult] = await Promise.all([
    generateForecast({
      monthly_income: context.monthly_income,
      total_spent_so_far: context.total_spent,
      days_elapsed: context.days_elapsed,
      days_remaining: context.days_remaining,
      spending_by_category: context.spending_by_category,
      currency: context.currency,
    }),
    detectAnomalies({
      expenses: context.recent_expenses,
      avg_amount_by_category: context.avg_by_category,
      currency: context.currency,
    }),
  ])

  const savings_amount = Math.max(0, context.monthly_income - context.total_spent)

  const recResult = await generateRecommendations({
    savings_amount,
    interests: context.interests,
    goals: context.savings_goals,
    spending_behavior: `Spent ${context.total_spent} of ${context.monthly_income} income in ${context.days_elapsed} days`,
    currency: context.currency,
  })

  // Generate the synthesis
  const userPrompt = `
Student financial overview:
- Income: ${context.monthly_income} ${context.currency}
- Spent: ${context.total_spent} ${context.currency}
- Forecast end balance: ${forecastResult.predicted_balance} ${context.currency}
- Risk level: ${forecastResult.risk_level}
- Anomalies found: ${anomalyResult.anomalies.length}
- Category breakdown: ${JSON.stringify(context.spending_by_category)}
- Goals: ${JSON.stringify(context.savings_goals)}

Generate a financial coach summary. Respond with JSON:
{
  "health_score": 72,
  "summary": "2-3 sentence honest but encouraging overview of this student's financial situation",
  "key_findings": [
    "You spent 45% of your budget on food — above the recommended 30%",
    "You have no overspent budgets this month — great discipline!",
    "Your forecast shows you'll have 2,400 PKR remaining at month end"
  ],
  "action_items": [
    "Reduce food spending by 500/week by meal prepping",
    "Set up automatic savings transfer on payday",
    "Review your subscriptions — 2 may be unused"
  ]
}

Key findings: 3-5 specific, data-backed observations.
Action items: 3-5 concrete steps the student can take this week.`

  const raw = await callAI(COACH_SYSTEM, userPrompt, {
    preferredProvider: 'gemini',
    jsonMode: true,
    temperature: 0.4,
    maxTokens: 1024,
  })

  const synthesis = parseAIJson<{ health_score: number; summary: string; key_findings: string[]; action_items: string[] }>(raw)

  return {
    ...synthesis,
    anomalies: anomalyResult.anomalies,
    forecast: forecastResult,
    recommendations: recResult.recommendations,
  }
}

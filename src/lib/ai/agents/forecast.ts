import { callAI, parseAIJson } from '../provider'
import type { ForecastResult } from '@/types/ai'

const FORECAST_SYSTEM = `You are a financial forecasting AI for Cresco, a student finance app.
Analyze spending patterns and generate accurate end-of-month balance forecasts.
Be realistic and data-driven. Respond with valid JSON only.`

export async function generateForecast(context: {
  monthly_income: number
  total_spent_so_far: number
  days_elapsed: number
  days_remaining: number
  spending_by_category: Array<{ name: string; spent: number; limit: number }>
  currency: string
}): Promise<ForecastResult> {
  const avg_daily = context.days_elapsed > 0
    ? context.total_spent_so_far / context.days_elapsed
    : 0
  const projected_additional = avg_daily * context.days_remaining
  const simple_forecast = context.monthly_income - context.total_spent_so_far - projected_additional

  const userPrompt = `
Financial data:
- Monthly income: ${context.monthly_income} ${context.currency}
- Spent so far: ${context.total_spent_so_far} ${context.currency}
- Days elapsed: ${context.days_elapsed}
- Days remaining: ${context.days_remaining}
- Avg daily spending: ${avg_daily.toFixed(2)} ${context.currency}
- Simple forecast balance: ${simple_forecast.toFixed(2)} ${context.currency}
- Spending by category: ${JSON.stringify(context.spending_by_category)}

Generate a forecast and respond with JSON:
{
  "predicted_balance": ${simple_forecast.toFixed(2)},
  "avg_daily_spending": ${avg_daily.toFixed(2)},
  "remaining_days": ${context.days_remaining},
  "confidence": 0.82,
  "risk_level": "low|medium|high|critical",
  "narrative": "2-sentence plain English explanation of the forecast"
}

Risk levels:
- low: predicted_balance >= 20% of income
- medium: predicted_balance between 5-20% of income
- high: predicted_balance between 0-5% of income
- critical: predicted_balance < 0`

  const raw = await callAI(FORECAST_SYSTEM, userPrompt, {
    preferredProvider: 'gemini',
    jsonMode: true,
    temperature: 0.2,
    maxTokens: 512,
  })

  return parseAIJson<ForecastResult>(raw)
}

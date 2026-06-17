import { callAI, parseAIJson } from '../provider'
import type { AnomalyResult } from '@/types/ai'

const ANOMALY_SYSTEM = `You are an anomaly detection AI for Cresco, a student finance app.
Analyze expense history to find unusual spending patterns, spikes, or suspicious transactions.
Be precise — only flag genuine anomalies, not normal spending. Respond with valid JSON.`

export async function detectAnomalies(context: {
  expenses: Array<{
    id: string
    amount: number
    description: string
    merchant: string | null
    category: string
    date: string
  }>
  avg_amount_by_category: Record<string, number>
  currency: string
}): Promise<AnomalyResult> {
  if (context.expenses.length < 3) {
    return { is_anomaly: false, anomalies: [] }
  }

  const userPrompt = `
Recent expenses (last 30 days):
${JSON.stringify(context.expenses, null, 2)}

Average amounts by category:
${JSON.stringify(context.avg_amount_by_category, null, 2)}

Currency: ${context.currency}

Detect anomalies and respond with JSON:
{
  "is_anomaly": true,
  "anomalies": [
    {
      "expense_id": "uuid-here",
      "description": "KFC purchase",
      "reason": "3x higher than usual food spending",
      "severity": "warning",
      "amount": 1500
    }
  ]
}

Flag as anomaly if:
- Amount is 3x+ above category average
- Spending spike in a single day (50%+ of weekly budget)
- Duplicate transactions (same amount + merchant within 24h)
- Unusually large single transaction for a student

Severity: info (1.5-2x normal), warning (2-3x normal), critical (3x+ or potential duplicate)`

  const raw = await callAI(ANOMALY_SYSTEM, userPrompt, {
    preferredProvider: 'groq',
    jsonMode: true,
    temperature: 0.1,
    maxTokens: 512,
  })

  return parseAIJson<AnomalyResult>(raw)
}

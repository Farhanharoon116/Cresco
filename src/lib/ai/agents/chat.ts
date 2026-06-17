import { streamAI } from '../provider'

const CHAT_SYSTEM = `You are Cresco's AI Finance Assistant — a knowledgeable, friendly personal finance coach for students.
You have access to the student's real financial data and must use it to give specific, accurate answers.
Rules:
- Always reference actual numbers from the user's data
- Be encouraging and student-friendly, not condescending
- Give specific, actionable advice
- If asked about investments or financial products, remind the user these are educational suggestions only
- Keep responses concise (3-5 sentences) unless the user asks for detailed analysis
- Use the user's currency symbol when mentioning amounts`

export async function streamChatResponse(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  financialContext: {
    monthly_income: number
    total_spent: number
    remaining_budget: number
    forecast_balance: number
    currency: string
    top_categories: Array<{ name: string; spent: number }>
    active_goals: Array<{ name: string; target: number; current: number }>
    recent_alerts: Array<{ title: string; severity: string }>
    health_score?: number
  }
): Promise<AsyncGenerator<string>> {
  const contextBlock = `
=== Student's Current Financial Data ===
Currency: ${financialContext.currency}
Monthly Income: ${financialContext.monthly_income}
Total Spent This Month: ${financialContext.total_spent}
Remaining Budget: ${financialContext.remaining_budget}
Forecast End Balance: ${financialContext.forecast_balance}
Financial Health Score: ${financialContext.health_score ?? 'Not yet calculated'}/100

Top Spending Categories:
${financialContext.top_categories.map(c => `- ${c.name}: ${c.spent}`).join('\n')}

Active Savings Goals:
${financialContext.active_goals.map(g => `- ${g.name}: ${g.current}/${g.target} (${Math.round((g.current / g.target) * 100)}%)`).join('\n') || 'No active goals'}

Recent Alerts:
${financialContext.recent_alerts.map(a => `- [${a.severity.toUpperCase()}] ${a.title}`).join('\n') || 'No recent alerts'}
=== End Financial Data ===

Conversation history:
${history.map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`).join('\n')}
`

  const fullPrompt = `${contextBlock}\n\nStudent's question: ${userMessage}`

  return streamAI(CHAT_SYSTEM, fullPrompt)
}

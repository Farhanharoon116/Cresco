import { callAI, parseAIJson } from '../provider'
import type { RecommendationResult } from '@/types/ai'

const RECOMMEND_SYSTEM = `You are a personalized savings opportunity AI for Cresco, a student finance app.
Based on a student's savings amount, interests, and behavior, suggest what they can do with their savings.
Focus on Learn, Build, Enjoy, and Grow categories.
IMPORTANT: These are educational suggestions, NOT financial advice.
Keep costs realistic for students. Respond with valid JSON.`

export async function generateRecommendations(context: {
  savings_amount: number
  interests: string[]
  goals: Array<{ name: string; target: number; current: number }>
  spending_behavior: string
  currency: string
}): Promise<RecommendationResult> {
  const userPrompt = `
Student's savings this month: ${context.savings_amount} ${context.currency}
Interests: ${context.interests.join(', ') || 'general'}
Current goals: ${JSON.stringify(context.goals)}
Spending behavior note: ${context.spending_behavior}

Suggest 6-8 opportunities across categories. Respond with JSON:
{
  "recommendations": [
    {
      "category": "learn",
      "title": "React & Next.js Masterclass",
      "description": "Master modern full-stack development with hands-on projects",
      "url": "https://www.udemy.com",
      "estimated_cost": 1200,
      "reason": "Matches your programming interest and fits your savings"
    },
    {
      "category": "build",
      "title": "Get a .dev domain for your portfolio",
      "description": "Establish your developer brand with a professional domain",
      "url": "https://domains.google",
      "estimated_cost": 800,
      "reason": "Great investment for a developer building their portfolio"
    },
    {
      "category": "enjoy",
      "title": "Minecraft Java Edition",
      "description": "Explore creativity in one of the best-selling games ever",
      "url": "https://minecraft.net",
      "estimated_cost": 2500,
      "reason": "You enjoy gaming and have enough saved for this"
    },
    {
      "category": "grow",
      "title": "Open a student savings account",
      "description": "Many banks offer zero-fee accounts with interest for students",
      "url": "https://www.nerdwallet.com",
      "estimated_cost": 0,
      "reason": "Grow your money safely with zero risk"
    }
  ]
}

Rules:
- Only suggest items the student can ACTUALLY afford with their savings
- Match to their specific interests
- Mix practical (learn/build) with fun (enjoy) and future-oriented (grow)
- Use real, actual websites and platforms
- Include the disclaimer context in recommendations`

  const raw = await callAI(RECOMMEND_SYSTEM, userPrompt, {
    preferredProvider: 'gemini',
    jsonMode: true,
    temperature: 0.6,
    maxTokens: 1500,
  })

  return parseAIJson<RecommendationResult>(raw)
}

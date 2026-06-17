import Groq from 'groq-sdk'
import { GROQ_MODEL } from '@/lib/constants'
import { AIProviderError } from '@/lib/errors'

let groqClient: Groq | null = null

export function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) throw new AIProviderError('GROQ_API_KEY is not set', 'groq')
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return groqClient
}

export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number; jsonMode?: boolean } = {}
): Promise<string> {
  const client = getGroqClient()
  try {
    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 1024,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    })
    return response.choices[0]?.message?.content ?? ''
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    if (e?.status === 429) throw new AIProviderError('Groq rate limit exceeded', 'groq', true)
    throw new AIProviderError(e?.message ?? 'Groq call failed', 'groq')
  }
}

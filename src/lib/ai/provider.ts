import { callGroq } from './groq'
import { callGemini, callGeminiStream } from './gemini'
import { AIProviderError } from '@/lib/errors'
import { sleep, MAX_RETRIES, RETRY_DELAY_MS } from '@/lib/constants'
import type { AIRequestOptions, AIProvider } from '@/types/ai'

// Re-export constants needed by other modules
export { MAX_RETRIES, RETRY_DELAY_MS }

/**
 * Unified AI call with automatic fallback:
 * - Groq-preferred tasks: try Groq first, fall back to Gemini
 * - Gemini-preferred tasks: try Gemini first, fall back to Groq
 * - Both fail: throw AIProviderError
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options: AIRequestOptions = {}
): Promise<string> {
  const preferred = options.preferredProvider ?? 'groq'
  const providers: AIProvider[] = preferred === 'groq'
    ? ['groq', 'gemini']
    : ['gemini', 'groq']

  let lastError: unknown

  for (const provider of providers) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (provider === 'groq') {
          return await callGroq(systemPrompt, userPrompt, options)
        } else {
          return await callGemini(systemPrompt, userPrompt, options)
        }
      } catch (err) {
        lastError = err
        if (err instanceof AIProviderError && err.isRateLimit) {
          // Rate limited — try next provider immediately, no retry
          break
        }
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * (attempt + 1))
        }
      }
    }
  }

  throw lastError ?? new AIProviderError('All AI providers failed', 'all')
}

/**
 * Parse JSON from AI response — handles markdown code blocks
 */
export function parseAIJson<T>(raw: string): T {
  try {
    // Attempt to extract JSON object or array from the raw string
    const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    const cleaned = match ? match[0] : raw
    return JSON.parse(cleaned) as T
  } catch {
    throw new AIProviderError(
      `Failed to parse AI response as JSON: ${raw.slice(0, 100)}`,
      'parser'
    )
  }
}

/**
 * Streaming AI call — always uses Gemini (supports streaming natively)
 */
export async function streamAI(
  systemPrompt: string,
  userPrompt: string
): Promise<AsyncGenerator<string>> {
  return callGeminiStream(systemPrompt, userPrompt)
}

import { GoogleGenerativeAI, Tool } from '@google/generative-ai'
import { GEMINI_MODEL, GEMINI_SEARCH_MODEL } from '@/lib/constants'
import { AIProviderError } from '@/lib/errors'

let geminiClient: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) throw new AIProviderError('GEMINI_API_KEY is not set', 'gemini')
  if (!geminiClient) geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return geminiClient
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number; jsonMode?: boolean } = {}
): Promise<string> {
  const client = getGeminiClient()
  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 1024,
        ...(options.jsonMode
          ? { responseMimeType: 'application/json' }
          : {}),
      },
    })
    const result = await model.generateContent(userPrompt)
    return result.response.text()
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string; toString?: () => string }
    const msg = e?.message ?? e?.toString?.() ?? 'Gemini call failed'
    if (msg.includes('429') || msg.includes('quota')) {
      throw new AIProviderError('Gemini quota exceeded', 'gemini', true)
    }
    throw new AIProviderError(msg, 'gemini')
  }
}

export async function callGeminiStream(
  systemPrompt: string,
  userPrompt: string
): Promise<AsyncGenerator<string>> {
  const client = getGeminiClient()
  const model = client.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
  })
  const result = await model.generateContentStream(userPrompt)
  return (async function* () {
    for await (const chunk of result.stream) {
      yield chunk.text()
    }
  })()
}

/**
 * Call Gemini with Google Search grounding — returns real web search results.
 * Uses gemini-2.5-flash-lite with dynamic retrieval for real-time information.
 */
export async function callGeminiWithSearch(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<{ text: string; groundingChunks?: Array<{ web?: { uri: string; title: string } }> }> {
  const client = getGeminiClient()
  try {
    const model = client.getGenerativeModel({
      model: GEMINI_SEARCH_MODEL,
      systemInstruction: systemPrompt,
      tools: [{ googleSearch: {} } as unknown as Tool],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 2048,
      },
    })
    const result = await model.generateContent(userPrompt)
    const response = result.response
    const text = response.text()
    const chunks = (response.candidates?.[0]?.groundingMetadata as { groundingChunks?: Array<{ web?: { uri: string; title: string } }> } | undefined)?.groundingChunks ?? []
    return { text, groundingChunks: chunks }
  } catch (err: unknown) {
    const e = err as { message?: string; toString?: () => string }
    const msg = e?.message ?? e?.toString?.() ?? 'Gemini search call failed'
    console.error('[callGeminiWithSearch] fallback:', msg)
    // Gracefully fall back to standard call without grounding
    const text = await callGemini(systemPrompt, userPrompt, options)
    return { text }
  }
}

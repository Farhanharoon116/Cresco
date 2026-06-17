import { callAI, parseAIJson } from '../provider'
import type { CategorizationResult, NLParseResult } from '@/types/ai'

const CATEGORIZE_SYSTEM = `You are an AI expense categorization assistant for a student finance app called Cresco.
Your job is to categorize expenses and extract merchant names from descriptions.
Always respond with valid JSON. Be precise and consistent.`

const NL_PARSE_SYSTEM = `You are an AI assistant that extracts expense information from natural language.
The user will describe a purchase in plain text. Extract structured data.
Always respond with valid JSON. If a field cannot be determined, use null.
Today's date for reference: ${new Date().toISOString().split('T')[0]}`

/**
 * Categorize a single expense description into one of the user's categories
 */
export async function categorizeExpense(
  description: string,
  merchant: string | null,
  availableCategories: string[]
): Promise<CategorizationResult> {
  const userPrompt = `
Expense description: "${description}"
Merchant: "${merchant ?? 'unknown'}"
Available categories: ${JSON.stringify(availableCategories)}

Respond with JSON:
{
  "category_name": "one of the available categories",
  "confidence": 0.95,
  "merchant": "cleaned merchant name or null",
  "reasoning": "brief explanation"
}

If no category fits well, pick the closest one. Never return a category not in the list.`

  const raw = await callAI(CATEGORIZE_SYSTEM, userPrompt, {
    preferredProvider: 'groq',
    jsonMode: true,
    temperature: 0.1,
    maxTokens: 256,
  })

  return parseAIJson<CategorizationResult>(raw)
}

/**
 * Parse natural language expense input
 * e.g. "Spent 450 on KFC yesterday" → { amount: 450, merchant: "KFC", ... }
 */
export async function parseNaturalLanguage(text: string): Promise<NLParseResult> {
  const userPrompt = `
User said: "${text}"

Extract expense information and respond with JSON:
{
  "amount": 450.00,
  "description": "KFC meal",
  "merchant": "KFC",
  "category_name": "Food & Dining",
  "expense_date": "2024-01-15",
  "confidence": 0.92,
  "raw_text": "${text}"
}

Rules:
- amount must be a positive number, or null if not found
- expense_date must be YYYY-MM-DD format, use today if "today" mentioned, or null if unclear
- category_name should be one of: Food & Dining, Transport, Shopping, Education, Entertainment, Subscriptions, Health, Other`

  const raw = await callAI(NL_PARSE_SYSTEM, userPrompt, {
    preferredProvider: 'groq',
    jsonMode: true,
    temperature: 0.1,
    maxTokens: 300,
  })

  return parseAIJson<NLParseResult>(raw)
}

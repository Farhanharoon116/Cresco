import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/actions/auth'
import { callGeminiWithSearch } from '@/lib/ai/gemini'
import { parseAIJson } from '@/lib/ai/provider'
import { getDashboardData } from '@/actions/dashboard'

const DISCOVER_SYSTEM = `You are Cresco's Discover AI — a personalized learning and resource discovery engine for students.
Your job is to find REAL, CURRENT courses, books, tools, and communities based on a student's interests and budget.
Use Google Search to find actual, up-to-date resources with real prices and links.
IMPORTANT: Always return valid JSON. Never make up URLs — only return real, verified links from your search results.
Focus on free and affordable options first. Be specific and actionable.`

export interface DiscoverItem {
  id: string
  type: 'course' | 'book' | 'tool' | 'community' | 'game'
  title: string
  description: string
  platform: string
  url: string
  price: string
  free: boolean
  tags: string[]
  rating?: string
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { interests: requestedInterests, filter = 'all' } = body

    // Get user interests from DB
    const [interestsRes, profileRes] = await Promise.all([
      supabase.from('interest_profiles').select('interests').eq('user_id', user.id).single(),
      supabase.from('users').select('currency').eq('id', user.id).single(),
    ])

    const interests: string[] = requestedInterests ?? interestsRes.data?.interests ?? ['programming', 'finance']
    const currency = profileRes.data?.currency ?? 'USD'

    const dashData = await getDashboardData()
    const availableBudget = dashData.success ? dashData.data.summary.remaining_budget : 100

    // Build search query based on interests
    const interestList = interests.slice(0, 5).join(', ')
    const filterNote = filter === 'free' ? 'Focus on FREE resources only.' :
      filter === 'paid' ? `Include premium/paid resources. Must be UNDER ${availableBudget} ${currency}.` :
      filter === 'books' ? `Focus on books and reading materials under ${availableBudget} ${currency}.` :
      filter === 'courses' ? `Focus on online courses and tutorials under ${availableBudget} ${currency}.` :
      filter === 'tools' ? `Focus on software tools and apps under ${availableBudget} ${currency}.` :
      filter === 'games' ? `Focus on educational or relevant games under ${availableBudget} ${currency}.` :
      filter === 'communities' ? `Focus on free or paid communities/forums under ${availableBudget} ${currency}.` : ''

    const userPrompt = `
Student interests: ${interestList}
Currency preference: ${currency}
Available Budget: ${availableBudget} ${currency}
Filter: ${filterNote || 'Mix of all types'}

Using Google Search, find 8-12 REAL, CURRENT learning resources for a student interested in: ${interestList}

CRITICAL RULES:
1. RANDOM & DIVERSE: Surprise me with highly diverse, lesser-known, yet high-quality resources. Don't just list the top 5 most obvious hits.
2. CURRENCY: Convert ALL prices to ${currency}. Display prices with the currency symbol (e.g., "$15" or "€12").
3. BUDGET: The student ONLY has ${availableBudget} ${currency} available. If you recommend PAID options, they MUST cost LESS than ${availableBudget} ${currency}. Do NOT recommend expensive options they cannot afford.
4. VALID LINKS: Only include resources with REAL, WORKING URLs from search results.

Search for actual courses (Coursera, Udemy, edX, YouTube), real books (Amazon, Open Library), games (Steam, itch.io), tools, apps, and communities (Discord, Reddit).

Return ONLY valid JSON in this exact format:
{
  "items": [
    {
      "id": "unique_id_1",
      "type": "course",
      "title": "Python for Everybody",
      "description": "Learn Python programming from scratch with Dr. Chuck. Covers variables, data structures, web APIs.",
      "platform": "Coursera",
      "url": "https://www.coursera.org/specializations/python",
      "price": "Free to audit",
      "free": true,
      "tags": ["programming", "python", "beginner"],
      "rating": "4.8/5"
    }
  ],
  "search_summary": "Found X resources matching your interests in ${interestList}"
}

Rules:
- Only include resources with REAL, WORKING URLs from search results
- Mix types: courses, books, tools, communities, games
- Prioritize high-quality, well-known platforms
- Include both free and affordable paid options
- Match difficulty to a student level
- Always return valid JSON only.`

    const { text, groundingChunks } = await callGeminiWithSearch(
      DISCOVER_SYSTEM,
      userPrompt,
      { temperature: 0.9, maxTokens: 3000 }
    )

    const parsed = parseAIJson<{ items: DiscoverItem[]; search_summary: string }>(text)

    // Add IDs if missing
    const items = parsed.items.map((item, i) => ({
      ...item,
      id: item.id || `discover_${i}_${Date.now()}`,
    }))

    return NextResponse.json({
      success: true,
      data: {
        items,
        search_summary: parsed.search_summary,
        interests,
        sources: groundingChunks?.slice(0, 5).map((c) => c.web).filter(Boolean) ?? [],
        budget_context: { amount: availableBudget, currency }
      },
    })
  } catch (err: unknown) {
    console.error('[/api/ai/discover]', err)

    const e = err as { isRateLimit?: boolean; provider?: string; message?: string } | undefined

    if (e?.isRateLimit || e?.provider === 'parser' || e?.message?.includes('503') || e?.message?.includes('high demand') || e?.message?.includes('overloaded') || e?.message?.includes('Failed to parse')) {
      return NextResponse.json({
        success: true,
        data: {
          items: [
            {
              id: 'mock_1',
              type: 'course',
              title: 'CS50: Introduction to Computer Science',
              description: "Harvard University's introduction to the intellectual enterprises of computer science and the art of programming.",
              platform: 'edX',
              url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
              price: 'Free to audit',
              free: true,
              tags: ['programming', 'computer science']
            },
            {
              id: 'mock_2',
              type: 'book',
              title: 'The Psychology of Money',
              description: "Timeless lessons on wealth, greed, and happiness. Doing well with money isn't necessarily about what you know.",
              platform: 'Amazon',
              url: 'https://www.amazon.com/Psychology-Money-Timeless-lessons-happiness/dp/0857197681',
              price: `~15 USD`,
              free: false,
              tags: ['finance', 'psychology']
            },
            {
              id: 'mock_3',
              type: 'tool',
              title: 'Notion',
              description: 'The all-in-one workspace for your notes, tasks, wikis, and databases.',
              platform: 'Notion',
              url: 'https://www.notion.so/',
              price: 'Free plan',
              free: true,
              tags: ['productivity', 'organization']
            }
          ],
          search_summary: "AI services are currently experiencing high demand. Showing a curated selection of fallback resources instead.",
          interests: ['programming', 'finance'],
          sources: [],
          budget_context: { amount: 100, currency: 'USD' }
        },
      })
    }

    return NextResponse.json({ error: 'Discovery search failed. Please try again.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categorizeExpense, parseNaturalLanguage } from '@/lib/ai/agents/categorize'
import { chatMessageSchema } from '@/lib/validators'
import { getUser } from '@/actions/auth'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { type, description, merchant, text } = body

    // Get user's categories
    const { data: categories } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', user.id)

    const categoryNames = (categories ?? []).map((c) => c.name)

    if (type === 'nl') {
      // Natural language parsing
      const nlResult = await parseNaturalLanguage(text)
      return NextResponse.json({ success: true, data: nlResult })
    } else {
      // Direct categorization
      const result = await categorizeExpense(description, merchant, categoryNames)
      return NextResponse.json({ success: true, data: result })
    }
  } catch (err) {
    console.error('[/api/ai/categorize]', err)
    return NextResponse.json({ error: 'AI categorization failed' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamChatResponse } from '@/lib/ai/agents/chat'
import { chatMessageSchema } from '@/lib/validators'
import { getUser } from '@/actions/auth'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = chatMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Get user's financial context in parallel
    const [profileRes, summaryRes, goalsRes, alertsRes, topCatRes] = await Promise.all([
      supabase.from('users').select('currency').eq('id', user.id).single(),
      supabase.rpc('get_dashboard_summary', { p_user_id: user.id }),
      supabase.from('savings_goals').select('name, target_amount, current_amount').eq('user_id', user.id).eq('status', 'active'),
      supabase.from('alerts').select('title, severity').eq('user_id', user.id).eq('is_read', false).limit(5),
      supabase.from('expenses').select('category:categories(name), amount').eq('user_id', user.id)
        .gte('expense_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
        .order('amount', { ascending: false }).limit(20),
    ])

    const summary = summaryRes.data as Record<string, number> | null
    const currency = profileRes.data?.currency ?? 'USD'

    // Aggregate top categories
    const catTotals: Record<string, number> = {}
    for (const e of topCatRes.data ?? []) {
      const name = (e.category as unknown as { name: string } | null)?.name ?? 'Other'
      catTotals[name] = (catTotals[name] ?? 0) + Number(e.amount)
    }
    const topCategories = Object.entries(catTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, spent]) => ({ name, spent }))

    // Get latest forecast
    const { data: forecastData } = await supabase
      .from('forecasts')
      .select('predicted_balance, health_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const financialContext = {
      monthly_income: summary?.monthly_income ?? 0,
      total_spent: summary?.total_spent ?? 0,
      remaining_budget: summary?.remaining_budget ?? 0,
      forecast_balance: summary?.forecast_balance ?? forecastData?.predicted_balance ?? 0,
      currency,
      top_categories: topCategories,
      active_goals: (goalsRes.data ?? []).map((g) => ({
        name: g.name,
        target: g.target_amount,
        current: g.current_amount,
      })),
      recent_alerts: (alertsRes.data ?? []).map((a) => ({
        title: a.title,
        severity: a.severity,
      })),
      health_score: forecastData ? undefined : undefined,
    }

    // Stream response
    const stream = await streamChatResponse(
      parsed.data.message,
      parsed.data.history,
      financialContext
    )

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk))
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    console.error('[/api/ai/chat]', err)
    return NextResponse.json({ error: 'Chat failed. Please try again.' }, { status: 500 })
  }
}

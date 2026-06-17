import { createClient } from '@/lib/supabase/server'
import { ReportsClient } from '@/components/reports/reports-client'
import { getUser } from '@/actions/auth'

export default async function ReportsPage() {
  const supabase = await createClient()
  const user = await getUser()

  const [{ data: reports }, { data: recommendations }, profileData] = await Promise.all([
    supabase
      .from('monthly_reports')
      .select('*')
      .eq('user_id', user!.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false }),
    supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(12),
    supabase.from('users').select('currency').eq('id', user!.id).single(),
  ])

  const currency = profileData.data?.currency ?? 'USD'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports & Insights</h2>
        <p className="text-muted-foreground text-sm">Monthly summaries, health scores, and personalized savings opportunities.</p>
      </div>
      <ReportsClient reports={reports ?? []} recommendations={recommendations ?? []} currency={currency} />
    </div>
  )
}

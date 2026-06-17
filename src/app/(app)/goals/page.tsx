import { getGoals } from '@/actions/goals'
import { GoalsManager } from '@/components/goals/goals-manager'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/actions/auth'

export default async function GoalsPage() {
  const supabase = await createClient()
  const user = await getUser()

  const [goalsRes, profileData] = await Promise.all([
    getGoals(),
    supabase.from('users').select('currency').eq('id', user!.id).single(),
  ])
  const goals = goalsRes.success ? goalsRes.data : []
  const currency = profileData.data?.currency ?? 'USD'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Savings Goals</h2>
        <p className="text-muted-foreground text-sm">Set targets and track your progress toward what matters.</p>
      </div>
      <GoalsManager goals={goals} currency={currency} />
    </div>
  )
}

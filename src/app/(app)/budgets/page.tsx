import { createClient } from '@/lib/supabase/server'
import { getBudgets } from '@/actions/budgets'
import { BudgetManager } from '@/components/budgets/budget-manager'
import { getUser } from '@/actions/auth'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const user = await getUser()

  const [budgetsRes, categoriesRes, profileData] = await Promise.all([
    getBudgets(),
    supabase.from('categories').select('*').eq('user_id', user!.id).order('name'),
    supabase.from('users').select('currency').eq('id', user!.id).single(),
  ])

  const budgets = budgetsRes.success ? budgetsRes.data : []
  const categories = categoriesRes.data ?? []
  const currency = profileData.data?.currency ?? 'USD'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Budgets</h2>
        <p className="text-muted-foreground text-sm">Set limits per category. AI alerts fire automatically.</p>
      </div>
      <BudgetManager budgets={budgets} categories={categories} currency={currency} />
    </div>
  )
}

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
  let categories = categoriesRes.data ?? []

  // Deduplicate fetched categories to prevent UI duplicates
  const uniqueCategoriesMap = new Map()
  categories.forEach(c => {
    if (!uniqueCategoriesMap.has(c.name)) uniqueCategoriesMap.set(c.name, c)
  })
  categories = Array.from(uniqueCategoriesMap.values())

  const currency = profileData.data?.currency ?? 'USD'

  const { DEFAULT_CATEGORIES } = await import('@/lib/constants')
  const existingNames = categories.map(c => c.name)
  const toInsert = DEFAULT_CATEGORIES.filter(c => !existingNames.includes(c.name)).map(c => ({
    user_id: user!.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    is_default: true
  }))

  if (toInsert.length > 0) {
    const { data: inserted } = await supabase.from('categories').insert(toInsert).select()
    if (inserted) {
      categories = [...categories, ...inserted].sort((a, b) => a.name.localeCompare(b.name))
    }
  }

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

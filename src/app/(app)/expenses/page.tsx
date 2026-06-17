import { createClient } from '@/lib/supabase/server'
import { AddExpenseDialog } from '@/components/expenses/add-expense-dialog'
import { ExpenseTable } from '@/components/expenses/expense-table'
import { RecurringExpensesManager } from '@/components/expenses/recurring-expenses-manager'
import { ExportCsvButton } from '@/components/expenses/export-csv-button'
import { getExpenses } from '@/actions/expenses'
import { getRecurringExpenses } from '@/actions/recurring-expenses'
import { getUser } from '@/actions/auth'

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const supabase = await createClient()
  const user = await getUser()
  
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const limit = 50
  const offset = (page - 1) * limit

  const [categoriesRes, expensesRes, recurringRes, profileData] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', user!.id).order('name'),
    getExpenses({ limit, offset }),
    getRecurringExpenses(),
    supabase.from('users').select('currency').eq('id', user!.id).single(),
  ])

  const categories = categoriesRes.data ?? []
  const { expenses = [], total = 0 } = expensesRes.success ? expensesRes.data : {}
  const currency = profileData.data?.currency ?? 'USD'
  const recurring = recurringRes.success ? recurringRes.data : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Expenses</h2>
          <p className="text-muted-foreground text-sm">{total} expenses this month</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportCsvButton />
          <AddExpenseDialog categories={categories} />
        </div>
      </div>
      <ExpenseTable 
        expenses={expenses} 
        categories={categories} 
        currency={currency} 
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
      />
      <hr className="border-border" />
      <RecurringExpensesManager recurring={recurring} categories={categories} />
    </div>
  )
}

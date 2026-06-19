'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createBudget, deleteBudget } from '@/actions/budgets'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'
import type { Budget, Category } from '@/types/database'

const STATUS_CONFIG = {
  safe: { label: 'On track', color: 'text-emerald-400', barColor: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  warning: { label: 'Warning', color: 'text-yellow-400', barColor: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  danger: { label: 'Danger', color: 'text-orange-400', barColor: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  exceeded: { label: 'Exceeded!', color: 'text-red-400', barColor: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

interface BudgetManagerProps {
  budgets: Budget[]
  categories: Category[]
  currency?: string
}

export function BudgetManager({ budgets, categories, currency = 'USD' }: BudgetManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [catId, setCatId] = useState('')
  const [limit, setLimit] = useState('')

  const usedCategoryIds = new Set(budgets.map(b => b.category_id))
  const availableCategories = categories.filter(c => !usedCategoryIds.has(c.id))

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const parsedLimit = parseFloat(limit)
    if (!catId || isNaN(parsedLimit) || parsedLimit <= 0) { toast.error('Please fill all fields'); return }
    startTransition(async () => {
      const result = await createBudget({ category_id: catId, limit_amount: parsedLimit, period: 'monthly' })
      if (result.success) { toast.success('Budget created!'); setShowForm(false); setCatId(''); setLimit('') }
      else toast.error(result.error)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this budget?')) return
    startTransition(async () => {
      const result = await deleteBudget(id)
      if (result.success) toast.success('Budget deleted')
      else toast.error(result.error)
    })
  }

  return (
    <div className="space-y-4">
      {/* Create form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base">Monthly Budgets</CardTitle>
          {availableCategories.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Budget
            </Button>
          )}
        </CardHeader>
        {showForm && (
          <CardContent className="border-t border-border pt-4">
            <form onSubmit={handleCreate} className="flex gap-3 items-end flex-wrap">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={catId} onValueChange={(v) => v && setCatId(v)}>
                  <SelectTrigger className="w-48">
                    {catId ? (
                      <span className="flex items-center gap-2 text-sm">
                        <span>{availableCategories.find(c => c.id === catId)?.icon}</span>
                        <span className="truncate">{availableCategories.find(c => c.id === catId)?.name}</span>
                      </span>
                    ) : (
                      <SelectValue placeholder="Pick category" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span>{c.icon}</span>
                          <span>{c.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Monthly Limit</Label>
                <Input type="number" placeholder="5000" step="0.01" min="1"
                  value={limit} onChange={e => setLimit(e.target.value)} className="w-36" />
              </div>
              <Button type="submit" disabled={isPending} className="gap-1.5">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🎯</div>
          <p className="font-medium">No budgets yet</p>
          <p className="text-sm">Create budgets to track spending per category</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget, i) => {
            const status = budget.status ?? 'safe'
            const pct = budget.percentage ?? 0
            const config = STATUS_CONFIG[status]
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="card-hover border-border/60 bg-card/45">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{budget.category?.icon ?? '📦'}</span>
                        <div>
                          <p className="font-bold tracking-tight text-foreground">{budget.category?.name ?? 'Unknown'}</p>
                          <Badge variant="outline" className={cn('text-xs mt-0.5 tracking-tight font-semibold border-current/10', config.badge)}>{config.label}</Badge>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive active:scale-95"
                        onClick={() => handleDelete(budget.id)}>
                         <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Spent</span>
                        <span className={cn('font-bold', config.color)}>{pct}%</span>
                      </div>
                      <div className="h-2.5 bg-muted/40 dark:bg-muted/15 rounded-full overflow-hidden border border-border/10">
                        <motion.div
                          className={cn('h-full rounded-full', config.barColor)}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ duration: 0.8, delay: i * 0.07 + 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(budget.spent_amount, currency)} spent</span>
                        <span>{formatCurrency(budget.limit_amount, currency)} limit</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

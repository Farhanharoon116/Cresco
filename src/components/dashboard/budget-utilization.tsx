'use client'

import { cn } from '@/lib/utils'

interface Budget {
  id: string
  limit_amount: number
  spent_amount: number
  category: { name: string; icon: string; color: string } | null
}

export function BudgetUtilizationChart({ budgets }: { budgets: Budget[] }) {
  return (
    <div className="metric-card rounded-xl p-5">
      <h3 className="text-sm font-bold tracking-tight text-foreground mb-4">Budget Utilization</h3>
      <div className="space-y-4">
        {budgets.map((b) => {
          const pct = b.limit_amount > 0
            ? Math.min(Math.round((b.spent_amount / b.limit_amount) * 100), 100)
            : 0
          const status = pct >= 100 ? 'exceeded' : pct >= 90 ? 'danger' : pct >= 75 ? 'warning' : 'safe'
          const barColor = {
            exceeded: 'bg-red-500',
            danger: 'bg-orange-400',
            warning: 'bg-amber-400',
            safe: 'bg-primary',
          }[status]
          const labelColor = {
            exceeded: 'text-red-400',
            danger: 'text-orange-400',
            warning: 'text-amber-400',
            safe: 'text-primary',
          }[status]

          return (
            <div key={b.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span>{b.category?.icon}</span>
                  <span>{b.category?.name ?? 'Unknown'}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {b.spent_amount} / {b.limit_amount}
                  </span>
                  <span className={cn('font-black text-xs', labelColor)}>{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', barColor)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

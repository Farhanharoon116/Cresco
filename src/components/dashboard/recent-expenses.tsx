'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import type { Expense } from '@/types/database'
import { motion } from 'motion/react'

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': '🍽️',
  'Transport': '🚌',
  'Education': '📚',
  'Shopping': '🛍️',
  'Entertainment': '🎮',
  'Subscriptions': '📱',
  'Health': '💊',
  'Other': '📦',
}

export function RecentExpenses({ expenses, currency = 'USD' }: { expenses: Expense[]; currency?: string }) {
  return (
    <div className="metric-card rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-muted flex items-center justify-center">
            <div className="w-2.5 h-0.5 bg-muted-foreground rounded-full" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-foreground">Recent transactions</h3>
        </div>
        <Link
          href="/expenses"
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          No expenses yet. Add your first one!
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-border/50">
          {expenses.slice(0, 5).map((e, i) => {
            const icon = e.category?.icon ?? CATEGORY_ICONS[e.category?.name ?? ''] ?? '📦'
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-3"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted text-base flex-shrink-0">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {e.merchant ?? e.description ?? 'Expense'}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatRelativeDate(e.expense_date)}</p>
                </div>
                <span className="font-bold text-sm flex-shrink-0 text-red-400">
                  -{formatCurrency(e.amount, currency)}
                </span>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

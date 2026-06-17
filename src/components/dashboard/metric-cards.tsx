'use client'

import { motion } from 'motion/react'
import { TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { DashboardSummary } from '@/types/database'
import type { Currency } from '@/types/database'

interface MetricCardsProps {
  summary: DashboardSummary | null
  latestForecast?: { predicted_balance: number; risk_level: string } | null
  currency?: Currency
  userName?: string | null
}

export function DashboardMetrics({ summary, currency = 'USD' }: MetricCardsProps) {
  const spentPct = summary
    ? Math.round((summary.total_spent / Math.max(summary.monthly_income, 1)) * 100)
    : 0

  const goalsPct = 68 // placeholder until we wire in goals data

  const metrics = [
    {
      title: 'BALANCE',
      value: summary ? formatCurrency(summary.remaining_budget + summary.total_spent, currency) : '—',
      sub: summary ? `+${spentPct > 50 ? Math.max(0, 100 - spentPct) : spentPct}% from last month` : 'No data yet',
      subColor: 'text-emerald-400',
      icon: Wallet,
      id: 'balance-card',
    },
    {
      title: 'MONTHLY SPEND',
      value: summary ? formatCurrency(summary.total_spent, currency) : '—',
      sub: summary ? `⚠ ${summary.days_remaining} days left` : '—',
      subColor: 'text-amber-400',
      icon: TrendingDown,
      id: 'monthly-spend-card',
    },
    {
      title: 'SAFE TO SPEND',
      value: summary
        ? formatCurrency(Math.max(0, summary.remaining_budget / Math.max(summary.days_remaining, 1)), currency)
        : '—',
      sub: 'AI estimate',
      subColor: 'text-primary',
      icon: TrendingUp,
      id: 'safe-spend-card',
    },
    {
      title: 'GOALS PROGRESS',
      value: `${goalsPct}%`,
      sub: '3 active',
      subColor: 'text-primary',
      icon: Target,
      id: 'goals-card',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.title}
          id={metric.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.35 }}
        >
          <div className="metric-card rounded-xl p-5 h-full">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              {metric.title}
            </p>
            <p className="text-2xl md:text-3xl font-black tracking-tight text-foreground mt-1 leading-none">
              {metric.value}
            </p>
            <p className={`text-xs font-semibold mt-2.5 flex items-center gap-1 ${metric.subColor}`}>
              {metric.title === 'BALANCE' && <ArrowUpRight className="h-3 w-3" />}
              {metric.sub}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

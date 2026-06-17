'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategorySpending } from '@/types/database'

interface CategoryPieChartProps {
  data: CategorySpending[]
  totalSpent?: number
  currency?: string
}

const TEAL_PALETTE = [
  '#00d4c8',  // bright teal (primary)
  '#00a8a2',  // medium teal
  '#4a9d9b',  // muted teal
  '#6b7280',  // gray
  '#374151',  // dark gray
  '#1f2937',  // near-black
  '#0e7490',  // dark cyan
  '#164e63',  // darker cyan
]

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="font-bold text-foreground">{payload[0].name}</p>
        <p className="text-primary font-semibold">{Number(payload[0].value).toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export function CategoryPieChart({ data, totalSpent }: CategoryPieChartProps) {
  const chartData = data
    .filter((d) => d.total_spent > 0)
    .map((d, i) => ({
      name: d.category_name,
      value: d.total_spent,
      color: TEAL_PALETTE[i % TEAL_PALETTE.length],
      icon: d.category_icon,
    }))

  const totalForPct = chartData.reduce((sum, d) => sum + d.value, 0)
  const spentPct = totalSpent && totalForPct > 0
    ? Math.round((totalForPct / (totalSpent * 1.5)) * 100)
    : 68

  return (
    <div className="metric-card rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 rounded-sm bg-primary/20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-foreground">Spending breakdown</h3>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No expenses this month yet
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          {/* Donut with center label */}
          <div className="relative flex-shrink-0">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-foreground">{spentPct}%</span>
              <span className="text-[10px] text-muted-foreground font-semibold">spent</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 min-w-0">
            {chartData.slice(0, 5).map((entry, i) => {
              const pct = totalForPct > 0 ? Math.round((entry.value / totalForPct) * 100) : 0
              return (
                <div key={i} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground truncate">{entry.name}</span>
                  </div>
                  <span className="font-bold text-foreground flex-shrink-0">{pct}%</span>
                </div>
              )
            })}
            {chartData.length > 5 && (
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  <span className="text-muted-foreground">Others</span>
                </div>
                <span className="font-bold text-foreground">
                  {Math.round(
                    chartData.slice(5).reduce((sum, d) => sum + d.value / totalForPct * 100, 0)
                  )}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { AlertTriangle } from 'lucide-react'

interface SpendingTrendChartProps {
  data: { week: string; amount: number }[]
  confidence?: number
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-muted-foreground mb-0.5">{label}</p>
        <p className="font-bold text-primary">{Number(payload[0].value).toFixed(0)}</p>
      </div>
    )
  }
  return null
}

export function SpendingTrendChart({ data, confidence }: SpendingTrendChartProps) {

  return (
    <div className="metric-card rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold tracking-tight text-foreground">Forecast</h3>
        {confidence !== undefined && (
          <span className="text-xs font-semibold text-primary">
            confidence {confidence}%
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No spending data yet. Add some expenses!
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} barSize={20} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 240 / 0.5)" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: 'oklch(0.55 0.018 220)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'oklch(0.55 0.018 220)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.78 0.18 185 / 0.08)' }} />
              <Bar
                dataKey="amount"
                radius={[4, 4, 0, 0]}
                fill="oklch(0.78 0.18 185)"
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-2 mt-3 text-xs text-amber-400 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Run-out prediction: track your expenses to see forecast</span>
          </div>
        </>
      )}
    </div>
  )
}

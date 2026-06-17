'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, Target, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { getHealthScoreColor, getHealthScoreLabel } from '@/lib/utils'

interface Anomaly {
  expense_id: string
  amount: number
  reason: string
  severity: 'info' | 'warning' | 'critical'
}

interface AIInsightsPanelProps {
  goals: { id: string; name: string; target_amount: number; current_amount: number; icon: string }[]
  currency?: string
}

const SEVERITY_CONFIG = {
  info: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', label: 'Note' },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'Warning' },
  critical: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', label: 'Critical' },
}

export function AIInsightsPanel({ goals, currency = 'USD' }: AIInsightsPanelProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    health_score: number
    summary: string
    key_findings: string[]
    action_items: string[]
    anomalies?: Anomaly[]
  } | null>(null)

  async function analyzeFinances() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/analyze', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
        toast.success('Financial analysis complete!')
      } else {
        toast.error(data.error ?? 'Analysis failed')
      }
    } catch {
      toast.error('Could not connect to AI. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = result ? getHealthScoreColor(result.health_score) : ''
  const scoreLabel = result ? getHealthScoreLabel(result.health_score) : ''
  const anomalies = result?.anomalies ?? []

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* AI Coach Card */}
        <div className="metric-card rounded-xl p-5 h-full">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Financial Coach
            </h3>
            <Button size="sm" onClick={analyzeFinances} disabled={loading} className="gap-1.5 active:scale-95 transition-transform duration-200">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {loading ? 'Analyzing...' : 'Analyze My Finances'}
            </Button>
          </div>
          <div>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Health Score */}
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl font-black ${scoreColor} tracking-tight`}>{result.health_score}</div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">Financial Health — {scoreLabel}</p>
                      <Progress value={result.health_score} className="w-32 h-2 mt-1.5" />
                    </div>
                  </div>
 
                  {/* Summary */}
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{result.summary}</p>
 
                  {/* Key Findings */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      Key Findings
                    </p>
                    <ul className="space-y-1.5">
                      {result.key_findings.map((f, i) => (
                        <li key={i} className="text-xs text-muted-foreground font-medium flex gap-2">
                          <span className="text-primary mt-0.5 flex-shrink-0 font-bold">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
 
                  {/* Action Items */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Action Items
                    </p>
                    <ul className="space-y-1.5">
                      {result.action_items.map((a, i) => (
                        <li key={i} className="text-xs text-muted-foreground font-medium flex gap-2">
                          <span className="text-emerald-400 mt-0.5 flex-shrink-0 font-bold">→</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.p key="empty" className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Click &quot;Analyze My Finances&quot; to get a full AI-powered financial health analysis with personalized recommendations.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Savings Goals */}
        <div className="metric-card rounded-xl p-5 h-full">
          <div className="mb-4">
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2 text-foreground">
              <Target className="h-4 w-4 text-primary" />
              Savings Goals
            </h3>
          </div>
          <div>
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground font-medium">No active goals. Create one in the Goals section!</p>
            ) : (
              <div className="space-y-4">
                {goals.map((g) => {
                  const pct = g.target_amount > 0 ? Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100) : 0
                  return (
                    <div key={g.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 font-bold tracking-tight text-foreground">
                          <span>{g.icon}</span> {g.name}
                        </span>
                        <span className="text-primary font-bold text-xs">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <p className="text-xs text-muted-foreground font-medium">{g.current_amount} / {g.target_amount}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Anomaly Alerts — shown only after analysis */}
      <AnimatePresence>
        {anomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="metric-card rounded-xl border border-amber-500/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="text-base font-bold text-amber-400">
                  Anomalies Detected ({anomalies.length})
                </h3>
              </div>
              <div className="space-y-3">
                {anomalies.map((anomaly, i) => {
                  const cfg = SEVERITY_CONFIG[anomaly.severity] ?? SEVERITY_CONFIG.info
                  return (
                    <motion.div
                      key={anomaly.expense_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border border-current/10 ${cfg.bg}`}
                    >
                      <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-[9px] font-black tracking-wider uppercase border-current/15 ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </Badge>
                          <span className="text-xs font-bold text-foreground">{anomaly.amount} {currency}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{anomaly.reason}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
